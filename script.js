const SUPABASE_URL = "https://qdyudmrauanjbvwcacct.supabase.co/rest/v1/";
const SUPABASE_KEY = "sb_publishable_-mb1R7J32iEeWMMx-RNlbg_1PhNBKAR";

async function loadProducts() {
  const container = document.getElementById("products-container");

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=id,name,price,description,image_url,stock`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.log(data);
      throw new Error(JSON.stringify(data));
    }

    container.innerHTML = data.map(product => `
      <article class="product-card">
        ${
          product.image_url
            ? `<img class="product-image" src="${product.image_url}" alt="${product.name}">`
            : `<div class="product-image"></div>`
        }

        <div class="product-info">
          <h3>${product.name}</h3>
          <p class="product-description">${product.description || ""}</p>
          <div class="product-price">
            ${Number(product.price).toLocaleString("fa-IR")} تومان
          </div>
          <button class="add-btn">
            افزودن به سبد خرید 🛍️
          </button>
        </div>
      </article>
    `).join("");

  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>دریافت محصولات با مشکل مواجه شد.</p>";
  }
}

loadProducts();
