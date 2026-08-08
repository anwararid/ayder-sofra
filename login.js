import {
  auth,
  db,
  signInWithEmailAndPassword,
  doc,
  getDoc
} from "./firebase.js";

const form = document.querySelector("#form");
const msg = document.querySelector("#msg");
const button = form.querySelector("button");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

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

    console.log("LOGIN UID:", uid);

    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    console.log("DOCUMENT EXISTS:", userSnap.exists());

    if (!userSnap.exists()) {
      msg.innerHTML = `
        <div class="error">
          Kullanıcı kaydı bulunamadı.
        </div>
      `;
      button.disabled = false;
      button.textContent = "Giriş Yap";
      return;
    }

    const data = userSnap.data();

    console.log("FIRESTORE DATA:", data);
    console.log("ROLE:", data.role);

    if (data.role === "admin") {
      msg.innerHTML = `
        <div class="notice">
          Admin girişi başarılı. Yönlendiriliyor...
        </div>
      `;

      setTimeout(() => {
        window.location.href = "admin.html";
      }, 500);

      return;
    }

    msg.innerHTML = `
      <div class="error">
        Geçersiz kullanıcı rolü: ${data.role}
      </div>
    `;

    button.disabled = false;
    button.textContent = "Giriş Yap";

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    msg.innerHTML = `
      <div class="error">
        ${error.code || "Hata"}<br>
        ${error.message}
      </div>
    `;

    button.disabled = false;
    button.textContent = "Giriş Yap";
  }
});
