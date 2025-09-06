// firebase.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, where, updateDoc, doc, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9Mlk_Jq-pCeS_RC5mFU7GO9919h1GXeQ",
  authDomain: "auraecogame.firebaseapp.com",
  projectId: "auraecogame",
  storageBucket: "auraecogame.firebasestorage.app",
  messagingSenderId: "123111744914",
  appId: "1:123111744914:web:f16ecb11f7c6b4ed798d4b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export firebase services to be used in other scripts
export { auth, db, signInAnonymously, collection, addDoc, getDocs, query, orderBy, limit, where, updateDoc, doc, deleteDoc, writeBatch };