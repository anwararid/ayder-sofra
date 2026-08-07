import {
  auth,
  db,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "./firebase.js";

export {
  auth,
  db,
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
};

export const $ = (selector) => document.querySelector(selector);

export const money = (value) => {
  return Number(value || 0).toFixed(2) + " ₺";
};

export const esc = (value) => {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

export function toast(message, type = "ok") {
  const element = document.createElement("div");

  element.className = `toast ${type}`;
  element.textContent = message;

  document.body.appendChild(element);

  setTimeout(() => {
    element.remove();
  }, 2500);
}

export async function logout() {
  await signOut(auth);
  window.location.href = "login.html";
}

export function guard(allowedRoles, callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await signOut(auth);
        window.location.href = "login.html";
        return;
      }

      const userData = userSnap.data();

      if (!allowedRoles.includes(userData.role)) {
        alert("Bu sayfaya erişim yetkiniz yok.");
        await signOut(auth);
        window.location.href = "login.html";
        return;
      }

      callback({
        auth: user,
        ...userData
      });

    } catch (error) {
      console.error(error);
      alert("Sistem bağlantısında hata oluştu.");
    }
  });
}

export function shell(user, title, subtitle = "") {

  document.body.innerHTML = `
    <header>
      <div class="brand">
        <span class="logo small">AS</span>
        <b>Ayder Sofra</b>
      </div>

      <button id="logout" class="btn ghost">
        Çıkış
      </button>
    </header>

    <main class="page">

      <div class="page-head">
        <div>
          <h1>${esc(title)}</h1>
          <p class="muted">${esc(subtitle)}</p>
        </div>

        <div class="user-info">
          ${esc(user.name || user.auth?.email || "")}
        </div>
      </div>

      <div id="content"></div>

    </main>
  `;

  const logoutButton = $("#logout");

  if (logoutButton) {
    logoutButton.onclick = logout;
  }

  return $("#content");
}

export function listenMenu(callback) {

  return onSnapshot(
    collection(db, "menu"),
    (snapshot) => {

      const menu = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));

      callback(menu);
    },

    (error) => {
      console.error("Menu error:", error);
      toast("Menü yüklenemedi.", "error");
    }
  );
}

export function listenOrders(callback) {

  const ordersQuery = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    ordersQuery,
    (snapshot) => {

      const orders = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));

      callback(orders);
    },

    (error) => {
      console.error("Orders error:", error);
      toast("Siparişler yüklenemedi.", "error");
    }
  );
}

export function listenUsers(callback) {

  return onSnapshot(
    collection(db, "users"),
    (snapshot) => {

      const users = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));

      callback(users);
    },

    (error) => {
      console.error("Users error:", error);
      toast("Personel bilgileri yüklenemedi.", "error");
    }
  );
}

export async function createOrder(orderData) {

  return addDoc(
    collection(db, "orders"),
    {
      ...orderData,

      status: "pending",

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp()
    }
  );
}

export async function setStatus(orderId, status) {

  return updateDoc(
    doc(db, "orders", orderId),
    {
      status,
      updatedAt: serverTimestamp()
    }
  );
}

export function card(order) {

  const items = order.items || [];

  return `
    <article class="card order-card">

      <div class="row">

        <div>
          <b>Masa ${esc(order.table)}</b>

          <small class="muted">
            ${esc(order.waiterName || "")}
          </small>
        </div>

        <span class="badge">
          ${esc(order.status)}
        </span>

      </div>

      <div class="items">

        ${items
          .map(
            (item) => `
              <div class="row">

                <span>
                  ${item.qty} × ${esc(item.name)}
                </span>

                <b>
                  ${money(item.price * item.qty)}
                </b>

              </div>
            `
          )
          .join("")}

      </div>

      <hr>

      <div class="row">

        <b>Toplam</b>

        <strong>
          ${money(order.total)}
        </strong>

      </div>

      <div class="actions">

        ${
          order.status === "pending"
            ? `
              <button
                class="btn primary action"
                data-id="${order.id}"
                data-s="preparing">
                Hazırlamaya Al
              </button>
            `
            : ""
        }

        ${
          order.status === "preparing"
            ? `
              <button
                class="btn primary action"
                data-id="${order.id}"
                data-s="ready">
                Sipariş Hazır
              </button>
            `
            : ""
        }

        ${
          order.status === "ready"
            ? `
              <button
                class="btn primary action"
                data-id="${order.id}"
                data-s="served">
                Servis Edildi
              </button>
            `
            : ""
        }

      </div>

    </article>
  `;
}
