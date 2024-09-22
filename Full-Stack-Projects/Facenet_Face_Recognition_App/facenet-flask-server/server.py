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

# Initialize logger
logger = setup_logger()

# Load environment variables
load_dotenv()
firebase_secret = os.getenv('FIREBASE_SECRET_KEY')
threshold = float(os.getenv('RECOGNITION_THRESHOLD', 0.5))

# Validate Firebase secret key
if not firebase_secret:
    logger.error("FIREBASE_SECRET_KEY not found in environment variables.")
    raise ValueError("FIREBASE_SECRET_KEY environment variable not set")

# Initialize Flask app
app = Flask(__name__)

# Initialize Firebase Admin SDK
try:
    cred = credentials.Certificate(firebase_secret)
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
        return known_encodings

    allowed_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.gif'}
    
    try:
        blobs = bucket.list_blobs(prefix='known_people/')
        for blob in blobs:
            if blob.name.endswith('/') and blob.name != 'known_people/':
                person_name = blob.name.split('/')[-2]
                person_images = []
                logger.info(f"Loading images for: {person_name}")
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

def recognize_faces_in_frame(frame, known_encodings):
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    boxes, _ = mtcnn.detect(rgb_frame)

    results = []
    if boxes is not None and len(boxes) > 0:  
        for box in boxes:
            face = rgb_frame[int(box[1]):int(box[3]), int(box[0]):int(box[2])]
            if face.size == 0:
                logger.warning("Detected face region is empty.")
                continue

            mtcnn_face = mtcnn(face)
            if mtcnn_face is None or len(mtcnn_face) == 0:
                logger.warning("No face detected in the cropped region.")
                continue

            face_embedding = model(mtcnn_face.to(device)).detach().cpu().numpy()
            name = get_face_name(face_embedding, known_encodings, threshold)

            results.append((box, name))
    else:
        logger.warning("No faces detected in the frame.")

    return results

def annotate_frame(frame, recognized_faces):
    for (box, name) in recognized_faces:
        cv2.rectangle(frame, (int(box[0]), int(box[1])), (int(box[2]), int(box[3])), (255, 0, 0), 2)
        cv2.putText(frame, name, (int(box[0]), int(box[1] - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)

def generate_frames():
    known_encodings = load_known_people_images_from_firebase()
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        logger.error("Failed to open video capture.")
        return

    while True:
        ret, frame = cap.read()
        if not ret or frame is None or frame.size == 0:
            logger.error("Failed to capture frame.")
            break

        recognized_faces = recognize_faces_in_frame(frame, known_encodings)
        annotate_frame(frame, recognized_faces)

        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)