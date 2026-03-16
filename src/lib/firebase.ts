import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Replace with your Firebase config from the console
const firebaseConfig = {
  apiKey: "AIzaSyDWYf5L0WIXfFDwGv1cXV_3PNLt5Opj_LE",
  authDomain: "task-app-tracker-78605.firebaseapp.com",
  projectId: "task-app-tracker-78605",
  storageBucket: "task-app-tracker-78605.firebasestorage.app",
  messagingSenderId: "387572408607",
  appId: "1:387572408607:web:9826c08e82f65e6702902a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);