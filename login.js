import {
  auth,
  signInWithEmailAndPassword
} from "./firebase.js";

const form = document.querySelector("#form");
const msg = document.querySelector("#msg");
const button = form.querySelector("button");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#pass").value;

  button.disabled = true;
  button.textContent = "Giriş yapılıyor...";

  msg.innerHTML = "";

  try {
    const loginPromise = signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            "Firebase bağlantısı 15 saniye içinde yanıt vermedi."
          )
        );
      }, 15000);
    });

    const result = await Promise.race([
      loginPromise,
      timeoutPromise
    ]);

    msg.innerHTML = `
      <div class="notice">
        Giriş başarılı!
      </div>
    `;

    button.textContent = "Başarılı";

    console.log("Firebase UID:", result.user.uid);

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    msg.innerHTML = `
      <div class="error">
        <b>Giriş hatası</b><br><br>
        ${error.code || "unknown"}<br>
        ${error.message}
      </div>
    `;

    button.disabled = false;
    button.textContent = "Giriş Yap";
  }
});
