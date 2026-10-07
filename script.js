const SUPABASE_URL = 'https://qdyudmrauanjbvwcacct.supabase.co'
const SUPABASE_KEY = "sb_publishable_-mb1R7J32iEeWMMx-RNlbg_1PhNBKAR";

let products = [];
let cart = [];

/* =========================
LOAD PRODUCTS
========================= */

async function loadProducts() {

const container =
document.getElementById(“products-container”);

try {

const response = await fetch(
  `${SUPABASE_URL}/rest/v1/products?select=*`,
  {
    method: "GET",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`
    }
  }
);
const text = await response.text();
if (!response.ok) {
  container.innerHTML = `
    <p style="color:#d97899;">
      خطا ${response.status}
      <br><br>
      ${text}
    </p>
  `;
  return;
}
products = JSON.parse(text);
if (products.length === 0) {
  container.innerHTML =
    "<p>هنوز محصولی اضافه نشده است 🌸</p>";
  return;
}
container.innerHTML = products.map(product => `
  <article class="product-card">
    ${
      product.image_url
      ? `
        <img
          class="product-image"
          src="${product.image_url}"
          alt="${product.Name}"
        >
      `
      : `
        <div class="product-image"></div>
      `
    }
    <div class="product-info">
      <h3>
        ${product.Name}
      </h3>
      <p class="product-description">
        ${product.Description || ""}
      </p>
      <div class="product-price">
        ${Number(product.Price).toLocaleString("fa-IR")}
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

} catch (error) {

container.innerHTML = `
  <p style="color:#d97899;">
    خطای اتصال:
    <br>
    ${error.message}
  </p>
`;

}

}

/* =========================
ADMIN
========================= */

function openAdmin() {

document.getElementById(
“admin-panel”
).style.display = “block”;

}

function closeAdmin() {

document.getElementById(
“admin-panel”
).style.display = “none”;

}

/* =========================
ADD PRODUCT
========================= */

async function saveProduct() {

const name =
document.getElementById(“admin-name”)
.value.trim();

const price =
document.getElementById(“admin-price”)
.value;

const description =
document.getElementById(“admin-description”)
.value.trim();

const stock =
document.getElementById(“admin-stock”)
.value;

const fileInput =
document.getElementById(“admin-image-file”);

const imageFile =
fileInput.files[0];

const message =
document.getElementById(“admin-message”);

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

message.textContent =
“در حال آپلود عکس… ⏳”;

try {

const safeName =
  imageFile.name.replace(
    /[^a-zA-Z0-9._-]/g,
    "-"
  );
const fileName =
  `${Date.now()}-${safeName}`;
/* UPLOAD IMAGE */
const uploadResponse =
  await fetch(
    `${SUPABASE_URL}/storage/v1/object/products/${fileName}`,
    {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization":
          `Bearer ${SUPABASE_KEY}`,
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
/* INSERT PRODUCT */
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
          `Bearer ${SUPABASE_KEY}`,
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
document.getElementById(
  "admin-name"
).value = "";
document.getElementById(
  "admin-price"
).value = "";
document.getElementById(
  "admin-description"
).value = "";
document.getElementById(
  "admin-stock"
).value = "";
document.getElementById(
  "admin-image-file"
).value = "";
await loadProducts();
setTimeout(() => {
  closeAdmin();
}, 1000);

} catch (error) {

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

/* =========================
UPDATE CART
========================= */

function updateCart() {

const count =
document.getElementById(
“cart-count”
);

const items =
document.getElementById(
“cart-items”
);

const total =
document.getElementById(
“cart-total”
);

count.textContent =
cart.length;

if (cart.length === 0) {

items.innerHTML =
  "<p>سبد خرید خالی است 🌸</p>";
total.textContent =
  "0";
return;

}

items.innerHTML =
cart.map(
(product, index) => `

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
  `
).join("");

const sum =
cart.reduce(
(total, product) =>
total + Number(product.Price),
0
);

total.textContent =
sum.toLocaleString(“fa-IR”);

}

/* =========================
CART OPEN / CLOSE
========================= */

function openCart() {

document
.getElementById(“cart”)
.classList.add(“open”);

document
.getElementById(“overlay”)
.classList.add(“show”);

}

function closeCart() {

document
.getElementById(“cart”)
.classList.remove(“open”);

document
.getElementById(“overlay”)
.classList.remove(“show”);

}

/* =========================
CHECKOUT
========================= */

function openCheckout() {

if (cart.length === 0) {

alert(
  "سبد خرید خالی است 🌸"
);
return;

}

const checkoutModal =
document.getElementById(
“checkout-modal”
);

const checkoutItems =
document.getElementById(
“checkout-items”
);

const checkoutTotal =
document.getElementById(
“checkout-total-price”
);

const finalPrice =
document.getElementById(
“final-price”
);

checkoutItems.innerHTML =
cart.map(
product => `

    <div class="checkout-item">
      <span>
        ${product.Name}
      </span>
      <strong>
        ${Number(product.Price)
          .toLocaleString("fa-IR")}
        تومان
      </strong>
    </div>
  `
).join("");

const total =
cart.reduce(
(sum, product) =>
sum + Number(product.Price),
0
);

checkoutTotal.textContent =
total.toLocaleString(“fa-IR”);

finalPrice.textContent =
total.toLocaleString(“fa-IR”);

checkoutModal.style.display =
“block”;

closeCart();

}

function closeCheckout() {

document.getElementById(
“checkout-modal”
).style.display = “none”;

}

/* =========================
SUBMIT ORDER
========================= */

async function submitOrder(event) {

event.preventDefault();

const message =
document.getElementById(
“checkout-message”
);

if (cart.length === 0) {

message.textContent =
  "سبد خرید خالی است 🌸";
return;

}

const firstName =
document.getElementById(
“customer-first-name”
).value.trim();

const lastName =
document.getElementById(
“customer-last-name”
).value.trim();

const province =
document.getElementById(
“customer-province”
).value.trim();

const city =
document.getElementById(
“customer-city”
).value.trim();

const address =
document.getElementById(
“customer-address”
).value.trim();

const postalCode =
document.getElementById(
“customer-postal-code”
).value.trim();

const phone =
document.getElementById(
“customer-phone”
).value.trim();

const total =
cart.reduce(
(sum, product) =>
sum + Number(product.Price),
0
);

message.textContent =
“در حال آماده‌سازی سفارش… ⏳”;

/*
فعلاً اینجا درگاه واقعی وصل نشده.
در مرحله بعد این قسمت را به درگاه پرداخت
متصل می‌کنیم.
*/

console.log({
firstName,
lastName,
province,
city,
address,
postalCode,
phone,
cart,
total
});

message.textContent =
“اطلاعات سفارش دریافت شد 💗”;

alert(
“اطلاعات سفارش آماده شد. درگاه پرداخت را در مرحله بعد وصل می‌کنیم 💳”
);

}

/* =========================
START
========================= */

loadProducts();

updateCart();
