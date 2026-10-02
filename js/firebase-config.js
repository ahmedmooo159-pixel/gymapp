// js/firebase-config.js
// Pinned Firebase CDN ES Modules (v10.13.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Firebase configuration provided by the user
export const firebaseConfig = {
  apiKey: "AIzaSyAWcp2hQfugW7AUpA_hZxYeGePrkK_6azI",
  authDomain: "gymapp-d58bf.firebaseapp.com",
  projectId: "gymapp-d58bf",
  storageBucket: "gymapp-d58bf.firebasestorage.app",
  messagingSenderId: "919432358016",
  appId: "1:919432358016:web:26145b25d3a72502a9de65",
  measurementId: "G-CYVDJC1DC4"
};

// Initialize Firebase App, Auth, and Firestore
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
