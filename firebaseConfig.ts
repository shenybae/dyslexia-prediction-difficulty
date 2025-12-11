import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// REPLACE WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDQkb_C0nfBV40amjICzQuBqtUr4qNWbpc",
  authDomain: "multisensorylearning-b553b.firebaseapp.com",
  projectId: "multisensorylearning-b553b",
  storageBucket: "multisensorylearning-b553b.firebasestorage.app",
  messagingSenderId: "1034000458938",
  appId: "1:1034000458938:web:eb202a95faddaac0e6ce83",
  measurementId: "G-R7B9Z3KH8J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native Persistence
// Note: In newer Firebase SDKs, getReactNativePersistence is removed. 
// getAuth automatically configures persistence if @react-native-async-storage/async-storage is available.
export const auth = getAuth(app);

export const db = getFirestore(app);