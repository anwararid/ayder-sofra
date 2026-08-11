import {
  auth,
  db,
  signInWithEmailAndPassword,
  doc,
  getDoc
} from "./firebase.js";

const form = document.querySelector("#form");
const msg = document.querySelector("#msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.innerHTML = "";

  try {
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#pass").value;

    // تسجيل الدخول
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    console.log("========== LOGIN DEBUG ==========");
    console.log("EMAIL:", user.email);
    console.log("UID:", user.uid);
    console.log("PROJECT:", "ayder-sofra");

    // قراءة users/{uid}
    const userRef = doc(db, "users", user.uid);

    console.log("FIRESTORE PATH:", `users/${user.uid}`);

    const userDoc = await getDoc(userRef);

    console.log("DOCUMENT EXISTS:", userDoc.exists());

    if (!userDoc.exists()) {
      msg.innerHTML = `
        Kullanıcı kaydı bulunamadı.<br><br>
        UID: ${user.uid}<br>
        Firestore: users/${user.uid}
      `;
      return;
    }

    const data = userDoc.data();

    console.log("FIRESTORE DATA:", data);
    console.log("RAW ROLE:", data.role);

    const role = String(data.role || "")
      .trim()
      .toLowerCase();

    console.log("FINAL ROLE:", role);

    alert(
      "EMAIL: " + user.email +
      "\nUID: " + user.uid +
      "\nROLE: " + role
    );

    // التوجيه
    if (role === "admin") {
      window.location.href = "admin.html";
      return;
    }

    if (role === "garson") {
      window.location.href = "waiter.html";
      return;
    }

    if (role === "mutfak") {
      window.location.href = "kitchen.html";
      return;
    }

    if (role === "firin") {
      window.location.href = "oven.html";
      return;
    }

    if (role === "izgara") {
      window.location.href = "grill.html";
      return;
    }

    msg.innerHTML = `
      Kullanıcı rolü geçersiz: ${role || "tanımsız"}
    `;

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    msg.innerHTML = `
      ${error.code || "Hata"}<br>
      ${error.message}
    `;
  }
});
