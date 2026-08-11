import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// 1. تهيئة تطبيق Firebase
const app = initializeApp(firebaseConfig);

// 2. تهيئة خدمات Auth و Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// 3. تصدير الأدوات لاستخدامها في باقي الملفات
export {
  auth,
  db,
  signInWithEmailAndPassword,
  doc,
  getDoc,
  setDoc
};
