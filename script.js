const SUPABASE_URL = https://qdyudmrauanjbvwcacct.supabase.co'

const SUPABASE_KEY = “sb_publishable_-mb1R7J32iEeWMMx-RNlbg_1PhNBKAR”;

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
if (element) {
element.classList.add(“active”);
}
}

function hideModal(id) {
const element = document.getElementById(id);
if (element) {
element.classList.remove(“active”);
}
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
LOAD PRODUCTS
========================= */

async function loadProducts() {

const container =
document.getElementById(“products-container”);

if (!container) return;

container.innerHTML =
‘در حال بارگذاری محصولات…’;

try {

const { data, error } = await supabaseClient
  .from("products")
  .select("*")
  .order("created_at", { ascending: false });
if (error) {
  console.error("Products error:", error);
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
  const card =
    document.createElement("div");
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
      <h3>
        ${escapeHtml(product.Name || "محصول")}
      </h3>
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

console.error("Load products error:", error);
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
  ...product,
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
  count.toLocaleString("fa-IR");

}

if (!itemsElement || !totalElement) return;

if (cart.length === 0) {

itemsElement.innerHTML =
  '<p class="empty">سبد خرید خالیه ♡</p>';
totalElement.textContent =
  "۰ تومان";
return;

}

let total = 0;

itemsElement.innerHTML = “”;

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

const emailElement =
document.getElementById(“admin-email”);

const passwordElement =
document.getElementById(“admin-password”);

const message =
document.getElementById(“admin-login-message”);

if (!emailElement || !passwordElement) return;

const email =
emailElement.value.trim();

const password =
passwordElement.value;

if (!email || !password) {

if (message) {
  message.textContent =
    "ایمیل و رمز عبور را وارد کن.";
}
return;

}

if (message) {
message.textContent =
“در حال ورود…”;
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

console.error("Admin login error:", error);
if (message) {
  message.textContent =
    "خطایی در ورود رخ داد.";
}

}
}

/* =========================
ADMIN PANEL
========================= */

async function openAdminPanel() {

const {
data: { session }
} = await supabaseClient.auth.getSession();

if (!session || !session.user) {

openAdminLogin();
return;

}

if (session.user.id !== ADMIN_ID) {

await supabaseClient.auth.signOut();
alert("دسترسی غیرمجاز");
return;

}

showModal(“admin-panel-modal”);

await loadOrders();
}

function closeAdminPanel() {

hideModal(“admin-panel-modal”);
}

async function adminLogout() {

await supabaseClient.auth.signOut();

closeAdminPanel();

alert(“از پنل مدیریت خارج شدی.”);
}

/* =========================
SAVE PRODUCT
========================= */

async function saveProduct() {

const nameElement =
document.getElementById(“product-name”);

const priceElement =
document.getElementById(“product-price”);

const descriptionElement =
document.getElementById(“product-description”);

const stockElement =
document.getElementById(“product-stock”);

const imageElement =
document.getElementById(“product-image”);

if (
!nameElement ||
!priceElement ||
!descriptionElement ||
!stockElement ||
!imageElement
) {

alert("فیلدهای محصول پیدا نشدند.");
return;

}

const name =
nameElement.value.trim();

const price =
Number(priceElement.value);

const description =
descriptionElement.value.trim();

const stock =
Number(stockElement.value);

const imageFile =
imageElement.files[0];

if (!name) {

alert("نام محصول را وارد کن.");
return;

}

if (!price || price <= 0) {

alert("قیمت محصول را وارد کن.");
return;

}

if (!imageFile) {

alert("عکس محصول را انتخاب کن.");
return;

}

try {

const {
  data: { session }
} = await supabaseClient.auth.getSession();
if (!session || session.user.id !== ADMIN_ID) {
  alert("ابتدا وارد پنل مدیریت شو.");
  return;
}
const fileName =
  Date.now() +
  "-" +
  imageFile.name
    .replace(/\s+/g, "-")
    .replace(/[^\w.-]/g, "");
const filePath =
  fileName;
const {
  error: uploadError
} = await supabaseClient
  .storage
  .from("products")
  .upload(
    filePath,
    imageFile,
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
    "آپلود عکس با مشکل مواجه شد."
  );
  return;
}
const {
  data: publicData
} =
  supabaseClient
    .storage
    .from("products")
    .getPublicUrl(filePath);
const imageUrl =
  publicData.publicUrl;
const {
  error: insertError
} =
  await supabaseClient
    .from("products")
    .insert([
      {
        Name: name,
        Price: price,
        Description: description,
        image_url: imageUrl,
        stock: stock
      }
    ]);
if (insertError) {
  console.error(
    "Insert product error:",
    insertError
  );
  alert(
    "ذخیره محصول با مشکل مواجه شد."
  );
  return;
}
alert(
  "محصول با موفقیت اضافه شد 🎉"
);
nameElement.value = "";
priceElement.value = "";
descriptionElement.value = "";
stockElement.value = "";
imageElement.value = "";
await loadProducts();

} catch (error) {

console.error(
  "Save product error:",
  error
);
alert(
  "خطایی هنگام ذخیره محصول رخ داد."
);

}
}

/* =========================
LOAD ORDERS
========================= */

async function loadOrders() {

const container =
document.getElementById(“orders-container”);

if (!container) return;

container.innerHTML =
‘در حال بارگذاری سفارش‌ها…’;

try {

const {
  data: { session }
} = await supabaseClient.auth.getSession();
if (
  !session ||
  session.user.id !== ADMIN_ID
) {
  container.innerHTML =
    "<p>دسترسی غیرمجاز</p>";
  return;
}
const {
  data,
  error
} =
  await supabaseClient
    .from("orders")
    .select("*")
    .order(
      "created_at",
      {
        ascending: false
      }
    );
if (error) {
  console.error(
    "Orders error:",
    error
  );
  container.innerHTML =
    "<p>نمایش سفارش‌ها با مشکل مواجه شد.</p>";
  return;
}
if (!data || data.length === 0) {
  container.innerHTML =
    '<p class="empty">هنوز سفارشی ثبت نشده ♡</p>';
  return;
}
container.innerHTML = "";
data.forEach(order => {
  let items = [];
  try {
    items =
      typeof order.items === "string"
        ? JSON.parse(order.items)
        : order.items || [];
  } catch {
    items = [];
  }
  const orderCard =
    document.createElement("div");
  orderCard.className =
    "order-card";
  const date =
    order.created_at
      ? new Date(
          order.created_at
        ).toLocaleString("fa-IR")
      : "-";
  const itemsHtml =
    items.map(item => `
      <div class="order-product">
        <span>
          ${escapeHtml(item.Name || "محصول")}
        </span>
        <span>
          × ${Number(item.quantity || 1)}
        </span>
      </div>
    `).join("");
  orderCard.innerHTML = `
    <div class="order-top">
      <strong>
        سفارش #${escapeHtml(order.id)}
      </strong>
      <span>
        ${escapeHtml(date)}
      </span>
    </div>
    <div class="order-customer">
      <h4>👤 اطلاعات مشتری</h4>
      <p>
        <strong>نام:</strong>
        ${escapeHtml(order.first_name)}
        ${escapeHtml(order.last_name)}
      </p>
      <p>
        <strong>تلفن:</strong>
        ${escapeHtml(order.phone)}
      </p>
      <p>
        <strong>استان:</strong>
        ${escapeHtml(order.province)}
      </p>
      <p>
        <strong>شهر:</strong>
        ${escapeHtml(order.city)}
      </p>
      <p>
        <strong>آدرس:</strong>
        ${escapeHtml(order.address)}
      </p>
      <p>
        <strong>کد پستی:</strong>
        ${escapeHtml(order.postal_code)}
      </p>
    </div>
    <div class="order-products">
      <h4>🛍️ محصولات</h4>
      ${itemsHtml || "<p>اطلاعات محصول موجود نیست.</p>"}
    </div>
    <div class="order-bottom">
      <strong>
        مبلغ:
        ${formatPrice(order.total)}
      </strong>
      <select
        onchange="updateOrderStatus(${Number(order.id)}, this.value)"
      >
        <option
          value="جدید"
          ${order.status === "جدید" ? "selected" : ""}
        >
          جدید
        </option>
        <option
          value="در حال آماده‌سازی"
          ${order.status === "در حال آماده‌سازی" ? "selected" : ""}
        >
          در حال آماده‌سازی
        </option>
        <option
          value="ارسال شد"
          ${order.status === "ارسال شد" ? "selected" : ""}
        >
          ارسال شد
        </option>
        <option
          value="تحویل داده شد"
          ${order.status === "تحویل داده شد" ? "selected" : ""}
        >
          تحویل داده شد
        </option>
        <option
          value="لغو شد"
          ${order.status === "لغو شد" ? "selected" : ""}
        >
          لغو شد
        </option>
      </select>
    </div>
  `;
  container.appendChild(orderCard);
});

} catch (error) {

console.error(
  "Load orders error:",
  error
);
container.innerHTML =
  "<p>خطایی هنگام دریافت سفارش‌ها رخ داد.</p>";

}
}

/* =========================
UPDATE ORDER STATUS
========================= */

async function updateOrderStatus(
orderId,
newStatus
) {

try {

const {
  data: { session }
} = await supabaseClient.auth.getSession();
if (
  !session ||
  session.user.id !== ADMIN_ID
) {
  alert("دسترسی غیرمجاز");
  return;
}
const {
  error
} =
  await supabaseClient
    .from("orders")
    .update({
      status: newStatus
    })
    .eq(
      "id",
      orderId
    );
if (error) {
  console.error(
    "Update order error:",
    error
  );
  alert(
    "تغییر وضعیت سفارش انجام نشد."
  );
  return;
}
alert(
  "وضعیت سفارش تغییر کرد ✅"
);

} catch (error) {

console.error(error);
alert(
  "خطایی هنگام تغییر وضعیت رخ داد."
);

}
}

/* =========================
CHECKOUT
========================= */

function openCheckout() {

if (cart.length === 0) {

alert(
  "سبد خریدت خالیه 🛍️"
);
return;

}

showModal(“checkout-modal”);
}

function closeCheckout() {

hideModal(“checkout-modal”);
}

/* =========================
SUBMIT ORDER
========================= */

async function submitOrder(event) {

if (event) {
event.preventDefault();
}

if (cart.length === 0) {

alert(
  "سبد خرید خالی است."
);
return;

}

const firstName =
document
.getElementById(“first-name”)
?.value
.trim();

const lastName =
document
.getElementById(“last-name”)
?.value
.trim();

const phone =
document
.getElementById(“phone”)
?.value
.trim();

const province =
document
.getElementById(“province”)
?.value
.trim();

const city =
document
.getElementById(“city”)
?.value
.trim();

const address =
document
.getElementById(“address”)
?.value
.trim();

const postalCode =
document
.getElementById(“postal-code”)
?.value
.trim();

if (
!firstName ||
!lastName ||
!phone ||
!province ||
!city ||
!address ||
!postalCode
) {

alert(
  "لطفاً همه اطلاعات را کامل وارد کن."
);
return;

}

const total =
cart.reduce(
(sum, item) =>
sum +
Number(item.Price || 0) *
item.quantity,
0
);

const orderItems =
cart.map(item => ({
id: item.id,
Name: item.Name,
Price: item.Price,
image_url: item.image_url || “”,
quantity: item.quantity
}));

try {

const {
  error
} =
  await supabaseClient
    .from("orders")
    .insert([
      {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        province: province,
        city: city,
        address: address,
        postal_code: postalCode,
        items: orderItems,
        total: total,
        status: "جدید"
      }
    ]);
if (error) {
  console.error(
    "Submit order error:",
    error
  );
  alert(
    "ثبت سفارش با مشکل مواجه شد."
  );
  return;
}
alert(
  "سفارشت با موفقیت ثبت شد 💗"
);
cart = [];
updateCart();
const form =
  document.getElementById(
    "checkout-form"
  );
if (form) {
  form.reset();
}
closeCheckout();
closeCart();

} catch (error) {

console.error(error);
alert(
  "خطایی هنگام ثبت سفارش رخ داد."
);

}
}

/* =========================
START
========================= */

document.addEventListener(
“DOMContentLoaded”,
async function () {

await loadProducts();
updateCart();
const {
  data: { session }
} =
  await supabaseClient.auth.getSession();
if (
  session &&
  session.user &&
  session.user.id === ADMIN_ID
) {
  console.log(
    "Admin session active."
  );
}

}
);
