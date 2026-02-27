import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseApiKey = import.meta.env.VITE_FIREBASE_APIKEY;

let auth = null;
let provider = null;

if (firebaseApiKey) {
  const firebaseConfig = {
    apiKey: firebaseApiKey,
    authDomain: "interview-5ff1c.firebaseapp.com",
    projectId: "interview-5ff1c",
    storageBucket: "interview-5ff1c.firebasestorage.app",
    messagingSenderId: "945300402859",
    appId: "1:945300402859:web:ce349247f52b3c84d9fdee",
    measurementId: "G-LP8Z3WN56X"
  };

  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
} else {
  console.warn("VITE_FIREBASE_APIKEY is missing. Google sign-in is disabled.");
}

export {auth , provider}
