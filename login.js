import { auth, db, signInWithEmailAndPassword, doc, getDoc } from "./firebase.js";

const form = document.querySelector("#form");
const msg = document.querySelector("#msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.innerHTML = "";

  try {
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#pass").value;

    // 1. تسجيل الدخول
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. جلب بيانات الدور (Role) من Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      msg.innerHTML = "هذا الحساب غير مسجل في قاعدة البيانات (users).";
      return;
    }

    const role = userDoc.data().role;

    // 3. التوجيه حسب الدور
    if (role === "admin") {
      window.location.href = "admin.html";
    } else if (role === "garson") {
      window.location.href = "index.html";
    } else if (role === "mutfak") {
      window.location.href = "kitchen.html";
    } else if (role === "firin") {
      window.location.href = "oven.html";
    } else if (role === "izgara") {
      window.location.href = "grill.html";
    } else {
      msg.innerHTML = "دور المستخدم غير معروف: " + role;
    }

  } catch (error) {
    console.error(error);
    msg.innerHTML = "خطأ في تسجيل الدخول: " + error.message;
  }
});
