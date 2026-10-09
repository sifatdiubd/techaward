import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyBFB4hX7XwojbDnrMKDE9HaEor6gPCaVuw",
  authDomain: "nta-2026-155ea.firebaseapp.com",
  projectId: "nta-2026-155ea",
  storageBucket: "nta-2026-155ea.firebasestorage.app",
  messagingSenderId: "897928417280",
  appId: "1:897928417280:web:6e6e2d9ea7a86c7057c8e5",
  measurementId: "G-K43R3MLSTP",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);

export const SUPER_ADMIN_EMAIL = "onewayschool.bd@gmail.com";
