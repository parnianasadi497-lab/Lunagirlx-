/* =========================================================
   LUNA GIRL - COMPLETE SCRIPT
   Products + Cart + Checkout + Admin + Orders + Storage
========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
  "https://qdyudmrauanjbvwcacct.supabase.co";

/*
  IMPORTANT:
  Put your CURRENT Supabase Publishable key below.
  Keep it all on ONE LINE.
*/
const SUPABASE_KEY =
  "sb_publishable_-mb1R7J32iEeWMMx-RNlbg_1PhNBKAR";

const ADMIN_ID =
  "ac82e56f-d171-402e-a0f6-8664ec1be7ba";


/* =========================================================
   CHECK SUPABASE
========================================================= */

let supabaseClient = null;

function showFatalError(message) {
  console.error(message);

  const productsContainer =
    document.getElementById("products-container");

  if (productsContainer) {
    productsContainer.innerHTML = `
      <div style="
        padding:25px;
        text-align:center;
        color:#a33;
        background:#fff5f5;
        border-radius:15px;
        margin:20px 0;
      ">
        <strong>خطایی رخ داده است.</strong>
        <br>
        <small>${message}</small>
      </div>
    `;
  }
}


function initSupabase() {

  if (
    typeof window.supabase === "undefined" ||
    typeof window.supabase.createClient !== "function"
  ) {
    showFatalError(
      "کتابخانه Supabase بارگذاری نشده است."
    );
    return false;
  }

  if (
    !SUPABASE_KEY ||
    SUPABASE_KEY === "YOUR_CURRENT_SUPABASE_PUBLISHABLE_KEY"
  ) {
    showFatalError(
      "کلید Supabase در script.js وارد نشده است."
    );
    return false;
  }

  try {

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

    return true;

  } catch (error) {

    console.error(
      "Supabase initialization error:",
      error
    );

    showFatalError(
      "اتصال به Supabase برقرار نشد."
    );

    return false;
  }
}


/* =========================================================
   GLOBAL DATA
========================================================= */

let products = [];
let cart = [];

let currentUser = null;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    console.log("Luna Girl started.");

    if (!initSupabase()) {
      return;
    }

    loadCart();

    updateCartCount();

    await checkCurrentUser();

    await loadProducts();

  }
);


/* =========================================================
   IMAGE URL
========================================================= */

function getImageUrl(imageUrl) {

  if (!imageUrl) {
    return "";
  }

  const value =
    String(imageUrl).trim();

  if (!value) {
    return "";
  }

  /*
    If Supabase already gave us a complete URL,
    use it exactly as it is.
  */
  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  /*
    Otherwise create a public Storage URL.
  */
  return (
    SUPABASE_URL +
    "/storage/v1/object/public/products/" +
    value.replace(/^\/+/, "")
  );
}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

  const container =
    document.getElementById(
      "products-container"
    );

  if (!container) {
    console.error(
      "products-container not found."
    );
    return;
  }

  container.innerHTML = `
    <p class="loading">
      در حال بارگذاری محصولات...
    </p>
  `;

  try {

    const {
      data,
      error
    } = await supabaseClient
      .from("products")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );

    if (error) {
      console.error(
        "Products error:",
        error
      );

      container.innerHTML = `
        <p class="loading">
          دریافت محصولات انجام نشد.
          <br>
          <small>${escapeHtml(error.message)}</small>
        </p>
      `;

      return;
    }

    products =
      Array.isArray(data)
        ? data
        : [];

    container.innerHTML = "";

    if (products.length === 0) {

      container.innerHTML = `
        <p class="loading">
          هنوز محصولی اضافه نشده است.
        </p>
      `;

      return;
    }

    products.forEach(
      product => {

        const card =
          createProductCard(product);

        container.appendChild(card);

      }
    );

  } catch (error) {

    console.error(
      "loadProducts error:",
      error
    );

    container.innerHTML = `
      <p class="loading">
        خطا در نمایش محصولات.
      </p>
    `;
  }
}


/* =========================================================
   CREATE PRODUCT CARD
========================================================= */

function createProductCard(product) {

  const card =
    document.createElement("div");

  card.className =
    "product-card";


  /* IMAGE */

  const imageBox =
    document.createElement("div");

  imageBox.className =
    "product-image";


  const image =
    document.createElement("img");

  const imageUrl =
    getImageUrl(product.image_url);

  image.alt =
    product.Name || "Luna Girl";

  image.loading =
    "lazy";

  image.style.width =
    "100%";

  image.style.height =
    "100%";

  image.style.objectFit =
    "cover";


  if (imageUrl) {

    image.src =
      imageUrl;

    image.onerror =
      function () {

        console.error(
          "Image failed:",
          imageUrl
        );

        image.style.display =
          "none";

        imageBox.innerHTML = `
          <div style="
            display:flex;
            align-items:center;
            justify-content:center;
            width:100%;
            height:100%;
            font-size:40px;
          ">
            ✦
          </div>
        `;
      };

  } else {

    imageBox.innerHTML = `
      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:100%;
        height:100%;
        font-size:40px;
      ">
        ✦
      </div>
    `;
  }


  imageBox.appendChild(image);


  /* CONTENT */

  const content =
    document.createElement("div");

  content.className =
    "product-info";


  const name =
    document.createElement("h3");

  name.textContent =
    product.Name || "محصول بدون نام";


  const description =
    document.createElement("p");

  description.textContent =
    product.Description || "";


  const bottom =
    document.createElement("div");

  bottom.className =
    "product-bottom";


  const price =
    document.createElement("strong");

  price.textContent =
    formatPrice(product.Price);


  const button =
    document.createElement("button");

  button.className =
    "main-btn";

  button.type =
    "button";

  button.textContent =
    "افزودن به سبد";


  button.addEventListener(
    "click",
    function () {

      addToCart(product);

    }
  );


  bottom.appendChild(price);

  bottom.appendChild(button);

  content.appendChild(name);

  content.appendChild(description);

  content.appendChild(bottom);


  card.appendChild(imageBox);

  card.appendChild(content);


  return card;
}


/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(price) {

  const number =
    Number(price) || 0;

  return (
    new Intl.NumberFormat("fa-IR")
      .format(number)
    + " تومان"
  );
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   CART
========================================================= */

function loadCart() {

  try {

    const saved =
      localStorage.getItem(
        "lunaGirlCart"
      );

    cart =
      saved
        ? JSON.parse(saved)
        : [];

    if (!Array.isArray(cart)) {
      cart = [];
    }

  } catch (error) {

    console.error(
      "Cart load error:",
      error
    );

    cart = [];
  }
}


function saveCart() {

  try {

    localStorage.setItem(
      "lunaGirlCart",
      JSON.stringify(cart)
    );

  } catch (error) {

    console.error(
      "Cart save error:",
      error
    );
  }
}


function addToCart(product) {

  const existing =
    cart.find(
      item =>
        String(item.id) ===
        String(product.id)
    );

  const stock =
    Number(product.stock) || 0;

  if (stock <= 0) {

    alert(
      "این محصول موجود نیست."
    );

    return;
  }


  if (existing) {

    if (
      existing.quantity >=
      stock
    ) {

      alert(
        "بیشتر از موجودی نمی‌توانی اضافه کنی."
      );

      return;
    }

    existing.quantity += 1;

  } else {

    cart.push({

      id: product.id,

      Name: product.Name,

      Price: Number(product.Price) || 0,

      image_url:
        product.image_url || "",

      quantity: 1,

      stock: stock

    });

  }


  saveCart();

  updateCartCount();

  renderCart();

}


function removeFromCart(id) {

  cart =
    cart.filter(
      item =>
        String(item.id) !==
        String(id)
    );

  saveCart();

  updateCartCount();

  renderCart();
}


function changeQuantity(
  id,
  change
) {

  const item =
    cart.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (!item) {
    return;
  }


  const newQuantity =
    item.quantity + change;


  if (newQuantity <= 0) {

    removeFromCart(id);

    return;
  }


  if (
    item.stock &&
    newQuantity > item.stock
  ) {

    alert(
      "بیشتر از موجودی نمی‌توانی اضافه کنی."
    );

    return;
  }


  item.quantity =
    newQuantity;

  saveCart();

  updateCartCount();

  renderCart();
}


function updateCartCount() {

  const countElement =
    document.getElementById(
      "cart-count"
    );

  if (!countElement) {
    return;
  }

  const count =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0),
      0
    );

  countElement.textContent =
    new Intl.NumberFormat(
      "fa-IR"
    ).format(count);
}


/* =========================================================
   CART MODAL
========================================================= */

function openCart() {

  renderCart();

  const modal =
    document.getElementById(
      "cart-modal"
    );

  if (modal) {
    modal.style.display =
      "flex";
  }
}


function closeCart() {

  const modal =
    document.getElementById(
      "cart-modal"
    );

  if (modal) {
    modal.style.display =
      "none";
  }
}


function renderCart() {

  const container =
    document.getElementById(
      "cart-items"
    );

  const totalElement =
    document.getElementById(
      "cart-total"
    );

  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (cart.length === 0) {

    container.innerHTML = `
      <p style="text-align:center;">
        سبد خرید خالی است ♡
      </p>
    `;

    if (totalElement) {
      totalElement.textContent =
        "۰ تومان";
    }

    return;
  }


  let total = 0;


  cart.forEach(
    item => {

      const price =
        Number(item.Price) || 0;

      const quantity =
        Number(item.quantity) || 0;

      total +=
        price * quantity;


      const row =
        document.createElement("div");

      row.className =
        "cart-item";


      row.innerHTML = `
        <div>
          <strong>
            ${escapeHtml(item.Name)}
          </strong>

          <div>
            ${formatPrice(price)}
          </div>
        </div>

        <div style="
          display:flex;
          align-items:center;
          gap:8px;
        ">

          <button
            type="button"
            class="qty-btn"
            data-action="minus"
          >
            −
          </button>

          <span>
            ${quantity}
          </span>

          <button
            type="button"
            class="qty-btn"
            data-action="plus"
          >
            +
          </button>

          <button
            type="button"
            class="remove-cart-btn"
            data-action="remove"
          >
            حذف
          </button>

        </div>
      `;


      row
        .querySelector(
          '[data-action="minus"]'
        )
        .addEventListener(
          "click",
          () =>
            changeQuantity(
              item.id,
              -1
            )
        );


      row
        .querySelector(
          '[data-action="plus"]'
        )
        .addEventListener(
          "click",
          () =>
            changeQuantity(
              item.id,
              1
            )
        );


      row
        .querySelector(
          '[data-action="remove"]'
        )
        .addEventListener(
          "click",
          () =>
            removeFromCart(
              item.id
            )
        );


      container.appendChild(row);

    }
  );


  if (totalElement) {

    totalElement.textContent =
      formatPrice(total);

  }
}


/* =========================================================
   CHECKOUT
========================================================= */

function openCheckout() {

  if (cart.length === 0) {

    alert(
      "سبد خرید خالی است."
    );

    return;
  }


  closeCart();


  const modal =
    document.getElementById(
      "checkout-modal"
    );

  if (modal) {
    modal.style.display =
      "flex";
  }
}


function closeCheckout() {

  const modal =
    document.getElementById(
      "checkout-modal"
    );

  if (modal) {
    modal.style.display =
      "none";
  }
}


async function submitOrder(event) {

  event.preventDefault();


  if (cart.length === 0) {

    showCheckoutMessage(
      "سبد خرید خالی است."
    );

    return;
  }


  const message =
    document.getElementById(
      "checkout-message"
    );


  if (message) {
    message.textContent =
      "در حال ثبت سفارش...";
  }


  const firstName =
    document.getElementById(
      "first-name"
    )?.value.trim();


  const lastName =
    document.getElementById(
      "last-name"
    )?.value.trim();


  const phone =
    document.getElementById(
      "phone"
    )?.value.trim();


  const province =
    document.getElementById(
      "province"
    )?.value.trim();


  const city =
    document.getElementById(
      "city"
    )?.value.trim();


  const address =
    document.getElementById(
      "address"
    )?.value.trim();


  const postalCode =
    document.getElementById(
      "postal-code"
    )?.value.trim();


  const items =
    cart.map(
      item => ({

        id: item.id,

        name: item.Name,

        price: Number(item.Price) || 0,

        quantity:
          Number(item.quantity) || 0

      })
    );


  const total =
    items.reduce(
      (sum, item) =>
        sum +
        item.price *
        item.quantity,
      0
    );


  try {

    const {
      error
    } =
      await supabaseClient
        .from("orders")
        .insert([{

          first_name:
            firstName,

          last_name:
            lastName,

          phone:
            phone,

          province:
            province,

          city:
            city,

          address:
            address,

          postal_code:
            postalCode,

          items:
            items,

          total:
            total,

          status:
            "pending"

        }]);


    if (error) {

      console.error(
        "Order error:",
        error
      );

      showCheckoutMessage(
        "ثبت سفارش انجام نشد: " +
        error.message
      );

      return;
    }


    cart = [];

    saveCart();

    updateCartCount();


    const form =
      document.getElementById(
        "checkout-form"
      );

    if (form) {
      form.reset();
    }


    showCheckoutMessage(
      "سفارش شما با موفقیت ثبت شد ♡"
    );


    setTimeout(
      closeCheckout,
      1500
    );


  } catch (error) {

    console.error(
      error
    );

    showCheckoutMessage(
      "خطایی هنگام ثبت سفارش رخ داد."
    );
  }
}


function showCheckoutMessage(
  message
) {

  const element =
    document.getElementById(
      "checkout-message"
    );

  if (element) {
    element.textContent =
      message;
  }
}


/* =========================================================
   ADMIN LOGIN
========================================================= */

function openAdminLogin() {

  const panel =
    document.getElementById(
      "admin-panel-modal"
    );

  if (
    panel &&
    panel.style.display === "flex"
  ) {
    return;
  }


  const modal =
    document.getElementById(
      "admin-login-modal"
    );

  if (modal) {

    modal.style.display =
      "flex";

  }
}


function closeAdminLogin() {

  const modal =
    document.getElementById(
      "admin-login-modal"
    );

  if (modal) {
    modal.style.display =
      "none";
  }
}


async function adminLogin() {

  const email =
    document.getElementById(
      "admin-email"
    )?.value.trim();


  const password =
    document.getElementById(
      "admin-password"
    )?.value;


  const message =
    document.getElementById(
      "admin-login-message"
    );


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

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .signInWithPassword({

          email:
            email,

          password:
            password

        });


    if (error) {

      console.error(
        "Login error:",
        error
      );

      if (message) {
        message.textContent =
          "ایمیل یا رمز عبور اشتباه است.";
      }

      return;
    }


    if (!data.user) {

      await supabaseClient.auth.signOut();

      if (message) {
        message.textContent =
          "ورود انجام نشد.";
      }

      return;
    }


    const loggedInUserId =
      data.user.id;


    /*
      VERY IMPORTANT:
      Only the configured admin UUID
      can access the admin panel.
    */

    if (
      loggedInUserId !==
      ADMIN_ID
    ) {

      await supabaseClient.auth.signOut();

      if (message) {
        message.textContent =
          "این حساب اجازه ورود به پنل مدیریت را ندارد.";
      }

      return;
    }


    currentUser =
      data.user;


    if (message) {
      message.textContent =
        "";
    }


    closeAdminLogin();

    openAdminPanel();

    await loadOrders();

  } catch (error) {

    console.error(
      "Admin login exception:",
      error
    );

    if (message) {
      message.textContent =
        "خطایی هنگام ورود رخ داد.";
    }
  }
}


/* =========================================================
   CURRENT USER
========================================================= */

async function checkCurrentUser() {

  if (!supabaseClient) {
    return;
  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .getSession();


    if (error) {

      console.error(
        "Session error:",
        error
      );

      return;
    }


    const session =
      data?.session;


    if (
      session &&
      session.user
    ) {

      if (
        session.user.id ===
        ADMIN_ID
      ) {

        currentUser =
          session.user;

      } else {

        await supabaseClient.auth.signOut();

        currentUser =
          null;
      }

    }

  } catch (error) {

    console.error(
      "checkCurrentUser error:",
      error
    );
  }
}


/* =========================================================
   ADMIN PANEL
========================================================= */

function openAdminPanel() {

  const modal =
    document.getElementById(
      "admin-panel-modal"
    );

  if (!modal) {

    console.error(
      "admin-panel-modal not found."
    );

    return;
  }


  modal.style.display =
    "flex";
}


function closeAdminPanel() {

  const modal =
    document.getElementById(
      "admin-panel-modal"
    );

  if (modal) {
    modal.style.display =
      "none";
  }
}


/* =========================================================
   SAVE PRODUCT
========================================================= */

async function saveProduct() {

  const message =
    document.getElementById(
      "product-message"
    );


  const name =
    document.getElementById(
      "product-name"
    )?.value.trim();


  const price =
    Number(
      document.getElementById(
        "product-price"
      )?.value
    );


  const description =
    document.getElementById(
      "product-description"
    )?.value.trim();


  const stock =
    Number(
      document.getElementById(
        "product-stock"
      )?.value
    );


  const fileInput =
    document.getElementById(
      "product-image"
    );


  const file =
    fileInput?.files?.[0];


  if (!name) {

    setProductMessage(
      "نام محصول را وارد کن."
    );

    return;
  }


  if (
    !Number.isFinite(price) ||
    price < 0
  ) {

    setProductMessage(
      "قیمت محصول صحیح نیست."
    );

    return;
  }


  if (
    !Number.isInteger(stock) ||
    stock < 0
  ) {

    setProductMessage(
      "موجودی محصول صحیح نیست."
    );

    return;
  }


  if (!file) {

    setProductMessage(
      "عکس محصول را انتخاب کن."
    );

    return;
  }


  if (
    !currentUser ||
    currentUser.id !== ADMIN_ID
  ) {

    setProductMessage(
      "ابتدا با حساب مدیر وارد شو."
    );

    return;
  }


  setProductMessage(
    "در حال ذخیره محصول..."
  );


  try {

    /*
      Unique file name.
    */

    const safeName =
      file.name
        .replace(
          /[^a-zA-Z0-9._-]/g,
          "-"
        );


    const fileName =
      Date.now() +
      "-" +
      safeName;


    const filePath =
      "products/" +
      fileName;


    /*
      Upload image.
    */

    const {
      error:
        uploadError
    } =
      await supabaseClient.storage
        .from("products")
        .upload(
          filePath,
          file,
          {
            upsert: false,

            contentType:
              file.type || undefined
          }
        );


    if (uploadError) {

      console.error(
        "Storage upload error:",
        uploadError
      );

      setProductMessage(
        "آپلود عکس انجام نشد: " +
        uploadError.message
      );

      return;
    }


    /*
      Public URL.
    */

    const {
      data:
        publicData
    } =
      supabaseClient.storage
        .from("products")
        .getPublicUrl(
          filePath
        );


    const imageUrl =
      publicData?.publicUrl ||
      (
        SUPABASE_URL +
        "/storage/v1/object/public/products/" +
        filePath
      );


    console.log(
      "Image URL:",
      imageUrl
    );


    /*
      Insert product.
    */

    const {
      data:
        insertedProduct,
      error:
        insertError
    } =
      await supabaseClient
        .from("products")
        .insert([{

          Name:
            name,

          Price:
            price,

          Description:
            description,

          image_url:
            imageUrl,

          stock:
            stock

        }])
        .select()
        .single();


    if (insertError) {

      console.error(
        "Product insert error:",
        insertError
      );


      /*
        If database insert fails,
        try to remove uploaded image.
      */

      await supabaseClient.storage
        .from("products")
        .remove([
          filePath
        ]);


      setProductMessage(
        "ذخیره محصول انجام نشد: " +
        insertError.message
      );

      return;
    }


    console.log(
      "Product saved:",
      insertedProduct
    );


    setProductMessage(
      "محصول با موفقیت ذخیره شد ♡"
    );


    /*
      Clear fields.
    */

    const nameInput =
      document.getElementById(
        "product-name"
      );

    const priceInput =
      document.getElementById(
        "product-price"
      );

    const descriptionInput =
      document.getElementById(
        "product-description"
      );

    const stockInput =
      document.getElementById(
        "product-stock"
      );


    if (nameInput) {
      nameInput.value = "";
    }

    if (priceInput) {
      priceInput.value = "";
    }

    if (descriptionInput) {
      descriptionInput.value = "";
    }

    if (stockInput) {
      stockInput.value = "";
    }

    if (fileInput) {
      fileInput.value = "";
    }


    await loadProducts();

  } catch (error) {

    console.error(
      "saveProduct error:",
      error
    );

    setProductMessage(
      "خطایی هنگام ذخیره محصول رخ داد."
    );
  }
}


function setProductMessage(
  message
) {

  const element =
    document.getElementById(
      "product-message"
    );

  if (element) {
    element.textContent =
      message;
  }
}


/* =========================================================
   ORDERS
========================================================= */

async function loadOrders() {

  const container =
    document.getElementById(
      "orders-container"
    );


  if (!container) {
    return;
  }


  if (
    !currentUser ||
    currentUser.id !== ADMIN_ID
  ) {

    container.innerHTML = `
      <p>
        برای مشاهده سفارش‌ها وارد حساب مدیر شو.
      </p>
    `;

    return;
  }


  container.innerHTML = `
    <p>
      در حال دریافت سفارش‌ها...
    </p>
  `;


  try {

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

      container.innerHTML = `
        <p>
          دریافت سفارش‌ها انجام نشد.
          <br>
          <small>
            ${escapeHtml(error.message)}
          </small>
        </p>
      `;

      return;
    }


    if (
      !data ||
      data.length === 0
    ) {

      container.innerHTML = `
        <p>
          هنوز سفارشی ثبت نشده است.
        </p>
      `;

      return;
    }


    container.innerHTML = "";


    data.forEach(
      order => {

        const card =
          createOrderCard(order);

        container.appendChild(card);

      }
    );


  } catch (error) {

    console.error(
      "loadOrders error:",
      error
    );

    container.innerHTML = `
      <p>
        خطا در دریافت سفارش‌ها.
      </p>
    `;
  }
}


/* =========================================================
   ORDER CARD
========================================================= */

function createOrderCard(order) {

  const card =
    document.createElement("div");

  card.className =
    "order-card";


  const items =
    Array.isArray(order.items)
      ? order.items
      : [];


  const itemsText =
    items.map(
      item =>
        `${item.name || "محصول"} × ${item.quantity || 1}`
    )
    .join("، ");


  const status =
    order.status ||
    "pending";


  card.innerHTML = `

    <div>

      <strong>
        ${escapeHtml(
          (order.first_name || "") +
          " " +
          (order.last_name || "")
        )}
      </strong>

      <p>
        📞 ${escapeHtml(order.phone || "")}
      </p>

      <p>
        📍
        ${escapeHtml(order.province || "")}
        -
        ${escapeHtml(order.city || "")}
      </p>

      <p>
        ${escapeHtml(order.address || "")}
      </p>

      <p>
        📦
        ${escapeHtml(itemsText)}
      </p>

      <strong>
        ${formatPrice(order.total)}
      </strong>

    </div>


    <div style="
      margin-top:15px;
      display:flex;
      gap:8px;
      flex-wrap:wrap;
      align-items:center;
    ">

      <select
        class="order-status-select"
      >

        <option value="pending">
          در انتظار
        </option>

        <option value="processing">
          در حال آماده‌سازی
        </option>

        <option value="shipped">
          ارسال شده
        </option>

        <option value="completed">
          تکمیل شده
        </option>

        <option value="cancelled">
          لغو شده
        </option>

      </select>


      <button
        type="button"
        class="main-btn update-order-btn"
      >
        ذخیره وضعیت
      </button>

    </div>

  `;


  const select =
    card.querySelector(
      ".order-status-select"
    );


  const button =
    card.querySelector(
      ".update-order-btn"
    );


  if (select) {
    select.value =
      status;
  }


  if (button) {

    button.addEventListener(
      "click",
      function () {

        updateOrderStatus(
          order.id,
          select.value
        );

      }
    );

  }


  return card;
}


/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

async function updateOrderStatus(
  orderId,
  status
) {

  if (
    !currentUser ||
    currentUser.id !== ADMIN_ID
  ) {

    alert(
      "اجازه انجام این کار را نداری."
    );

    return;
  }


  try {

    const {
      error
    } =
      await supabaseClient
        .from("orders")
        .update({
          status:
            status
        })
        .eq(
          "id",
          orderId
        );


    if (error) {

      console.error(
        error
      );

      alert(
        "تغییر وضعیت انجام نشد."
      );

      return;
    }


    alert(
      "وضعیت سفارش تغییر کرد."
    );


    await loadOrders();


  } catch (error) {

    console.error(
      error
    );

    alert(
      "خطایی رخ داد."
    );
  }
}


/* =========================================================
   ADMIN LOGOUT
========================================================= */

async function adminLogout() {

  try {

    await supabaseClient.auth.signOut();

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

  }


  currentUser =
    null;


  closeAdminPanel();

  openAdminLogin();


  const message =
    document.getElementById(
      "admin-login-message"
    );

  if (message) {

    message.textContent =
      "از حساب مدیریت خارج شدی.";

  }
}


/* =========================================================
   MODAL CLICK OUTSIDE
========================================================= */

document.addEventListener(
  "click",
  function (event) {

    const modals =
      document.querySelectorAll(
        ".modal"
      );


    modals.forEach(
      modal => {

        if (
          event.target === modal
        ) {

          modal.style.display =
            "none";

        }

      }
    );

  }
);


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key !== "Escape"
    ) {
      return;
    }


    document
      .querySelectorAll(
        ".modal"
      )
      .forEach(
        modal => {

          modal.style.display =
            "none";

        }
      );

  }
);


/* =========================================================
   SUPABASE AUTH STATE
========================================================= */

function setupAuthListener() {

  if (!supabaseClient) {
    return;
  }


  supabaseClient.auth
    .onAuthStateChange(
      function (
        event,
        session
      ) {

        if (
          session &&
          session.user &&
          session.user.id === ADMIN_ID
        ) {

          currentUser =
            session.user;

        } else {

          currentUser =
            null;

        }

      }
    );
}


/*
  Run auth listener after initialization.
*/

setTimeout(
  setupAuthListener,
  0
);


/* =========================================================
   END
========================================================= */
