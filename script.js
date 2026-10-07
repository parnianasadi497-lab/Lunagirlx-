const SUPABASE_URL = “https://qdyudmrauanjbvwcacct.supabase.co”;

const SUPABASE_KEY =
“sb_publishable_-mb1R7J32iEeWMMx-RNlbg_1PhNBKAR”;

const ADMIN_ID = “ac82e56f-d171-402e-a0f6-8664ec1be7ba”;

const supabaseClient = supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

let products = [];
let cart = [];

/* =========================
HELPERS
========================= */

function formatPrice(price) {
return Number(price || 0).toLocaleString(“fa-IR”) + “ تومان”;
}

function showModal(id) {
const element = document.getElementById(id);
if (element) element.classList.add(“active”);
}

function hideModal(id) {
const element = document.getElementById(id);
if (element) element.classList.remove(“active”);
}

function escapeHtml(value) {
return String(value ?? “”)
.replace(/&/g, “&”)
.replace(/</g, “<”)
.replace(/>/g, “>”)
.replace(/”/g, “"”)
.replace(/’/g, “'”);
}

/* =========================
PRODUCTS
========================= */

async function loadProducts() {

const container = document.getElementById(“products-container”);

if (!container) return;

container.innerHTML =
‘در حال بارگذاری محصولات…’;

try {

const { data, error } = await supabaseClient
  .from("products")
  .select("*")
  .order("created_at", { ascending: false });
if (error) {
  console.error(error);
  container.innerHTML =
    '<p class="loading">نمایش محصولات با مشکل مواجه شد.</p>';
  return;
}
products = data || [];
if (products.length === 0) {
  container.innerHTML =
    '<p class="empty">هنوز محصولی اضافه نشده ♡</p>';
  return;
}
container.innerHTML = "";
products.forEach(product => {
  const card = document.createElement("div");
  card.className = "product-card";
  const image =
    product.image_url ||
    "https://via.placeholder.com/600x600?text=Luna+Girl";
  card.innerHTML = `
    <img
      class="product-image"
      src="${image}"
      alt="${escapeHtml(product.Name || "محصول")}"
    >
    <div class="product-info">
      <h3>${escapeHtml(product.Name || "محصول")}</h3>
      <p class="product-description">
        ${escapeHtml(product.Description || "")}
      </p>
      <div class="product-price">
        ${formatPrice(product.Price)}
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

console.error(error);
container.innerHTML =
  '<p class="loading">خطایی در اتصال به فروشگاه رخ داد.</p>';

}
}

/* =========================
CART
========================= */

function addToCart(productId) {

const product = products.find(
item => Number(item.id) === Number(productId)
);

if (!product) return;

const existing = cart.find(
item => Number(item.id) === Number(productId)
);

if (existing) {
existing.quantity += 1;
} else {
cart.push({
…product,
quantity: 1
});
}

updateCart();

alert(“محصول به سبد خرید اضافه شد 🛍️”);
}

function removeFromCart(productId) {

cart = cart.filter(
item => Number(item.id) !== Number(productId)
);

updateCart();
}

function updateCart() {

const countElement =
document.getElementById(“cart-count”);

const itemsElement =
document.getElementById(“cart-items”);

const totalElement =
document.getElementById(“cart-total”);

const count = cart.reduce(
(sum, item) => sum + item.quantity,
0
);

if (countElement) {
countElement.textContent =
count.toLocaleString(“fa-IR”);
}

if (!itemsElement || !totalElement) return;

if (cart.length === 0) {

itemsElement.innerHTML =
  '<p class="empty">سبد خرید خالیه ♡</p>';
totalElement.textContent = "۰ تومان";
return;

}

let total = 0;

itemsElement.innerHTML = “”;

cart.forEach(item => {

total += Number(item.Price || 0) * item.quantity;
const image =
  item.image_url ||
  "https://via.placeholder.com/150?text=Luna";
const div = document.createElement("div");
div.className = "cart-item";
div.innerHTML = `
  <img src="${image}" alt="">
  <div class="cart-item-info">
    <strong>${escapeHtml(item.Name)}</strong>
    <div>
      ${item.quantity.toLocaleString("fa-IR")} ×
      ${formatPrice(item.Price)}
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

totalElement.textContent = formatPrice(total);
}

function openCart() {
updateCart();
showModal(“cart-modal”);
}

function closeCart() {
hideModal(“cart-modal”);
}

/* =========================
ADMIN LOGIN
========================= */

function openAdminLogin() {
showModal(“admin-login-modal”);
}

function closeAdminLogin() {
hideModal(“admin-login-modal”);
}

async function adminLogin() {

const email =
document.getElementById(“admin-email”).value.trim();

const password =
document.getElementById(“admin-password”).value;

const message =
document.getElementById(“admin-login-message”);

if (!email || !password) {

message.textContent =
  "ایمیل و رمز عبور را وارد کن.";
return;

}

message.textContent = “در حال ورود…”;

try {

const { data, error } =
  await supabaseClient.auth.signInWithPassword({
    email,
    password
  });
if (error) {
  console.error(error);
  message.textContent =
    "ایمیل یا رمز عبور اشتباه است.";
  return;
}
if (!data.user || data.user.id !== ADMIN_ID) {
  await supabaseClient.auth.signOut();
  message.textContent =
    "این حساب اجازه ورود به پنل مدیریت را ندارد.";
  return;
}
closeAdminLogin();
await openAdminPanel();

} catch (error) {

console.error(error);
message.textContent =
  "خطایی در ورود رخ داد.";

}
}

/* =========================
ADMIN PANEL
========================= */
