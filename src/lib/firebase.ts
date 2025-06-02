
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID; // Optional

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  measurementId: measurementId,
};

let app;

// Check for essential Firebase config variables
if (!apiKey || !projectId) {
  const errorMessage = `CRITICAL Firebase Configuration Error:
    NEXT_PUBLIC_FIREBASE_API_KEY is ${apiKey ? "provided" : "MISSING"}
    NEXT_PUBLIC_FIREBASE_PROJECT_ID is ${projectId ? "provided" : "MISSING"}
    Please ensure these environment variables are set in your .env file or deployment environment.
    Firebase SDK will not be initialized. This will likely cause 'Internal Server Error' or other runtime errors.`;
  console.error(errorMessage);
  // Optionally, you could throw an error here to halt execution if Firebase is absolutely critical
  // throw new Error(errorMessage); 
  // For now, we'll let it proceed so other parts of the app might work if Firebase isn't immediately needed,
  // but the error is logged.
}


// Initialize Firebase
if (!getApps().length) {
  if (apiKey && projectId) { // Only attempt to initialize if critical vars are present
    app = initializeApp(firebaseConfig);
  } else {
    console.warn("Firebase SDK not initialized due to missing critical configuration (API Key or Project ID).");
    // Create a dummy app object or handle this case as per your app's requirements
    // For now, 'app' will remain undefined, and subsequent getAuth/getFirestore calls might fail.
  }
} else {
  app = getApp(); // If already initialized, use that app
}

// Defensive initialization of Firebase services
// These will likely fail if 'app' is not initialized, but this structure prevents immediate crashes
// if 'app' is undefined due to missing config. The actual error will occur when these services are used.
const auth = app ? getAuth(app) : null;
const firestore = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;

export { app, auth, firestore, storage };
