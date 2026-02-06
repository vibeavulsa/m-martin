import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Project: m'martin
// Project ID: m-martin-estofados
// Project Number: 178643218861
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: `m-martin-estofados.firebaseapp.com`,
  projectId: "m-martin-estofados",
  storageBucket: `m-martin-estofados.firebasestorage.app`,
  messagingSenderId: "178643218861",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;
