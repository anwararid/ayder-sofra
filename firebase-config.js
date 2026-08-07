// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyDhvLb2QMMe7dy-vQ_3bwKtZK5XXy8lbWM",
  authDomain: "ayder-sofra.firebaseapp.com",
  projectId: "ayder-sofra",
  storageBucket: "ayder-sofra.firebasestorage.app",
  messagingSenderId: "459245770853",
  appId: "1:459245770853:web:8d32163fef443a2b7c8e8c",
  measurementId: "G-5TWCFGPXYR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
