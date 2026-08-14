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


/* ==================================================
   EXPORTS
================================================== */

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


/* ==================================================
   DOM HELPER
================================================== */

export const $ = (selector) => {
  return document.querySelector(selector);
};


/* ==================================================
   MONEY
================================================== */

export const money = (value) => {

  return (
    Number(value || 0).toFixed(2) +
    " ₺"
  );

};


/* ==================================================
   ESCAPE HTML
================================================== */

export const esc = (value) => {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

};


/* ==================================================
   TOAST
================================================== */

export function toast(
  message,
  type = "ok"
) {

  const element =
    document.createElement("div");

  element.className =
    `toast ${type}`;

  element.textContent =
    message;

  document.body.appendChild(
    element
  );

  setTimeout(() => {

    element.remove();

  }, 2500);

}


/* ==================================================
   LOGOUT
================================================== */

export async function logout() {

  try {

    await signOut(auth);

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

  }

}


/* ==================================================
   DIRECT ACCESS
================================================== */

export function guard(
  allowedRoles,
  callback
) {

  /*
    Giriş sistemi şu anda kapalı.

    الصفحات:
    garson.html
    mutfak.html
    firin.html
    izgara.html
    admin.html
  */

  const user = {

    uid: "guest",

    email:
      "guest@aydersofra.local"

  };


  callback({

    auth: user,

    name:
      "Misafir",

    role:
      allowedRoles?.[0] ||
      "garson"

  });

}


/* ==================================================
   SHELL
================================================== */

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


/* ==================================================
   PRODUCTS
   IMPORTANT:
   PRODUCTS COLLECTION
================================================== */

export function listenProducts(
  callback
) {

  return onSnapshot(

    collection(
      db,
      "products"
    ),

    (snapshot) => {

      const products =
        snapshot.docs.map(
          item => ({

            id:
              item.id,

            ...item.data()

          })
        );


      callback(products);

    },

    (error) => {

      console.error(
        "Products error:",
        error
      );


      toast(
        "Ürünler yüklenemedi.",
        "error"
      );

    }

  );

}


/* ==================================================
   MENU ALIAS
   Compatibility with old pages
================================================== */

export function listenMenu(
  callback
) {

  return listenProducts(
    callback
  );

}


/* ==================================================
   ORDERS
================================================== */

export function listenOrders(
  callback
) {

  const ordersQuery =
    query(

      collection(
        db,
        "orders"
      ),

      orderBy(
        "createdAt",
        "desc"
      )

    );


  return onSnapshot(

    ordersQuery,

    (snapshot) => {

      const orders =
        snapshot.docs.map(
          item => ({

            id:
              item.id,

            ...item.data()

          })
        );


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


/* ==================================================
   USERS
================================================== */

export function listenUsers(
  callback
) {

  return onSnapshot(

    collection(
      db,
      "users"
    ),

    (snapshot) => {

      const users =
        snapshot.docs.map(
          item => ({

            id:
              item.id,

            ...item.data()

          })
        );


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


/* ==================================================
   CREATE ORDER
================================================== */

export async function createOrder(
  orderData
) {

  if (!orderData) {

    throw new Error(
      "Order data missing"
    );

  }


  const items =
    Array.isArray(
      orderData.items
    )
      ? orderData.items
      : [];


  const total =
    items.reduce(

      (sum, item) => {

        const price =
          Number(
            item.price || 0
          );

        const qty =
          Number(
            item.qty || 0
          );


        return (
          sum +
          price * qty
        );

      },

      0

    );


  return addDoc(

    collection(
      db,
      "orders"
    ),

    {

      ...orderData,

      table:
        Number(
          orderData.table || 0
        ),

      waiterName:
        orderData.waiterName ||
        "Garson",

      items,

      total:

        Number(
          orderData.total ??
          total
        ),

      status:
        "pending",

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp()

    }

  );

}


/* ==================================================
   SET ORDER STATUS
================================================== */

export async function setStatus(
  orderId,
  status
) {

  if (!orderId) {

    throw new Error(
      "Order ID missing"
    );

  }


  if (!status) {

    throw new Error(
      "Status missing"
    );

  }


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
/* ==================================================
   DELETE ORDER
================================================== */

export async function deleteOrder(
  orderId
) {

  if (!orderId) {

    throw new Error(
      "Order ID missing"
    );

  }


  return deleteDoc(

    doc(
      db,
      "orders",
      orderId
    )

  );

}


/* ==================================================
   GET ORDER
================================================== */

export async function getOrder(
  orderId
) {

  if (!orderId) {

    throw new Error(
      "Order ID missing"
    );

  }


  const snapshot =
    await getDoc(

      doc(
        db,
        "orders",
        orderId
      )

    );


  if (!snapshot.exists()) {

    return null;

  }


  return {

    id:
      snapshot.id,

    ...snapshot.data()

  };

}


/* ==================================================
   UPDATE ORDER
================================================== */

export async function updateOrder(
  orderId,
  data
) {

  if (!orderId) {

    throw new Error(
      "Order ID missing"
    );

  }


  return updateDoc(

    doc(
      db,
      "orders",
      orderId
    ),

    {

      ...data,

      updatedAt:
        serverTimestamp()

    }

  );

}


/* ==================================================
   ORDER CARD
================================================== */

export function card(
  order
) {

  const items =
    order.items || [];


  return `

    <article
      class="card order-card"
    >

      <div class="row">

        <div>

          <b>
            Masa ${esc(
              order.table
            )}
          </b>

          <small class="muted">

            ${esc(
              order.waiterName ||
              "Garson"
            )}

          </small>

        </div>


        <span class="badge">

          ${esc(
            order.status
          )}

        </span>

      </div>


      <div class="items">

        ${
          items.length

            ? items
                .map(
                  item => `

                    <div class="row">

                      <span>

                        ${Number(
                          item.qty || 0
                        )}

                        ×

                        ${esc(
                          item.name ||
                          "Ürün"
                        )}

                      </span>


                      <b>

                        ${money(

                          Number(
                            item.price ||
                            0
                          ) *

                          Number(
                            item.qty ||
                            0
                          )

                        )}

                      </b>

                    </div>

                  `
                )
                .join("")

            : `

                <div class="muted">

                  Ürün bulunamadı.

                </div>

              `
        }

      </div>


      <hr>


      <div class="row">

        <b>
          Toplam
        </b>

        <strong>

          ${money(
            order.total
          )}

        </strong>

      </div>


      <div class="actions">

        ${
          order.status ===
          "pending"

            ? `

              <button

                class="btn primary action"

                data-id="${esc(
                  order.id
                )}"

                data-s="preparing"

              >

                Hazırlamaya Al

              </button>

            `

            : ""
        }


        ${
          order.status ===
          "preparing"

            ? `

              <button

                class="btn primary action"

                data-id="${esc(
                  order.id
                )}"

                data-s="ready"

              >

                Sipariş Hazır

              </button>

            `

            : ""
        }


        ${
          order.status ===
          "ready"

            ? `

              <button

                class="btn primary action"

                data-id="${esc(
                  order.id
                )}"

                data-s="served"

              >

                Servis Edildi

              </button>

            `

            : ""
        }


        ${
          order.status ===
          "served"

            ? `

              <button

                class="btn danger action"

                data-delete-order="${esc(
                  order.id
                )}"

              >

                🗑 Siparişi Sil

              </button>

            `

            : ""
        }

      </div>

    </article>

  `;

}


/* ==================================================
   ORDER STATUS TEXT
================================================== */

export function statusName(
  status
) {

  const names = {

    pending:
      "YENİ SİPARİŞ",

    preparing:
      "HAZIRLANIYOR",

    ready:
      "HAZIR",

    served:
      "SERVİS EDİLDİ"

  };


  return (

    names[status] ||

    status ||

    ""

  );

}


/* ==================================================
   ORDER STATUS CLASS
================================================== */

export function statusClass(
  status
) {

  const classes = {

    pending:
      "status-new",

    preparing:
      "status-preparing",

    ready:
      "status-ready",

    served:
      "status-served"

  };


  return (

    classes[status] ||

    ""

  );

}


/* ==================================================
   TABLE ACTIVE STATUS
================================================== */

export function isOrderActive(
  order
) {

  return [

    "pending",

    "preparing",

    "ready"

  ].includes(

    order?.status

  );

}


/* ==================================================
   TABLE HAS ACTIVE ORDERS
================================================== */

export function tableHasActiveOrders(
  orders,
  tableNumber
) {

  return orders.some(

    order => {

      return (

        Number(
          order.table
        ) ===

        Number(
          tableNumber
        )

        &&

        isOrderActive(
          order
        )

      );

    }

  );

}


/* ==================================================
   TABLE HAS ANY ORDERS
================================================== */

export function tableHasOrders(
  orders,
  tableNumber
) {

  return orders.some(

    order => {

      return (

        Number(
          order.table
        ) ===

        Number(
          tableNumber
        )

      );

    }

  );

}


/* ==================================================
   TABLE ACTIVE ORDER TOTAL
================================================== */

export function tableActiveTotal(
  orders,
  tableNumber
) {

  return orders

    .filter(

      order => {

        return (

          Number(
            order.table
          ) ===

          Number(
            tableNumber
          )

          &&

          isOrderActive(
            order
          )

        );

      }

    )

    .reduce(

      (sum, order) => {

        return (

          sum +

          Number(
            order.total || 0
          )

        );

      },

      0

    );

}


/* ==================================================
   TABLE ACTIVE ORDER COUNT
================================================== */

export function tableActiveOrderCount(
  orders,
  tableNumber
) {

  return orders.filter(

    order => {

      return (

        Number(
          order.table
        ) ===

        Number(
          tableNumber
        )

        &&

        isOrderActive(
          order
        )

      );

    }

  ).length;

  }
