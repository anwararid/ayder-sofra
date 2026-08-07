import {
  auth,
  db,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  doc,
  getDoc
} from "./firebase.js";

const form = document.querySelector("#form");
const msg = document.querySelector("#msg");
const button = form.querySelector("button");

function show(text) {
  msg.innerHTML = `<div class="error">${text}</div>`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  button.disabled = true;
  button.textContent = "Giriş yapılıyor...";
  msg.innerHTML = "";

  try {
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#pass").value;

    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = result.user.uid;

    msg.innerHTML = `
      <div class="notice">
        Firebase giriş başarılı.<br>
        UID: ${uid}<br>
        Firestore kontrol ediliyor...
      </div>
    `;

    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      show(
        "Firebase girişi başarılı fakat users kaydı bulunamadı.<br>" +
        "Aranan UID: " + uid
      );
      button.disabled = false;
      button.textContent = "Giriş Yap";
      return;
    }

    const data = userSnap.data();

    msg.innerHTML = `
      <div class="notice">
        Kullanıcı bulundu.<br>
        Rol: ${data.role}
      </div>
    `;

    setTimeout(() => {
      if (data.role === "admin") {
        window.location.href = "./admin.html";
      } else if (data.role === "garson") {
        window.location.href = "./waiter.html";
      } else if (data.role === "mutfak") {
        window.location.href = "./kitchen.html";
      } else if (data.role === "firin") {
        window.location.href = "./oven.html";
      } else if (data.role === "izgara") {
        window.location.href = "./grill.html";
      } else {
        show("Geçersiz kullanıcı rolü: " + data.role);
        button.disabled = false;
        button.textContent = "Giriş Yap";
      }
    }, 1000);

  } catch (error) {

    console.error(error);

    show(
      "Hata:<br>" +
      error.code +
      "<br>" +
      error.message
    );

    button.disabled = false;
    button.textContent = "Giriş Yap";
  }
});
