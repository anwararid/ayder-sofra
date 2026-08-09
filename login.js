import {
  auth,
  db,
  signInWithEmailAndPassword,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
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
    const email = document
      .querySelector("#email")
      .value
      .trim()
      .toLowerCase();

    const password = document.querySelector("#pass").value;

    // 1. Firebase Authentication
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = result.user;
    const uid = user.uid;

    console.log("AUTH EMAIL:", user.email);
    console.log("AUTH UID:", uid);

    // 2. Önce UID ile ara
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    console.log("UID DOCUMENT EXISTS:", userSnap.exists());

    let data = null;

    if (userSnap.exists()) {
      data = userSnap.data();
      console.log("USER FOUND BY UID:", data);
    }

    // 3. UID ile bulunamadıysa email ile ara
    if (!data) {
      console.log("UID ile bulunamadı. Email ile aranıyor...");

      const usersRef = collection(db, "users");

      const q = query(
        usersRef,
        where("email", "==", user.email)
      );

      const querySnap = await getDocs(q);

      console.log(
        "EMAIL SEARCH COUNT:",
        querySnap.size
      );

      if (!querySnap.empty) {
        data = querySnap.docs[0].data();

        console.log(
          "USER FOUND BY EMAIL:",
          data
        );
      }
    }

    // 4. Hiçbir şekilde bulunamadı
    if (!data) {
      showMessage(`
        <strong>Kullanıcı kaydı bulunamadı.</strong>
        <br><br>
        UID: ${uid}
        <br>
        Email: ${user.email}
        <br>
        Firestore: users/${uid}
      `);

      button.disabled = false;
      button.textContent = "Giriş Yap";
      return;
    }

    // 5. Role
    const role = String(data.role || "")
      .trim()
      .toLowerCase();

    console.log("FINAL ROLE:", role);

    if (!role) {
      showMessage(`
        Kullanıcı bulundu fakat role alanı yok.
        <br><br>
        UID: ${uid}
      `);

      button.disabled = false;
      button.textContent = "Giriş Yap";
      return;
    }

    // 6. Dashboard
    goToDashboard(role);

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    showMessage(`
      <strong>Giriş başarısız</strong>
      <br><br>
      Kod: ${error.code || "Hata"}
      <br>
      ${error.message || ""}
    `);

    button.disabled = false;
    button.textContent = "Giriş Yap";
  }
});
