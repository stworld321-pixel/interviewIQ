
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interview-5ff1c.firebaseapp.com",
  projectId: "interview-5ff1c",
  storageBucket: "interview-5ff1c.firebasestorage.app",
  messagingSenderId: "945300402859",
  appId: "1:945300402859:web:ce349247f52b3c84d9fdee",
  measurementId: "G-LP8Z3WN56X"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth , provider}