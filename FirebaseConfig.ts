import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, Firestore, getFirestore } from "firebase/firestore";
import Constants from "expo-constants";

const USE_FIREBASE = true; // Change to true when needed - Development only

const useEmulator = process.env.NODE_ENV === "development"; // Use Firebase Emulator in development

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

// Initialize Firebase (only once)
app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
db = getFirestore(app);
auth = getAuth(app);

console.log("🔥 Connected to Firebase Production");

// if (useEmulator) {
//   const emulatorHost = "localhost";

//   connectFirestoreEmulator(db, emulatorHost, 8080);
//   //connectAuthEmulator(auth, `http://${emulatorHost}:9099`); // Add this if you are using Firebase Authentication
//   console.log("🔥 Connected to Firebase Emulators");
// } else {
//   console.log("🔥 Connected to Firebase Production");
// }

// Export variables (they will be undefined if USE_FIREBASE is false)
export { app, db, auth };
