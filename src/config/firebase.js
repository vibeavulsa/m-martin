import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// Project: M'Martin Estofados
// These keys are safe to expose - security is enforced by Firebase Security Rules
const firebaseConfig = {
  apiKey: "AIzaSyDpM6q7Czf8o0EJ5NkyiWLoDJtEv2_ZEH8",
  authDomain: "m-martin-estofados.firebaseapp.com",
  projectId: "m-martin-estofados",
  storageBucket: "m-martin-estofados.firebasestorage.app",
  messagingSenderId: "178643218861",
  appId: "1:178643218861:web:be5595e381d3624ec97124",
  measurementId: "G-17R6CV7B47"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

export default app;
