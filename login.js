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

function showMessage(text) {
  msg.innerHTML = `
    <div class="error">
      ${text}
    </div>
  `;
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
    showMessage("Kullanıcı rolü tanımlanmamış.");
    return;
  }

  window.location.href = page;
}

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    return;
  }

  try {

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      showMessage("Personel hesabınız sisteme tanımlanmamış.");
      return;
    }

    const userData = userSnap.data();

    goToDashboard(userData.role);

  } catch (error) {

    console.error(error);

    showMessage(
      "Sistem bağlantısında bir hata oluştu."
    );
  }
});

form.addEventListener("submit", async (event) => {

  event.preventDefault();

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#pass").value;

  if (!email || !password) {
    showMessage("E-posta ve şifre giriniz.");
    return;
  }

  const button = form.querySelector("button");

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

    let message =
      "Giriş başarısız. E-posta veya şifreyi kontrol edin.";

    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {
      message =
        "E-posta veya şifre hatalı.";
    }

    if (error.code === "auth/too-many-requests") {
      message =
        "Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar deneyin.";
    }

    if (error.code === "auth/network-request-failed") {
      message =
        "İnternet bağlantınızı kontrol edin.";
    }

    showMessage(message);

    button.disabled = false;
    button.textContent = "Giriş Yap";
  }
});
