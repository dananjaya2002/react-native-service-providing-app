import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "./firebasekey";

//console.log("🔥 FirebaseConfig.ts has been loaded!", new Error().stack);

const USE_FIREBASE = false; // Change to true when needed

let app, auth, db;

if (USE_FIREBASE) {
  app = initializeApp(firebaseConfig);
  console.log("🔥 Firebase initialized");
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  console.log("❌ Firebase is disabled");
}

export { auth, db, app };
