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

  const page = pages[role];

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
  }, 500);
}


form.addEventListener("submit", async (event) => {

  event.preventDefault();

  button.disabled = true;
  button.textContent = "Giriş yapılıyor...";
  msg.innerHTML = "";

  try {

    const email =
      document
        .querySelector("#email")
        .value
        .trim();

    const password =
      document.querySelector("#pass").value;


    // Firebase Authentication
    const result =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user = result.user;
    const uid = user.uid;

    console.log("LOGIN EMAIL:", user.email);
    console.log("LOGIN UID:", uid);


    // Firestore users/{uid}
    const userRef =
      doc(db, "users", uid);

    const userSnap =
      await getDoc(userRef);


    console.log(
      "DOCUMENT EXISTS:",
      userSnap.exists()
    );


    if (!userSnap.exists()) {

      showMessage(`
        Kullanıcı kaydı bulunamadı.<br><br>
        UID: ${uid}
      `);

      button.disabled = false;
      button.textContent = "Giriş Yap";

      return;
    }


    const data =
      userSnap.data();

    console.log(
      "FIRESTORE DATA:",
      data
    );

    console.log(
      "ROLE:",
      data.role
    );


    // Role kontrolü
    goToDashboard(data.role);

  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );


    showMessage(`
      ${error.code || "Hata"}<br>
      ${error.message}
    `);

    button.disabled = false;
    button.textContent = "Giriş Yap";

  }

});
