import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import Constants from "expo-constants";

const USE_FIREBASE = true; // Change to true when needed

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.FIREBASE_APP_ID,
  measurementId: Constants.expoConfig?.extra?.FIREBASE_MEASUREMENT_ID,
};

// Define variables before assignment
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (USE_FIREBASE) {
  // Ensure Firebase is initialized only once
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  console.log("🔥 Firebase initialized");
} else {
  console.log("❌ Firebase is disabled");
  // **Fallback empty objects to prevent undefined errors**
  app = {} as FirebaseApp;
  db = {} as Firestore;
  auth = {} as Auth;
}

// Export variables (they will be undefined if USE_FIREBASE is false)
export { app, db, auth };
