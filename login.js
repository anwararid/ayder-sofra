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

  }, 700);

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


    /*
      1. FIREBASE AUTHENTICATION
    */

    const result =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user = result.user;
    const uid = user.uid;


    console.log(
      "=== AUTHENTICATION ==="
    );

    console.log(
      "Email:",
      user.email
    );

    console.log(
      "UID:",
      uid
    );


    /*
      2. FIREBASE PROJECT
    */

    console.log(
      "=== FIREBASE PROJECT ==="
    );

    console.log(
      "Project ID:",
      firebaseConfig.projectId
    );

    console.log(
      "Auth Domain:",
      firebaseConfig.authDomain
    );


    /*
      3. FIRESTORE DOCUMENT
    */

    const path =
      `users/${uid}`;


    console.log(
      "=== FIRESTORE ==="
    );

    console.log(
      "Path:",
      path
    );


    const userRef =
      doc(
        db,
        "users",
        uid
      );


    let userSnap;


    try {

      userSnap =
        await getDoc(userRef);

    } catch (firestoreError) {

      console.error(
        "FIRESTORE READ ERROR:",
        firestoreError
      );


      showMessage(`
        <strong>Firestore okuma hatası</strong><br><br>

        Kod:
        ${firestoreError.code || "bilinmiyor"}
        <br><br>

        Mesaj:
        ${firestoreError.message || "bilinmiyor"}
        <br><br>

        UID:
        ${uid}
        <br><br>

        Project:
        ${firebaseConfig.projectId}
      `);


      button.disabled = false;
      button.textContent = "Giriş Yap";

      return;
    }


    console.log(
      "Document exists:",
      userSnap.exists()
    );


    /*
      4. DOCUMENT YOK
    */

    if (!userSnap.exists()) {

      showMessage(`
        <strong>Kullanıcı kaydı bulunamadı.</strong>
        <br><br>

        UID:
        ${uid}

        <br><br>

        Firestore:
        users/${uid}

        <br><br>

        Firebase Project:
        ${firebaseConfig.projectId}
      `);


      button.disabled = false;
      button.textContent = "Giriş Yap";

      return;
    }


    /*
      5. USER DATA
    */

    const data =
      userSnap.data();


    console.log(
      "=== FIRESTORE DATA ==="
    );

    console.log(
      data
    );

    console.log(
      "NAME:",
      data.name
    );

    console.log(
      "EMAIL:",
      data.email
    );

    console.log(
      "ROLE:",
      data.role
    );


    /*
      6. ROLE
    */

    if (!data.role) {

      showMessage(`
        <strong>Rol bulunamadı.</strong>
        <br><br>

        UID:
        ${uid}

        <br><br>

        Firestore belgesinde
        <strong>role</strong>
        alanı bulunmuyor.
      `);


      button.disabled = false;
      button.textContent = "Giriş Yap";

      return;
    }


    /*
      7. DASHBOARD
    */

    goToDashboard(
      String(data.role)
        .trim()
        .toLowerCase()
    );


  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );


    showMessage(`
      <strong>Giriş başarısız</strong>
      <br><br>

      Kod:
      ${error.code || "Hata"}

      <br><br>

      ${error.message || ""}
    `);


    button.disabled = false;
    button.textContent = "Giriş Yap";

  }

});
