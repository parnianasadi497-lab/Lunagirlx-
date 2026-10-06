const SUPABASE_URL = 'https://qdyudmrauanjbvwcacct.supabase.co'
const SUPABASE_KEY = "sb_publishable_-mb1R7J32iEeWMMx-RNlbg_1PhNBKAR";

let products = [];
let cart = [];


// =====================================
// دریافت محصولات
// =====================================

async function loadProducts() {

  const container =
    document.getElementById("products-container");

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


    const text =
      await response.text();


    if (!response.ok) {

      container.innerHTML = `
        <p style="color:#d97899;direction:rtl;">
          خطا ${response.status}
          <br><br>
          ${text}
        </p>
      `;

      return;
    }


    products =
      JSON.parse(text);


    if (products.length === 0) {

      container.innerHTML =
        "<p>هنوز محصولی اضافه نشده است 🌸</p>";

      return;
    }


    container.innerHTML =
      products.map(product => `

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
      <p style="color:#d97899;direction:rtl;">
        خطای اتصال:
        <br>
        ${error.message}
      </p>
    `;

  }

}


// =====================================
// پنل مدیریت
// =====================================

function openAdmin() {

  document.getElementById("admin-panel").style.display =
    "block";

}


function closeAdmin() {

  document.getElementById("admin-panel").style.display =
    "none";

}


// =====================================
// افزودن محصول
// =====================================

async function saveProduct() {

  const name =
    document.getElementById("admin-name")
      .value
      .trim();


  const price =
    document.getElementById("admin-price")
      .value;


  const description =
    document.getElementById("admin-description")
      .value
      .trim();


  const stock =
    document.getElementById("admin-stock")
      .value;


  const fileInput =
    document.getElementById("admin-image-file");


  const imageFile =
    fileInput.files[0];


  const message =
    document.getElementById("admin-message");


  // -----------------------------
  // بررسی اطلاعات
  // -----------------------------

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
    "در حال آپلود عکس... ⏳";


  try {

    // -----------------------------
    // ساخت نام فایل
    // -----------------------------

    const safeName =
      imageFile.name
        .replace(/[^a-zA-Z0-9._-]/g, "-");


    const fileName =
      `${Date.now()}-${safeName}`;


    // -----------------------------
    // آپلود به Storage
    // -----------------------------

    const uploadResponse =
      await fetch(
        `${SUPABASE_URL}/storage/v1/object/products/${fileName}`,
        {

          method: "POST",

          headers: {

            "apikey":
              SUPABASE_KEY,

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


    // -----------------------------
    // URL عکس
    // -----------------------------

    const imageUrl =
      `${SUPABASE_URL}/storage/v1/object/public/products/${fileName}`;


    message.textContent =
      "عکس آپلود شد 💗";


    // -----------------------------
    // ثبت محصول
    // -----------------------------

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

            Price: Number(price),

            Description: description,

            image_url: imageUrl,

            stock: Number(stock || 0)

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


    // -----------------------------
    // موفقیت
    // -----------------------------

    message.textContent =
      "محصول با موفقیت اضافه شد 🎀";


    // پاک کردن فرم

    document.getElementById("admin-name").value = "";

    document.getElementById("admin-price").value = "";

    document.getElementById("admin-description").value = "";

    document.getElementById("admin-stock").value = "";

    document.getElementById("admin-image-file").value = "";


    // بروزرسانی محصولات

    await loadProducts();


    setTimeout(() => {

      closeAdmin();

    }, 1000);


  } catch (error) {

    message.textContent =
      "خطای اتصال: " + error.message;

  }

}


// =====================================
// سبد خرید
// =====================================

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
    document.getElementById("cart-count");


  const items =
    document.getElementById("cart-items");


  const total =
    document.getElementById("cart-total");


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


  const sum =
    cart.reduce(
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


// =====================================
// شروع
// =====================================

loadProducts();
