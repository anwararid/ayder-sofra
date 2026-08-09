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

    console.log("LOGIN EMAIL:", user.email);
    console.log("LOGIN UID:", uid);

    let data = null;

    // ------------------------------------------------
    // 2. أولاً: البحث بواسطة UID
    // users/{uid}
    // ------------------------------------------------

    const uidRef = doc(db, "users", uid);
    const uidSnap = await getDoc(uidRef);

    if (uidSnap.exists()) {

      data = uidSnap.data();

      console.log("FOUND USER BY UID");
      console.log("FIRESTORE DATA:", data);

    } else {

      console.log("USER NOT FOUND BY UID");
      console.log("TRYING EMAIL SEARCH...");

      // ------------------------------------------------
      // 3. إذا لم نجد UID، نبحث بواسطة البريد الإلكتروني
      // ------------------------------------------------

      const usersRef = collection(db, "users");

      const emailQuery = query(
        usersRef,
        where("email", "==", user.email)
      );

      const emailSnap = await getDocs(emailQuery);

      if (!emailSnap.empty) {

        const userDoc = emailSnap.docs[0];

        data = userDoc.data();

        console.log("FOUND USER BY EMAIL");
        console.log("DOCUMENT ID:", userDoc.id);
        console.log("FIRESTORE DATA:", data);

      }
    }

    // ------------------------------------------------
    // 4. لا يوجد مستخدم
    // ------------------------------------------------

    if (!data) {

      showMessage(`
        Kullanıcı kaydı bulunamadı.<br><br>
        UID: ${uid}<br>
        E-posta: ${user.email}
      `);

      button.disabled = false;
      button.textContent = "Giriş Yap";

      return;
    }

    // ------------------------------------------------
    // 5. قراءة الدور
    // ------------------------------------------------

    const role = String(data.role || "")
      .trim()
      .toLowerCase();

    console.log("USER ROLE:", role);

    if (!role) {

      showMessage(
        "Kullanıcı rolü bulunamadı.",
        "error"
      );

      button.disabled = false;
      button.textContent = "Giriş Yap";

      return;
    }

    // ------------------------------------------------
    // 6. تحويل المستخدم حسب الدور
    // ------------------------------------------------

    goToDashboard(role);

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
