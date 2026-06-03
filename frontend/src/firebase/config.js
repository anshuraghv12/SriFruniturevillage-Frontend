// src/firebase.js (OR src/firebase/index.js)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app = null;
let auth = null;

if (firebaseConfig && firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (err) {
    // Don't crash the app if Firebase keys are missing or invalid in dev
    // Log for debugging in the console
    // eslint-disable-next-line no-console
    console.warn('Firebase initialization failed:', err && err.message ? err.message : err);
    app = null;
    auth = null;
  }
} else {
  // eslint-disable-next-line no-console
  console.warn('Firebase not configured: VITE_FIREBASE_API_KEY missing');
}

export { app, auth };