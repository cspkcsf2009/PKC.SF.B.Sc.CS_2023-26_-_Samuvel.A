import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_API_KEY,
  authDomain: process.env.VITE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_DATABASE_URL,
  projectId: process.env.VITE_PROJECT_ID,
  storageBucket: process.env.VITE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_ID,
  measurementId: process.env.VITE_MEASUREMENT_ID,
};

// Initialize Firebase with the provided configuration
const app = firebase.initializeApp(firebaseConfig);

// Get a reference to the Firebase Realtime Database
const database = app.database();

// Export the initialized database instance
export default database;
