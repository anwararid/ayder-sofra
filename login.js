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

    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    msg.innerHTML = `
      <div class="notice">
        Giriş başarılı!
      </div>
    `;

    button.textContent = "Başarılı";

    console.log("Firebase giriş başarılı:", result.user.uid);

  } catch (error) {

    console.error("Firebase Login Error:", error);

    msg.innerHTML = `
      <div class="error">
        <b>Hata:</b><br>
        ${error.code}<br>
        ${error.message}
      </div>
    `;

    button.disabled = false;
    button.textContent = "Giriş Yap";
  }
});
