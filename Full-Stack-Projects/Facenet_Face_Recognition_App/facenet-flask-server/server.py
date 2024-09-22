import os
import time
import pickle
from io import BytesIO
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, storage
import cv2
import numpy as np
import torch
from PIL import Image
from facenet_pytorch import MTCNN, InceptionResnetV1
from sklearn.metrics.pairwise import cosine_similarity
from flask import Flask, render_template, Response
from logger_config import setup_logger
import gc
from concurrent.futures import ThreadPoolExecutor

# Initialize logger
logger = setup_logger()

# Load environment variables
load_dotenv()
threshold = float(os.getenv('RECOGNITION_THRESHOLD', 0.5))

# Determine if running locally or in Render
firebase_secret_path = (
    '/etc/secrets/serviceAccountKey.json' if os.getenv('RENDER') == 'true' 
    else '../serviceAccountKey.json'
)

# Validate Firebase secret key file
if not os.path.exists(firebase_secret_path):
    logger.error(f"{firebase_secret_path} not found. Make sure the secret file is correctly set up.")
    raise FileNotFoundError(f"{firebase_secret_path} not found.")

# Initialize Flask app
app = Flask(__name__)

# Initialize Firebase Admin SDK
try:
    cred = credentials.Certificate(firebase_secret_path)
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'face-recognition-storage.appspot.com'
    })
    bucket = storage.bucket()
    logger.info("Firebase Admin SDK initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
    raise

# Initialize FaceNet models
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
mtcnn = MTCNN(keep_all=True, device=device)
model = InceptionResnetV1(pretrained='vggface2').eval().to(device)

# Create a thread pool
executor = ThreadPoolExecutor(max_workers=4)

def load_embeddings():
    local_cache_path = 'known_embeddings.pkl'
    known_encodings = {}

    if os.path.exists(local_cache_path):
        with open(local_cache_path, 'rb') as f:
            known_encodings = pickle.load(f)
        logger.info("Loaded embeddings from local cache.")
    else:
        try:
            blob = bucket.blob('embeddings/known_embeddings.pkl')
            if blob.exists():
                logger.info("Local cache not found. Downloading embeddings from Firebase.")
                img_bytes = blob.download_as_bytes()
                known_encodings = pickle.loads(img_bytes)
                save_embeddings(known_encodings)
                logger.info("Downloaded embeddings from Firebase and saved to local cache.")
            else:
                logger.error("No embeddings found in Firebase.")
        except Exception as e:
            logger.error(f"Error downloading embeddings from Firebase: {e}")

    return known_encodings

def save_embeddings(known_encodings):
    local_cache_path = 'known_embeddings.pkl'
    
    with open(local_cache_path, 'wb') as f:
        pickle.dump(known_encodings, f)

    try:
        blob = bucket.blob('embeddings/known_embeddings.pkl')
        blob.upload_from_filename(local_cache_path)
        logger.info("Saved embeddings to Firebase.")
    except Exception as e:
        logger.error(f"Error uploading embeddings to Firebase: {e}")

def load_known_people_images_from_firebase():
    known_encodings = load_embeddings()
    if known_encodings:
        logger.info("Using cached known encodings.")
        return known_encodings

    allowed_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.gif'}
    
    try:
        blobs = bucket.list_blobs(prefix='known_people/')
        for blob in blobs:
            if blob.name.endswith('/') and blob.name != 'known_people/':
                person_name = blob.name.split('/')[-2]
                logger.info(f"Loading images for: {person_name}")
                person_images = []

                person_blobs = bucket.list_blobs(prefix=f'{blob.name}')
                for person_blob in person_blobs:
                    file_extension = os.path.splitext(person_blob.name)[1].lower()
                    if file_extension in allowed_extensions:
                        try:
                            logger.info(f"  Recognized {person_name} from {person_blob.name}")
                            img_bytes = person_blob.download_as_bytes()
                            img = Image.open(BytesIO(img_bytes)).convert("RGB")

                            img_cropped = mtcnn(img)
                            if img_cropped is not None and len(img_cropped) > 0:
                                with torch.no_grad():
                                    embedding = model(img_cropped.to(device)).detach().cpu().numpy()
                                person_images.append((embedding, person_blob.name.split("/")[-1]))
                            else:
                                logger.warning(f"No face found in image: {person_blob.name}")
                        except Exception as e:
                            logger.error(f"Error processing image {person_blob.name}: {e}")

                known_encodings[person_name] = person_images
                logger.info(f"Loaded {len(person_images)} images for {person_name}.")
                
                del person_images
                gc.collect()

        logger.info("Finished loading known people images.")
        save_embeddings(known_encodings)
        return known_encodings

    except Exception as e:
        logger.error(f"Error loading known people images: {e}")
        return {}

def get_face_name(face_embedding, known_embeddings, threshold):
    for name, encodings in known_embeddings.items():
        for known_embedding, _ in encodings:
            if face_embedding.shape != known_embedding.shape:
                logger.warning(f"Embedding shape mismatch: {face_embedding.shape} vs {known_embedding.shape}")
                continue
            
            similarity = cosine_similarity(face_embedding.reshape(1, -1), known_embedding.reshape(1, -1))[0][0]
            if similarity >= threshold:
                return name
    return "Unknown"

def process_face(face, known_encodings):
    try:
        mtcnn_face = mtcnn(face)
        if mtcnn_face is None or len(mtcnn_face) == 0:
            # logger.warning("No face detected in the cropped region.")
            return None

        face_embedding = model(mtcnn_face.to(device)).detach().cpu().numpy()
        name = get_face_name(face_embedding, known_encodings, threshold)

        return name
    except Exception as e:
        logger.error(f"Error processing face: {e}")
        return None

def recognize_faces_in_frame(frame, known_encodings):
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    boxes, _ = mtcnn.detect(rgb_frame)

    results = []
    if boxes is not None and len(boxes) > 0:
        faces = [rgb_frame[int(box[1]):int(box[3]), int(box[0]):int(box[2])] for box in boxes]
        
        # Use ThreadPoolExecutor to process faces in parallel
        names = list(executor.map(lambda face: process_face(face, known_encodings), faces))
        
        results = [(box, name) for box, name in zip(boxes, names) if name is not None]

    del rgb_frame, boxes
    gc.collect()

    return results

def annotate_frame(frame, recognized_faces):
    overlay = frame.copy()
    
    for (box, name) in recognized_faces:
        color = (0, 0, 255) if name == "Unknown" else (0, 255, 0)

        x1, y1, x2, y2 = map(int, box)
        cv2.rectangle(overlay, (x1, y1), (x2, y2), color, 2, cv2.LINE_AA)

        font_scale = max(0.7, min(1.2, (y2 - y1) / 150))
        thickness = 2
        
        text_size, _ = cv2.getTextSize(name, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)
        text_w, text_h = text_size
        text_x = x1
        text_y = y1 - 15 if y1 > text_h + 15 else y2 + text_h + 15

        padding = 5
        cv2.rectangle(overlay, 
                      (text_x - padding, text_y - text_h - padding), 
                      (text_x + text_w + padding, text_y + padding), 
                      (0, 0, 0), 
                      -1)

        text_color = (255, 255, 255)
        cv2.putText(overlay, name, (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 
                    font_scale, text_color, thickness, cv2.LINE_AA)

    cv2.addWeighted(frame, 0.6, overlay, 0.4, 0, frame)

    return frame

def generate_frames():
    known_encodings = load_known_people_images_from_firebase()
    video_capture = cv2.VideoCapture(0)
    
    frame_rate = 30
    prev = 0

    while True:
        time_elapsed = time.time() - prev
        success, frame = video_capture.read()

        if not success:
            logger.error("Failed to capture video frame.")
            break

        if time_elapsed > 1./frame_rate:
            prev = time.time()

            # Resize frame for faster processing
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)

            recognized_faces = recognize_faces_in_frame(small_frame, known_encodings)
            recognized_faces = [(box * 4, name) for box, name in recognized_faces]

            frame = annotate_frame(frame, recognized_faces)

            _, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    video_capture.release()
    cv2.destroyAllWindows()

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    try:
        app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), threaded=True)
    except Exception as e:
        logger.error(f"Error starting Flask app: {e}")
