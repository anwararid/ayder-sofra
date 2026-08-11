import {
  auth,
  db,
  signInWithEmailAndPassword,
  doc,
  getDoc,
  signOut
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

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  button.disabled = true;
  button.textContent = "Giriş yapılıyor...";
  msg.innerHTML = "";

  try {
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#pass").value;

    // تسجيل الدخول
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = result.user;

    console.log("LOGIN EMAIL:", user.email);
    console.log("LOGIN UID:", user.uid);

    // قراءة users/{UID}
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    console.log("DOCUMENT EXISTS:", userSnap.exists());

    if (!userSnap.exists()) {
      showMessage(`
        Kullanıcı kaydı bulunamadı.<br><br>
        UID: ${user.uid}<br>
        Firestore: users/${user.uid}
      `);

      await signOut(auth);

      button.disabled = false;
      button.textContent = "Giriş Yap";
      return;
    }

    const data = userSnap.data();
    const role = String(data.role || "").trim().toLowerCase();

    console.log("FIRESTORE DATA:", data);
    console.log("USER ROLE:", role);
    alert("ROLE = " + role);

    // التوجيه حسب الدور
    const pages = {
      admin: "admin.html",
      garson: "index.html",
      mutfak: "kitchen.html",
      firin: "oven.html",
      izgara: "grill.html"
    };

    const page = pages[role];

    if (!page) {
      showMessage(`
        Geçersiz kullanıcı rolü: ${role || "tanımsız"}
      `);

      await signOut(auth);

      button.disabled = false;
      button.textContent = "Giriş Yap";
      return;
    }

    console.log("REDIRECT TO:", page);

    showMessage(
      `Giriş başarılı. ${role} paneline yönlendiriliyorsunuz...`,
      "notice"
    );

    setTimeout(() => {
      window.location.replace(page);
    }, 300);

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    showMessage(`
      ${error.code || "Hata"}<br>
      ${error.message}
    `);

    button.disabled = false;
    button.textContent = "Giriş Yap";
  }
});
