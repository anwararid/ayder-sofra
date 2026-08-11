import {
  auth,
  db,
  signInWithEmailAndPassword,
  doc,
  getDoc,
  setDoc
} from "./firebase.js";

const form = document.querySelector("#form");
const msg = document.querySelector("#msg");
const button = form.querySelector("button");

function showMessage(text, type = "error") {
  msg.innerHTML = `
    <div class="${type}">
      ${text}
    </div>
  `;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  button.disabled = true;
  button.textContent = "Giriş yapılıyor...";
  msg.innerHTML = "";

  try {
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#pass").value;

    // 1. تسجيل الدخول في Firebase Authentication
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = result.user;
    const uid = user.uid;

    console.log("========== LOGIN ==========");
    console.log("EMAIL:", user.email);
    console.log("UID:", uid);

    // 2. فحص وجود المستند في Firestore
    const userRef = doc(db, "users", uid);
    let userSnap = await getDoc(userRef);

    // 3. حل المشكلة: إذا كان المستند غير موجود، إنشائه تلقائياً
    if (!userSnap.exists()) {
      console.log("Document not found. Creating user document automatically...");
      
      const defaultData = {
        email: user.email,
        role: "admin", // يمكنك تغيير الدور الافتراضي هنا (admin, garson, mutfak, firin, izgara)
        createdAt: new Date().toISOString()
      };

      await setDoc(userRef, defaultData);
      
      // إعادة قراءة المستند بعد إنشائه
      userSnap = await getDoc(userRef);
    }

    // 4. قراءة بيانات المستخدم والتوجيه
    const data = userSnap.data();

    console.log("FIRESTORE DATA:", data);
    console.log("ROLE:", data.role);

    // GARSON
    if (data.role === "garson") {
      showMessage("Garson girişi başarılı. Yönlendiriliyor...", "notice");
      setTimeout(() => { window.location.href = "index.html"; }, 500);
      return;
    }

    // ADMIN
    if (data.role === "admin") {
      showMessage("Admin girişi başarılı. Yönlendiriliyor...", "notice");
      setTimeout(() => { window.location.href = "admin.html"; }, 500);
      return;
    }

    // MUTFAK
    if (data.role === "mutfak") {
      showMessage("Mutfak girişi başarılı. Yönlendiriliyor...", "notice");
      setTimeout(() => { window.location.href = "kitchen.html"; }, 500);
      return;
    }

    // FIRIN
    if (data.role === "firin") {
      showMessage("Fırın girişi başarılı. Yönlendiriliyor...", "notice");
      setTimeout(() => { window.location.href = "oven.html"; }, 500);
      return;
    }

    // IZGARA
    if (data.role === "izgara") {
      showMessage("Izgara girişi başarılı. Yönlendiriliyor...", "notice");
      setTimeout(() => { window.location.href = "grill.html"; }, 500);
      return;
    }

    // دور غير معروف
    showMessage(`Geçersiz kullanıcı rolü: ${data.role || "tanımsız"}`);
    button.disabled = false;
    button.textContent = "Giriş Yap";

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    showMessage(`
      ${error.code || "Hata"}<br>
      ${error.message || "Bilinmeyen hata"}
    `);

    button.disabled = false;
    button.textContent = "Giriş Yap";
  }
});
