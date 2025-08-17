// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD6wBJfIkAR5_58GUiMQxk14R9wChXamz0",
  authDomain: "greencart-40931.firebaseapp.com",
  projectId: "greencart-40931",
  storageBucket: "greencart-40931.firebasestorage.app",
  messagingSenderId: "389963347182",
  appId: "1:389963347182:web:898fc29726e97ebbdeefff"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;