const SUPABASE_URL = "https://qdyudmrauanjbvwcacct.supabase.co/rest/v1/";
const SUPABASE_KEY = "sb_publishable_-mb1R7J32iEeWMMx-RNlbg_1PhNBKAR";

let products = [];
let cart = [];

async function loadProducts() {
  const container = document.getElementById("products-container");

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      throw new Error("خطا در دریافت محصولات");
    }

    products = data;

    if (products.length === 0) {
      container.innerHTML = "<p>هنوز محصولی اضافه نشده است.</p>";
      return;
    }

    container.innerHTML = products.map(product => `
      <article class="product-card">

        ${
          product.image_url
            ? `<img
                class="product-image"
                src="${product.image_url}"
                alt="${product.Name}"
              >`
            : `<div class="product-image"></div>`
        }

        <div class="product-info">

          <h3>${product.Name}</h3>

          <p class="product-description">
            ${product.Description || ""}
          </p>

          <div class="product-price">
            ${Number(product.Price).toLocaleString("fa-IR")} تومان
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
    console.error(error);

    container.innerHTML = `
      container.innerHTML = `
  <p style="direction:rtl; color:#d97899;">
    خطا: ${error.message}
  </p>
`;
  
      
    `;
  }
}


function addToCart(productId) {

  const product = products.find(
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
    document.getElementById("cart-count");

  const items =
    document.getElementById("cart-items");

  const total =
    document.getElementById("cart-total");


  count.textContent = cart.length;


  if (cart.length === 0) {

    items.innerHTML =
      "<p>سبد خرید خالی است 🌸</p>";

    total.textContent = "0";

    return;
  }


  items.innerHTML = cart.map(
    (product, index) => `

      <div class="cart-item">

        <h4>${product.Name}</h4>

        <p>
          ${Number(product.Price).toLocaleString("fa-IR")}
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


  const sum = cart.reduce(
    (total, product) =>
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


loadProducts();
