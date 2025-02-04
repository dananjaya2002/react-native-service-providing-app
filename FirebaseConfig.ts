import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firebaseConfig from "./firebasekey";




// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("firebase config", firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);


export { auth };
