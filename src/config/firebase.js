import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Validate required environment variables
const VITE_FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const VITE_FIREBASE_APP_ID = import.meta.env.VITE_FIREBASE_APP_ID;

// Check if environment variables are configured
if (!VITE_FIREBASE_API_KEY || VITE_FIREBASE_API_KEY === 'YOUR_API_KEY' || VITE_FIREBASE_API_KEY === 'your_api_key_here') {
  console.error(
    '❌ FIREBASE CONFIGURATION ERROR\n\n' +
    'Missing or invalid VITE_FIREBASE_API_KEY environment variable.\n\n' +
    'To fix this:\n' +
    '1. Copy .env.example to .env\n' +
    '2. Add your Firebase credentials to the .env file\n' +
    '3. Restart the development server\n\n' +
    'See SETUP_INSTRUCTIONS.md for detailed setup guide.'
  );
}

if (!VITE_FIREBASE_APP_ID || VITE_FIREBASE_APP_ID === 'YOUR_APP_ID' || VITE_FIREBASE_APP_ID === 'your_app_id_here') {
  console.error(
    '❌ FIREBASE CONFIGURATION ERROR\n\n' +
    'Missing or invalid VITE_FIREBASE_APP_ID environment variable.\n\n' +
    'To fix this:\n' +
    '1. Copy .env.example to .env\n' +
    '2. Add your Firebase credentials to the .env file\n' +
    '3. Restart the development server\n\n' +
    'See SETUP_INSTRUCTIONS.md for detailed setup guide.'
  );
}

// Firebase configuration
// Project: m'martin
// Project ID: m-martin-estofados
// Project Number: 178643218861
const firebaseConfig = {
  apiKey: VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: "m-martin-estofados.firebaseapp.com",
  projectId: "m-martin-estofados",
  storageBucket: "m-martin-estofados.firebasestorage.app",
  messagingSenderId: "178643218861",
  appId: VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
  measurementId: "G-17R6CV7B47"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
export const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;
