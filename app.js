import {
  auth,
  db,
  signOut,
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

export const $ = (selector) =>
  document.querySelector(selector);


/* =========================
   MONEY
========================= */

export const money = (value) => {
  return Number(value || 0).toFixed(2) + " ₺";
};


/* =========================
   ESCAPE HTML
========================= */

export const esc = (value) => {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};


/* =========================
   TOAST
========================= */

export function toast(message, type = "ok") {

  const element =
    document.createElement("div");

  element.className =
    `toast ${type}`;

  element.textContent =
    message;

  document.body.appendChild(element);

  setTimeout(() => {
    element.remove();
  }, 2500);
}


/* =========================
   LOGOUT
========================= */

export async function logout() {

  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
  }

  /*
    الموقع الآن يعمل مباشرة
    بدون إجبار المستخدم على تسجيل الدخول.
  */

}


/* =========================
   DIRECT ACCESS
========================= */

export function guard(allowedRoles, callback) {

  /*
    تم تعطيل تسجيل الدخول والحماية
    حتى تفتح الصفحات مباشرة.

    الصفحات:
    garson.html
    mutfak.html
    firin.html
    izgara.html
    admin.html
  */

  const user = {
    uid: "guest",
    email: "guest@aydersofra.local"
  };

  callback({
    auth: user,

    name: "Misafir",

    role:
      allowedRoles?.[0] || "garson"
  });

}


/* =========================
   SHELL
========================= */

export function shell(
  user,
  title,
  subtitle = ""
) {

  document.body.innerHTML = `

    <header>

      <div class="brand">

        <span class="logo small">
          AS
        </span>

        <b>
          Ayder Sofra
        </b>

      </div>


      <nav class="top-nav">

        <a href="garson.html">
          Garson
        </a>

        <a href="mutfak.html">
          Mutfak
        </a>

        <a href="firin.html">
          Fırın
        </a>

        <a href="izgara.html">
          Izgara
        </a>

        <a href="admin.html">
          Yönetim
        </a>

      </nav>

    </header>


    <main class="page">

      <div class="page-head">

        <div>

          <h1>
            ${esc(title)}
          </h1>

          <p class="muted">
            ${esc(subtitle)}
          </p>

        </div>


        <div class="user-info">

          ${esc(
            user?.name ||
            user?.auth?.email ||
            "Misafir"
          )}

        </div>

      </div>


      <div id="content"></div>

    </main>

  `;


  return $("#content");
}


/* =========================
   MENU
========================= */

export function listenMenu(callback) {

  return onSnapshot(

    collection(db, "menu"),

    (snapshot) => {

      const menu =
        snapshot.docs.map(item => ({
          id: item.id,
          ...item.data()
        }));

      callback(menu);

    },

    (error) => {

      console.error(
        "Menu error:",
        error
      );

      toast(
        "Menü yüklenemedi.",
        "error"
      );

    }

  );
}


/* =========================
   ORDERS
========================= */

export function listenOrders(callback) {

  const ordersQuery =
    query(
      collection(db, "orders"),
      orderBy(
        "createdAt",
        "desc"
      )
    );


  return onSnapshot(

    ordersQuery,

    (snapshot) => {

      const orders =
        snapshot.docs.map(item => ({
          id: item.id,
          ...item.data()
        }));

      callback(orders);

    },

    (error) => {

      console.error(
        "Orders error:",
        error
      );

      toast(
        "Siparişler yüklenemedi.",
        "error"
      );

    }

  );
}


/* =========================
   USERS
========================= */

export function listenUsers(callback) {

  return onSnapshot(

    collection(db, "users"),

    (snapshot) => {

      const users =
        snapshot.docs.map(item => ({
          id: item.id,
          ...item.data()
        }));

      callback(users);

    },

    (error) => {

      console.error(
        "Users error:",
        error
      );

      toast(
        "Personel bilgileri yüklenemedi.",
        "error"
      );

    }

  );
}


/* =========================
   CREATE ORDER
========================= */

export async function createOrder(orderData) {

  return addDoc(

    collection(db, "orders"),

    {

      ...orderData,

      status: "pending",

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp()

    }

  );
}


/* =========================
   SET ORDER STATUS
========================= */

export async function setStatus(
  orderId,
  status
) {

  return updateDoc(

    doc(
      db,
      "orders",
      orderId
    ),

    {

      status,

      updatedAt:
        serverTimestamp()

    }

  );
}


/* =========================
   ORDER CARD
========================= */

export function card(order) {

  const items =
    order.items || [];


  return `

    <article class="card order-card">


      <div class="row">

        <div>

          <b>
            Masa ${esc(order.table)}
          </b>

          <small class="muted">
            ${esc(
              order.waiterName || ""
            )}
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
                  ${item.qty}
                  ×
                  ${esc(item.name)}
                </span>

                <b>
                  ${money(
                    item.price *
                    item.qty
                  )}
                </b>

              </div>

            `
          )
          .join("")}

      </div>


      <hr>


      <div class="row">

        <b>
          Toplam
        </b>

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
