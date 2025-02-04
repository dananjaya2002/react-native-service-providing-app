import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyXvO9_otbNLa0_oW2YDg4fTohsfHybSA",
  authDomain: "my-app-1-e6897.firebaseapp.com",
  projectId: "my-app-1-e6897",
  storageBucket: "my-app-1-e6897.firebasestorage.app",
  messagingSenderId: "235457140252",
  appId: "1:235457140252:web:935eabf6e7bf73bb8831d9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);


export { auth };
