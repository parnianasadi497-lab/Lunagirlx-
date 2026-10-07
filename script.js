/* =========================================
   LUNA GIRL - COMPLETE SCRIPT
========================================= */

const SUPABASE_URL = "https://qdyudmrauanjbvwcacct.supabase.co";

const SUPABASE_KEY = "sb_publishable_-mb1R7J32iEeWMMx-RNlbg_1PhNBKAR";

const ADMIN_ID = "ac82e56f-d171-402e-a0f6-8664ec1be7ba";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let products = [];
let cart = [];


/* =========================================
   HELPERS
========================================= */

function formatPrice(price) {
  return Number(price || 0).toLocaleString("fa-IR") + " تومان";
}

function showModal(id) {
  const element = document.getElementById(id);
  if (element) {
    element.classList.add("active");
  }
}

function hideModal(id) {
  const element = document.getElementById(id);
  if (element) {
    element.classList.remove("active");
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================
   PRODUCTS
========================================= */

async function loadProducts() {
  const container = document.getElementById("products-container");

  if (!container) return;

  container.innerHTML = `
    <p class="loading">در حال بارگذاری محصولات... ♡</p>
  `;

  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Products error:", error);

      container.innerHTML = `
        <p class="loading">
          نمایش محصولات با مشکل مواجه شد.
        </p>
      `;

      return;
    }

    products = data || [];

    if (products.length === 0) {
      container.innerHTML = `
        <p class="empty">
          هنوز محصولی اضافه نشده ♡
        </p>
      `;

      return;
    }

    container.innerHTML = "";

    products.forEach((product) => {
      const card = document.createElement("div");

      card.className = "product-card";

      const image = String(product.image_url || "").trim();

      const name = product.Name || "محصول";
      const description = product.Description || "";
      const price = product.Price || 0;

      card.innerHTML = `
        <img
          class="product-image"
          src="${image}"
          alt="${escapeHtml(name)}"
          onerror="this.src='https://via.placeholder.com/600x600?text=Luna+Girl'"
        >

        <div class="product-info">

          <h3>
            ${escapeHtml(name)}
          </h3>

          <p class="product-description">
            ${escapeHtml(description)}
          </p>

          <div class="product-price">
            ${formatPrice(price)}
          </div>

          <button
            class="add-cart-btn"
            onclick="addToCart(${Number(product.id)})"
          >
            افزودن به سبد 🛍️
          </button>

        </div>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Load products error:", error);

    container.innerHTML = `
      <p class="loading">
        خطایی در اتصال به فروشگاه رخ داد.
      </p>
    `;
  }
}


/* =========================================
   CART
========================================= */

function addToCart(productId) {
  const product = products.find(
    item => Number(item.id) === Number(productId)
  );

  if (!product) {
    alert("محصول پیدا نشد.");
    return;
  }

  const existing = cart.find(
    item => Number(item.id) === Number(productId)
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  updateCart();

  alert("محصول به سبد خرید اضافه شد 🛍️");
}


function removeFromCart(productId) {
  cart = cart.filter(
    item => Number(item.id) !== Number(productId)
  );

  updateCart();
}


function changeCartQuantity(productId, amount) {
  const item = cart.find(
    product => Number(product.id) === Number(productId)
  );

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  updateCart();
}


function updateCart() {
  const countElement =
    document.getElementById("cart-count");

  const itemsElement =
    document.getElementById("cart-items");

  const totalElement =
    document.getElementById("cart-total");

  const count = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  if (countElement) {
    countElement.textContent =
      count.toLocaleString("fa-IR");
  }

  if (!itemsElement || !totalElement) {
    return;
  }

  if (cart.length === 0) {
    itemsElement.innerHTML = `
      <p class="empty">
        سبد خرید خالیه ♡
      </p>
    `;

    totalElement.textContent = "۰ تومان";

    return;
  }

  let total = 0;

  itemsElement.innerHTML = "";

  cart.forEach(item => {
    total +=
      Number(item.Price || 0) *
      item.quantity;

    const image =
      item.image_url ||
      "https://via.placeholder.com/150?text=Luna";

    const div =
      document.createElement("div");

    div.className = "cart-item";

    div.innerHTML = `
      <img
        src="${image}"
        alt=""
      >

      <div class="cart-item-info">

        <strong>
          ${escapeHtml(item.Name)}
        </strong>

        <div>
          ${item.quantity.toLocaleString("fa-IR")}
          ×
          ${formatPrice(item.Price)}
        </div>

        <div style="
          display:flex;
          gap:6px;
          align-items:center;
          margin-top:8px;
        ">

          <button
            onclick="changeCartQuantity(${Number(item.id)}, -1)"
          >
            −
          </button>

          <span>
            ${item.quantity.toLocaleString("fa-IR")}
          </span>

          <button
            onclick="changeCartQuantity(${Number(item.id)}, 1)"
          >
            +
          </button>

        </div>

      </div>

      <button
        class="cart-item-remove"
        onclick="removeFromCart(${Number(item.id)})"
      >
        حذف
      </button>
    `;

    itemsElement.appendChild(div);
  });

  totalElement.textContent =
    formatPrice(total);
}


function openCart() {
  updateCart();
  showModal("cart-modal");
}


function closeCart() {
  hideModal("cart-modal");
}


/* =========================================
   CHECKOUT
========================================= */

function openCheckout() {
  if (cart.length === 0) {
    alert("سبد خریدت خالیه ♡");
    return;
  }

  closeCart();
  showModal("checkout-modal");
}


function closeCheckout() {
  hideModal("checkout-modal");
}


async function submitOrder(event) {
  event.preventDefault();

  if (cart.length === 0) {
    alert("سبد خرید خالیه.");
    return;
  }

  const firstName =
    document.getElementById("first-name")?.value.trim();

  const lastName =
    document.getElementById("last-name")?.value.trim();

  const phone =
    document.getElementById("phone")?.value.trim();

  const province =
    document.getElementById("province")?.value.trim();

  const city =
    document.getElementById("city")?.value.trim();

  const address =
    document.getElementById("address")?.value.trim();

  const postalCode =
    document.getElementById("postal-code")?.value.trim();

  if (
    !firstName ||
    !lastName ||
    !phone ||
    !province ||
    !city ||
    !address ||
    !postalCode
  ) {
    alert("لطفاً همه اطلاعات را کامل وارد کن.");
    return;
  }

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.Price || 0) *
      item.quantity,
    0
  );

  const items = cart.map(item => ({
    id: item.id,
    name: item.Name,
    price: Number(item.Price || 0),
    quantity: item.quantity,
    image_url: item.image_url || ""
  }));

  const order = {
    first_name: firstName,
    last_name: lastName,
    phone: phone,
    province: province,
    city: city,
    address: address,
    postal_code: postalCode,
    items: items,
    total: total,
    status: "در انتظار بررسی"
  };

  try {
    const { error } =
      await supabaseClient
        .from("orders")
        .insert([order]);

    if (error) {
      console.error("Order error:", error);

      alert(
        "ثبت سفارش با مشکل مواجه شد. دوباره امتحان کن."
      );

      return;
    }

    alert(
      "سفارشت با موفقیت ثبت شد 💗"
    );

    cart = [];

    updateCart();

    closeCheckout();

    const form =
      document.getElementById("checkout-form");

    if (form) {
      form.reset();
    }

  } catch (error) {
    console.error(error);

    alert(
      "خطایی هنگام ثبت سفارش رخ داد."
    );
  }
}


/* =========================================
   ADMIN LOGIN
========================================= */

function openAdminLogin() {
  showModal("admin-login-modal");
}


function closeAdminLogin() {
  hideModal("admin-login-modal");
}


async function adminLogin() {
  const email =
    document.getElementById("admin-email")?.value.trim();

  const password =
    document.getElementById("admin-password")?.value;

  const message =
    document.getElementById("admin-login-message");

  if (!email || !password) {
    if (message) {
      message.textContent =
        "ایمیل و رمز عبور را وارد کن.";
    }

    return;
  }

  if (message) {
    message.textContent =
      "در حال ورود...";
  }

  try {
    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

    if (error) {
      console.error("Login error:", error);

      if (message) {
        message.textContent =
          "ایمیل یا رمز عبور اشتباه است.";
      }

      return;
    }

    if (
      !data.user ||
      data.user.id !== ADMIN_ID
    ) {
      await supabaseClient.auth.signOut();

      if (message) {
        message.textContent =
          "این حساب اجازه ورود به پنل مدیریت را ندارد.";
      }

      return;
    }

    closeAdminLogin();

    await openAdminPanel();

  } catch (error) {
    console.error(error);

    if (message) {
      message.textContent =
        "خطایی در ورود رخ داد.";
    }
  }
}


/* =========================================
   ADMIN PANEL
========================================= */

async function openAdminPanel() {
  const {
    data: {
      session
    }
  } = await supabaseClient.auth.getSession();

  if (
    !session ||
    !session.user ||
    session.user.id !== ADMIN_ID
  ) {
    openAdminLogin();
    return;
  }

  showModal("admin-panel-modal");

  await loadOrders();
}


function closeAdminPanel() {
  hideModal("admin-panel-modal");
}


/* =========================================
   SAVE PRODUCT
========================================= */

async function saveProduct() {
  const name =
    document.getElementById("product-name")?.value.trim();

  const price =
    document.getElementById("product-price")?.value;

  const description =
    document.getElementById("product-description")?.value.trim();

  const stock =
    document.getElementById("product-stock")?.value;

  const imageInput =
    document.getElementById("product-image");

  if (!name || !price || !description || !stock) {
    alert("لطفاً اطلاعات محصول را کامل وارد کن.");
    return;
  }

  const saveButton =
    document.querySelector(".admin-save-btn");

  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent =
      "در حال ذخیره...";
  }

  try {
    const {
      data: {
        session
      }
    } = await supabaseClient.auth.getSession();

    if (
      !session ||
      !session.user ||
      session.user.id !== ADMIN_ID
    ) {
      alert("ابتدا وارد پنل مدیریت شو.");
      return;
    }

    let imageUrl = "";

    /* -------------------------
       UPLOAD IMAGE
    ------------------------- */

    if (
      imageInput &&
      imageInput.files &&
      imageInput.files.length > 0
    ) {
      const file =
        imageInput.files[0];

      const fileExtension =
        file.name.split(".").pop();

      const fileName =
        Date.now() +
        "-" +
        Math.random()
          .toString(36)
          .substring(2) +
        "." +
        fileExtension;

      const filePath =
        "products/" + fileName;

      const {
        error: uploadError
      } = await supabaseClient.storage
        .from("products")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false
          }
        );

      if (uploadError) {
        console.error(
          "Upload error:",
          uploadError
        );

        alert(
          "آپلود عکس انجام نشد."
        );

        return;
      }

      const {
        data: publicData
      } = supabaseClient.storage
        .from("products")
        .getPublicUrl(filePath);

      imageUrl =
        publicData.publicUrl;
    }

    /* -------------------------
       INSERT PRODUCT
    ------------------------- */

    const {
      error
    } = await supabaseClient
      .from("products")
      .insert([
        {
          Name: name,
          Price: Number(price),
          Description: description,
          stock: Number(stock),
          image_url: imageUrl
        }
      ]);

    if (error) {
      console.error(
        "Product insert error:",
        error
      );

      alert(
        "ذخیره محصول انجام نشد."
      );

      return;
    }

    alert(
      "محصول با موفقیت اضافه شد 🎀"
    );

    const nameInput =
      document.getElementById("product-name");

    const priceInput =
      document.getElementById("product-price");

    const descriptionInput =
      document.getElementById("product-description");

    const stockInput =
      document.getElementById("product-stock");

    if (nameInput) nameInput.value = "";
    if (priceInput) priceInput.value = "";
    if (descriptionInput) descriptionInput.value = "";
    if (stockInput) stockInput.value = "";

    if (imageInput) {
      imageInput.value = "";
    }

    await loadProducts();

  } catch (error) {
    console.error(error);

    alert(
      "خطایی هنگام ذخیره محصول رخ داد."
    );

  } finally {
    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent =
        "ذخیره محصول";
    }
  }
}


/* =========================================
   ORDERS
========================================= */

async function loadOrders() {
  const container =
    document.getElementById("orders-container");

  if (!container) return;

  container.innerHTML = `
    <p>در حال دریافت سفارش‌ها...</p>
  `;

  try {
    const {
      data: {
        session
      }
    } = await supabaseClient.auth.getSession();

    if (
      !session ||
      !session.user ||
      session.user.id !== ADMIN_ID
    ) {
      container.innerHTML = `
        <p>برای دیدن سفارش‌ها باید وارد مدیر شوید.</p>
      `;

      return;
    }

    const {
      data,
      error
    } = await supabaseClient
      .from("orders")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (error) {
      console.error(
        "Orders error:",
        error
      );

      container.innerHTML = `
        <p>
          دریافت سفارش‌ها با مشکل مواجه شد.
        </p>
      `;

      return;
    }

    if (!data || data.length === 0) {
      container.innerHTML = `
        <p>
          هنوز سفارشی ثبت نشده ♡
        </p>
      `;

      return;
    }

    container.innerHTML = "";

    data.forEach(order => {
      const card =
        document.createElement("div");

      card.className =
        "order-card";

      let itemsHtml = "";

      if (Array.isArray(order.items)) {
        itemsHtml =
          order.items
            .map(item => `
              <div>
                ${escapeHtml(item.name || "محصول")}
                ×
                ${Number(item.quantity || 1).toLocaleString("fa-IR")}
              </div>
            `)
            .join("");
      }

      const createdDate =
        order.created_at
          ? new Date(
              order.created_at
            ).toLocaleString(
              "fa-IR"
            )
          : "";

      card.innerHTML = `
        <div class="order-card-inner">

          <h4>
            سفارش #${order.id}
          </h4>

          <p>
            👤
            ${escapeHtml(order.first_name || "")}
            ${escapeHtml(order.last_name || "")}
          </p>

          <p>
            📱
            ${escapeHtml(order.phone || "")}
          </p>

          <p>
            📍
            ${escapeHtml(order.province || "")}
            -
            ${escapeHtml(order.city || "")}
          </p>

          <p>
            🏠
            ${escapeHtml(order.address || "")}
          </p>

          <p>
            📮
            ${escapeHtml(order.postal_code || "")}
          </p>

          <div class="order-items">
            <strong>محصولات:</strong>
            ${itemsHtml}
          </div>

          <p>
            💰
            <strong>
              ${formatPrice(order.total)}
            </strong>
          </p>

          <p>
            🕐
            ${createdDate}
          </p>

          <div style="
            margin-top:12px;
            display:flex;
            gap:8px;
            flex-wrap:wrap;
            align-items:center;
          ">

            <select
              id="status-${order.id}"
              style="
                padding:9px;
                border-radius:10px;
                border:1px solid #eadde1;
              "
            >
              <option value="در انتظار بررسی"
                ${order.status === "در انتظار بررسی" ? "selected" : ""}>
                در انتظار بررسی
              </option>

              <option value="تأیید شد"
                ${order.status === "تأیید شد" ? "selected" : ""}>
                تأیید شد
              </option>

              <option value="در حال آماده‌سازی"
                ${order.status === "در حال آماده‌سازی" ? "selected" : ""}>
                در حال آماده‌سازی
              </option>

              <option value="ارسال شد"
                ${order.status === "ارسال شد" ? "selected" : ""}>
                ارسال شد
              </option>

              <option value="تحویل داده شد"
                ${order.status === "تحویل داده شد" ? "selected" : ""}>
                تحویل داده شد
              </option>

              <option value="لغو شد"
                ${order.status === "لغو شد" ? "selected" : ""}>
                لغو شد
              </option>

            </select>

            <button
              onclick="updateOrderStatus(${order.id})"
              class="admin-save-btn"
            >
              ذخیره وضعیت
            </button>

          </div>

        </div>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <p>
        خطایی هنگام دریافت سفارش‌ها رخ داد.
      </p>
    `;
  }
}


/* =========================================
   UPDATE ORDER STATUS
========================================= */

async function updateOrderStatus(orderId) {
  const select =
    document.getElementById(
      `status-${orderId}`
    );

  if (!select) return;

  const newStatus =
    select.value;

  try {
    const {
      data: {
        session
      }
    } = await supabaseClient.auth.getSession();

    if (
      !session ||
      !session.user ||
      session.user.id !== ADMIN_ID
    ) {
      alert(
        "دسترسی مدیر لازم است."
      );

      return;
    }

    const {
      error
    } = await supabaseClient
      .from("orders")
      .update({
        status: newStatus
      })
      .eq("id", orderId);

    if (error) {
      console.error(error);

      alert(
        "تغییر وضعیت انجام نشد."
      );

      return;
    }

    alert(
      "وضعیت سفارش تغییر کرد ✅"
    );

    await loadOrders();

  } catch (error) {
    console.error(error);

    alert(
      "خطایی رخ داد."
    );
  }
}


/* =========================================
   LOGOUT
========================================= */

async function adminLogout() {
  await supabaseClient.auth.signOut();

  closeAdminPanel();

  alert(
    "از پنل مدیریت خارج شدی."
  );
}


/* =========================================
   CLOSE MODALS BY CLICKING OUTSIDE
========================================= */

document.addEventListener(
  "click",
  function(event) {

    const modals =
      document.querySelectorAll(".modal");

    modals.forEach(modal => {

      if (
        event.target === modal
      ) {
        modal.classList.remove(
          "active"
        );
      }

    });
  }
);


/* =========================================
   CHECKOUT FORM
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    const checkoutForm =
      document.getElementById(
        "checkout-form"
      );

    if (checkoutForm) {
      checkoutForm.addEventListener(
        "submit",
        submitOrder
      );
    }

    loadProducts();

    updateCart();

  }
);
