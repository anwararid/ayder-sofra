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

function showMessage(text) {
  msg.innerHTML = `<div class="error">${text}</div>`;
}

function goToDashboard(role) {
  const pages = {
    admin: "admin.html",
    garson: "waiter.html",
    mutfak: "kitchen.html",
    firin: "oven.html",
    izgara: "grill.html"
  };

  const page = pages[role];

  if (!page) {
    showMessage("Kullanıcı rolü bulunamadı: " + role);
    button.disabled = false;
    button.textContent = "Giriş Yap";
    return;
  }

  window.location.href = page;
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      showMessage("Personel hesabı Firestore'da bulunamadı.");
      button.disabled = false;
      button.textContent = "Giriş Yap";
      return;
    }

    const userData = userSnap.data();

    goToDashboard(userData.role);

  } catch (error) {
    console.error(error);

    showMessage(
      "Kullanıcı bilgileri alınamadı: " + error.message
    );

    button.disabled = false;
    button.textContent = "Giriş Yap";
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#pass").value;

  button.disabled = true;
  button.textContent = "Giriş yapılıyor...";
  msg.innerHTML = "";

  try {
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  } catch (error) {
    console.error(error);

    showMessage(
      "Giriş başarısız: " + error.message
    );

    button.disabled = false;
    button.textContent = "Giriş Yap";
  }
});
