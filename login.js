import {
  auth,
  db,
  signInWithEmailAndPassword,
  doc,
  getDoc
} from "./firebase.js";

import { firebaseConfig } from "./firebase-config.js";

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

function goToDashboard(role) {
  const pages = {
    admin: "admin.html",
    garson: "index.html",
    mutfak: "kitchen.html",
    firin: "oven.html",
    izgara: "grill.html"
  };

  const page = pages[String(role).trim().toLowerCase()];

  if (!page) {
    showMessage(
      `Geçersiz kullanıcı rolü: ${role || "tanımsız"}`,
      "error"
    );
    button.disabled = false;
    button.textContent = "Giriş Yap";
    return;
  }

  showMessage(
    "Giriş başarılı. Yönlendiriliyor...",
    "notice"
  );

  setTimeout(() => {
    window.location.href = page;
  }, 700);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  button.disabled = true;
  button.textContent = "Giriş yapılıyor...";
  msg.innerHTML = "";

  try {
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#pass").value;

    // Firebase Authentication
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = result.user;
    const uid = user.uid;

    console.log("AUTH UID:", uid);
    console.log("PROJECT:", firebaseConfig.projectId);

    // Firestore
    const userRef = doc(db, "users", uid);

    console.log("FIRESTORE PATH:", `users/${uid}`);

    const userSnap = await getDoc(userRef);

    console.log("EXISTS:", userSnap.exists());

    if (!userSnap.exists()) {
      showMessage(`
        <strong>Kullanıcı kaydı bulunamadı.</strong>
        <br><br>
        UID: ${uid}
        <br>
        Firestore: users/${uid}
        <br>
        Firebase Project: ${firebaseConfig.projectId}
      `);

      button.disabled = false;
      button.textContent = "Giriş Yap";
      return;
    }

    const data = userSnap.data();

    console.log("USER DATA:", data);

    const role = String(data.role || "")
      .trim()
      .toLowerCase();

    if (!role) {
      showMessage(`
        <strong>Kullanıcı rolü bulunamadı.</strong>
        <br><br>
        UID: ${uid}
      `);

      button.disabled = false;
      button.textContent = "Giriş Yap";
      return;
    }

    goToDashboard(role);

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    showMessage(`
      <strong>Giriş başarısız</strong>
      <br><br>
      Kod: ${error.code || "Hata"}
      <br><br>
      ${error.message || ""}
    `);

    button.disabled = false;
    button.textContent = "Giriş Yap";
  }
});
