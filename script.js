const SUPABASE_URL = 'https://qdyudmrauanjbvwcacct.supabase.co'
const SUPABASE_KEY = "sb_publishable_-mb1R7J32iEeWMMx-RNlbg_1PhNBKAR";
const ADMIN_ID =
  "ac82e56f-d171-402e-a0f6-8664ec1be7ba";
const supabaseClient =
  supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );
let products = [];
let cart = [];
/* =========================
   PRODUCTS
========================= */
async function loadProducts() {
  const container =
    document.getElementById(
      "products-container"
    );
  try {
    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=*`,
        {
          method: "GET",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization":
              `Bearer ${SUPABASE_KEY}`
          }
        }
      );
    const text =
      await response.text();
    if (!response.ok) {
      container.innerHTML =
        `<p style="color:#d97899;">
          خطا ${response.status}
          <br><br>
          ${text}
        </p>`;
      return;
    }
    products =
      JSON.parse(text);
    if (!products.length) {
      container.innerHTML =
        "<p>هنوز محصولی اضافه نشده است 🌸</p>";
      return;
    }
    container.innerHTML =
      products.map(product => `
        <article class="product-card">
          ${
            product.image_url
            ?
            `<img
              class="product-image"
              src="${product.image_url}"
              alt="${product.Name}"
            >`
            :
            `<div class="product-image"></div>`
          }
          <div class="product-info">
            <h3>
              ${product.Name}
            </h3>
            <p class="product-description">
              ${product.Description || ""}
            </p>
            <div class="product-price">
              ${Number(product.Price)
                .toLocaleString("fa-IR")}
              تومان
            </div>
            <button
              class="add-btn"
              onclick="addToCart(${product.id})"
            >
              افزودن به سبد خرید 🛍️
            </button>
          </div>
        </article>
      `).join("");
  }
  catch (error) {
    container.innerHTML =
      `<p style="color:#d97899;">
        خطای اتصال:
        <br>
        ${error.message}
      </p>`;
  }
}
/* =========================
   ADMIN LOGIN
========================= */
function openAdminLogin() {
  document
    .getElementById("admin-login-modal")
    .classList.add("show");
}
function closeAdminLogin() {
  document
    .getElementById("admin-login-modal")
    .classList.remove("show");
}
async function adminLogin(event) {
  event.preventDefault();
  const email =
    document
      .getElementById("admin-email")
      .value
      .trim();
  const password =
    document
      .getElementById("admin-password")
      .value;
  const message =
    document
      .getElementById("login-message");
  message.textContent =
    "در حال ورود... ⏳";
  const {
    data,
    error
  } =
    await supabaseClient.auth
      .signInWithPassword({
        email,
        password
      });
  if (error) {
    message.textContent =
      "ایمیل یا رمز عبور اشتباه است.";
    return;
  }
  if (
    !data.user ||
    data.user.id !== ADMIN_ID
  ) {
    await supabaseClient.auth.signOut();
    message.textContent =
      "این حساب اجازه ورود به پنل مدیریت را ندارد.";
    return;
  }
  message.textContent =
    "ورود موفق بود 🎀";
  document
    .getElementById("admin-email")
    .value = "";
  document
    .getElementById("admin-password")
    .value = "";
  setTimeout(() => {
    closeAdminLogin();
    openAdminPanel();
  }, 500);
}
/* =========================
   ADMIN PANEL
========================= */
async function openAdminPanel() {
  const {
    data
  } =
    await supabaseClient.auth
      .getSession();
  const session =
    data.session;
  if (
    !session ||
    !session.user ||
    session.user.id !== ADMIN_ID
  ) {
    openAdminLogin();
    return;
  }
  document
    .getElementById("admin-panel")
    .classList.add("show");
}
function closeAdmin() {
  document
    .getElementById("admin-panel")
    .classList.remove("show");
}
async function adminLogout() {
  await supabaseClient.auth.signOut();
  closeAdmin();
  alert("از پنل مدیریت خارج شدی 🌸");
}
/* =========================
   SAVE PRODUCT
========================= */
async function saveProduct() {
  const name =
    document
      .getElementById("admin-name")
      .value
      .trim();
  const price =
    document
      .getElementById("admin-price")
      .value;
  const description =
    document
      .getElementById("admin-description")
      .value
      .trim();
  const stock =
    document
      .getElementById("admin-stock")
      .value;
  const fileInput =
    document
      .getElementById("admin-image-file");
  const imageFile =
    fileInput.files[0];
  const message =
    document
      .getElementById("admin-message");
  if (!name) {
    message.textContent =
      "نام محصول را وارد کن 🌸";
    return;
  }
  if (!price) {
    message.textContent =
      "قیمت محصول را وارد کن 🌸";
    return;
  }
  if (!imageFile) {
    message.textContent =
      "عکس محصول را انتخاب کن 🖼️";
    return;
  }
  const {
    data
  } =
    await supabaseClient.auth
      .getSession();
  const session =
    data.session;
  if (
    !session ||
    session.user.id !== ADMIN_ID
  ) {
    message.textContent =
      "ابتدا وارد حساب مدیر شو.";
    return;
  }
  try {
    message.textContent =
      "در حال آپلود عکس... ⏳";
    const safeName =
      imageFile.name
        .replace(
          /[^a-zA-Z0-9._-]/g,
          "-"
        );
    const fileName =
      `${Date.now()}-${safeName}`;
    const uploadResponse =
      await fetch(
        `${SUPABASE_URL}/storage/v1/object/products/${fileName}`,
        {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization":
              `Bearer ${session.access_token}`,
            "Content-Type":
              imageFile.type
          },
          body: imageFile
        }
      );
    if (!uploadResponse.ok) {
      const errorText =
        await uploadResponse.text();
      message.textContent =
        `خطا در آپلود عکس:
        ${errorText}`;
      return;
    }
    const imageUrl =
      `${SUPABASE_URL}/storage/v1/object/public/products/${fileName}`;
    message.textContent =
      "عکس آپلود شد 💗";
    const productResponse =
      await fetch(
        `${SUPABASE_URL}/rest/v1/products`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            "apikey":
              SUPABASE_KEY,
            "Authorization":
              `Bearer ${session.access_token}`,
            "Prefer":
              "return=minimal"
          },
          body: JSON.stringify({
            Name: name,
            Price:
              Number(price),
            Description:
              description,
            image_url:
              imageUrl,
            stock:
              Number(stock || 0)
          })
        }
      );
    if (!productResponse.ok) {
      const errorText =
        await productResponse.text();
      message.textContent =
        `خطا در ثبت محصول:
        ${errorText}`;
      return;
    }
    message.textContent =
      "محصول با موفقیت اضافه شد 🎀";
    document
      .getElementById("admin-name")
      .value = "";
    document
      .getElementById("admin-price")
      .value = "";
    document
      .getElementById("admin-description")
      .value = "";
    document
      .getElementById("admin-stock")
      .value = "";
    document
      .getElementById("admin-image-file")
      .value = "";
    await loadProducts();
    setTimeout(() => {
      closeAdmin();
    }, 1000);
  }
  catch (error) {
    message.textContent =
      "خطای اتصال: " +
      error.message;
  }
}
/* =========================
   CART
========================= */
function addToCart(productId) {
  const product =
    products.find(
      p => p.id === productId
    );
  if (!product) return;
  cart.push(product);
  updateCart();
  openCart();
}
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}
function updateCart() {
  const count =
    document
      .getElementById("cart-count");
  const items =
    document
      .getElementById("cart-items");
  const total =
    document
      .getElementById("cart-total");
  count.textContent =
    cart.length;
  if (!cart.length) {
    items.innerHTML =
      "<p>سبد خرید خالی است 🌸</p>";
    total.textContent = "0";
    return;
  }
  items.innerHTML =
    cart.map((product,index) => `
      <div class="cart-item">
        <h4>
          ${product.Name}
        </h4>
        <p>
          ${Number(product.Price)
            .toLocaleString("fa-IR")}
          تومان
        </p>
        <button
          class="remove-btn"
          onclick="removeFromCart(${index})"
        >
          حذف
        </button>
      </div>
    `).join("");
  const sum =
    cart.reduce(
      (total,product) =>
        total + Number(product.Price),
      0
    );
  total.textContent =
    sum.toLocaleString("fa-IR");
}
function openCart() {
  document
    .getElementById("cart")
    .classList.add("open");
  document
    .getElementById("overlay")
    .classList.add("show");
}
function closeCart() {
  document
    .getElementById("cart")
    .classList.remove("open");
  document
    .getElementById("overlay")
    .classList.remove("show");
}
/* =========================
   CHECKOUT
========================= */
function openCheckout() {
  if (!cart.length) {
    alert(
      "سبد خریدت خالیه 🌸"
    );
    return;
  }
  const total =
    cart.reduce(
      (sum,product) =>
        sum + Number(product.Price),
      0
    );
  document
    .getElementById("checkout-total")
    .textContent =
      total.toLocaleString("fa-IR");
  document
    .getElementById("checkout-modal")
    .classList.add("show");
}
function closeCheckout() {
  document
    .getElementById("checkout-modal")
    .classList.remove("show");
}
async function submitOrder(event) {
  event.preventDefault();
  const message =
    document
      .getElementById("checkout-message");
  message.textContent =
    "اطلاعات سفارش ثبت شد. اتصال درگاه پرداخت در مرحله بعد انجام می‌شود. 💗";
  console.log({
    firstName:
      document.getElementById("first-name").value,
    lastName:
      document.getElementById("last-name").value,
    province:
      document.getElementById("province").value,
    city:
      document.getElementById("city").value,
    address:
      document.getElementById("address").value,
    postalCode:
      document.getElementById("postal-code").value,
    phone:
      document.getElementById("phone").value,
    products:
      cart,
    total:
      cart.reduce(
        (sum,product) =>
          sum + Number(product.Price),
        0
      )
  });
}
/* =========================
   INITIALIZE
========================= */
loadProducts();
updateCart();
