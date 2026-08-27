// =============================================================
// HELPERS
// =============================================================
const formatPrice = (num) =>
  "RWF " + (num || 0).toLocaleString("en-RW");

// =============================================================
// LOGIN / SESSION STATE
// =============================================================
let loggedInUser = null;

async function checkCustomerSession() {
  const adminBtn = document.getElementById("admin-page-btn");

  try {
    const res = await fetch("/api/check-auth");
    const data = await res.json();

    // Admin: show Admin button, but not treated as store customer
    if (data.isAuthenticated && data.isAdmin) {
      if (adminBtn) {
        adminBtn.style.display = "inline-block";
        adminBtn.onclick = () => (location.href = "/admin.html");
      }
      loggedInUser = null;
    }
    // Customer
    else if (data.isAuthenticated && !data.isAdmin) {
      loggedInUser = data.user;
      if (adminBtn) adminBtn.style.display = "none";
    }
    // Guest
    else {
      loggedInUser = null;
      if (adminBtn) adminBtn.style.display = "none";
    }

    updateAccountUI();
  } catch (err) {
    loggedInUser = null;
    if (adminBtn) adminBtn.style.display = "none";
    updateAccountUI();
  }
}

function updateAccountUI() {
  const loginBtn = document.getElementById("login-btn");
  const accountBox = document.getElementById("account-box");
  const accountEmail = document.getElementById("account-email");
  const logoutBtn = document.getElementById("logout-btn");
  const accountPageBtn = document.getElementById("account-page-btn");

  if (!loginBtn || !accountBox) return;

  if (loggedInUser) {
    loginBtn.style.display = "none";
    accountBox.style.display = "flex";
    accountEmail.textContent = loggedInUser.email;

    if (accountPageBtn) {
      accountPageBtn.style.display = "inline-block";
      accountPageBtn.onclick = () => (location.href = "/account.html");
    }

    logoutBtn.onclick = async () => {
      await fetch("/api/logout", { method: "POST" });
      location.reload();
    };
  } else {
    loginBtn.style.display = "inline-block";
    accountBox.style.display = "none";
    if (accountPageBtn) accountPageBtn.style.display = "none";
  }
}

// =============================================================
// PRODUCTS STATE
// =============================================================
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const perPage = 12;

let cart = [];
let wishlist = new Set();
let modalProduct = null;

let deliveryOption = "pickup";
let deliveryFee = 0;

// header mode: "new" | "best" | "promo"
let headerMode = "new";

// =============================================================
// LOCAL STORAGE + WISHLIST
// =============================================================
function saveLocalState() {
  localStorage.setItem("kb_cart", JSON.stringify(cart));
  localStorage.setItem("kb_wishlist", JSON.stringify([...wishlist]));
}

function loadLocalState() {
  try {
    const c = JSON.parse(localStorage.getItem("kb_cart") || "[]");
    if (Array.isArray(c)) cart = c;
  } catch {}
  try {
    const w = JSON.parse(localStorage.getItem("kb_wishlist") || "[]");
    if (Array.isArray(w)) wishlist = new Set(w);
  } catch {}
}

async function loadWishlist() {
  if (loggedInUser) {
    try {
      const res = await fetch("/api/wishlist");
      const list = await res.json();
      wishlist = new Set(list);
    } catch {
      loadLocalState();
    }
  } else {
    loadLocalState();
  }
}

async function saveWishlistItem(productId) {
  if (loggedInUser) {
    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        action: wishlist.has(productId) ? "add" : "remove",
      }),
    });
  } else {
    saveLocalState();
  }
}

function updateWishlistUI() {
  const el = document.getElementById("wishlist-count");
  if (el) el.textContent = wishlist.size;
}

// =============================================================
// PRODUCTS
// =============================================================
async function fetchProducts() {
  const res = await fetch("/api/public-products");
  const data = await res.json();
  return data;
}

function buildCategories(products) {
  const pills = document.getElementById("category-pills");
  pills.innerHTML = "";
  const categories = new Set();

  products.forEach((p) => {
    if (p.category && p.category.trim()) categories.add(p.category.trim());
  });

  const all = document.createElement("button");
  all.className = "pill active";
  all.dataset.category = "";
  all.textContent = "All";
  pills.appendChild(all);

  Array.from(categories)
    .sort()
    .forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "pill";
      btn.dataset.category = cat;
      btn.textContent = cat;
      pills.appendChild(btn);
    });
}

function applyFilters() {
  const search = document
    .getElementById("search-input")
    .value.toLowerCase()
    .trim();
  const activePill = document.querySelector(".pill.active");
  const category = activePill ? activePill.dataset.category : "";
  let sort = document.getElementById("sort-select").value;

  // "Best sellers" ⇒ sort by highest price
  if (headerMode === "best") {
    sort = "price-high";
  }

  filteredProducts = allProducts.filter((p) => {
    if (category && p.category !== category) return false;

    // "Promo" tab ⇒ only promo products
    if (headerMode === "promo" && !p.is_promo) return false;

    if (search) {
      const combined =
        (p.name || "") +
        " " +
        (p.category || "") +
        " " +
        (p.description || "");
      if (!combined.toLowerCase().includes(search)) return false;
    }
    return true;
  });

  filteredProducts.sort((a, b) => {
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
    // default: newest (higher id)
    return b.id - a.id;
  });

  currentPage = 1;
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById("products-grid");
  const empty = document.getElementById("empty-state");
  const pageInfo = document.getElementById("page-info");

  if (!filteredProducts.length) {
    grid.innerHTML = "";
    empty.style.display = "block";
    pageInfo.textContent = "Page 0";
    return;
  }

  empty.style.display = "none";

  const totalPages = Math.ceil(filteredProducts.length / perPage);
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * perPage;
  const slice = filteredProducts.slice(start, start + perPage);

  grid.innerHTML = "";
  slice.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.id = p.id;

    const wished = wishlist.has(p.id);
    const promo = !!p.is_promo;
    const inStock = p.in_stock !== false;

    card.innerHTML = `
      <div class="card-image-wrapper">
        <button class="wish-btn ${wished ? "active" : ""}" data-id="${p.id}">
          <span>${wished ? "♥" : "♡"}</span>
        </button>
        <img src="${p.image || "/placeholder.png"}" alt="${p.name}" />
      </div>

      <div class="card-body">
        <div class="badge-row">
          ${
            inStock
              ? '<span class="badge badge-stock">In stock</span>'
              : '<span class="badge badge-out">Out of stock</span>'
          }
          ${promo ? '<span class="badge badge-promo">Promo</span>' : ""}
        </div>

        <h3>${p.name}</h3>
        <div class="category">${p.category || ""}</div>
        <div class="desc">${p.description || ""}</div>

        <div class="price-row">
          <span class="price">${formatPrice(p.price)}</span>
          ${
            p.original_price
              ? `<span class="price-original">${formatPrice(
                  p.original_price
                )}</span>`
              : ""
          }
          ${
            p.discount
              ? `<span class="price-discount">-${p.discount}%</span>`
              : ""
          }
        </div>

        <div class="card-actions">
          <button class="btn btn-primary add-to-cart" data-id="${p.id}">
            Add to cart
          </button>

          <button class="btn btn-outline quick-view" data-id="${p.id}">
            View
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  pageInfo.textContent = `Page ${currentPage}`;
}

// =============================================================
// CART
// =============================================================
function findProduct(id) {
  return allProducts.find((p) => p.id === id);
}

function addToCart(id) {
  const product = findProduct(id);
  if (!product) return;

  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.image,
    });
  }
  saveLocalState();
  updateCartUI();
  openCart();
}

function updateCartUI() {
  const itemsContainer = document.getElementById("cart-items");
  const cartCountEl = document.getElementById("cart-count");
  const subtotalEl = document.getElementById("cart-subtotal");
  const grandTotalEl = document.getElementById("cart-grandtotal");

  if (!cart.length) {
    itemsContainer.innerHTML =
      '<div class="cart-empty">Your cart is empty.</div>';
    cartCountEl.textContent = "0";
    subtotalEl.textContent = "RWF 0";
    grandTotalEl.textContent = "RWF 0";
    return;
  }

  let totalQty = 0;
  let subtotal = 0;

  itemsContainer.innerHTML = "";
  cart.forEach((item) => {
    totalQty += item.qty;
    subtotal += item.price * item.qty;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <img src="${item.image || "/placeholder.png"}" alt="${item.name}" />

      <div>
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-meta">${formatPrice(item.price)} each</div>

        <div class="cart-item-bottom">
          <div class="qty-controls">
            <button data-action="dec" data-id="${item.id}">-</button>
            <span>${item.qty}</span>
            <button data-action="inc" data-id="${item.id}">+</button>
          </div>

          <button class="cart-item-remove" data-action="remove" data-id="${item.id}">
            Remove
          </button>
        </div>
      </div>
    `;
    itemsContainer.appendChild(div);
  });

  cartCountEl.textContent = totalQty;
  subtotalEl.textContent = formatPrice(subtotal);

  const option = document.getElementById("delivery-option").value;
  deliveryOption = option;
  deliveryFee =
    option === "kigali" ? 2000 : option === "upcountry" ? 3500 : 0;

  const grand = subtotal + deliveryFee;
  grandTotalEl.textContent = formatPrice(grand);
}

function openCart() {
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("cart-backdrop").style.display = "block";
}

function closeCart() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("cart-backdrop").style.display = "none";
}

function clearCart() {
  cart = [];
  saveLocalState();
  updateCartUI();
}

// =============================================================
// CHECKOUT → WHATSAPP + SAVE ORDER
// =============================================================
async function checkout() {
  if (!cart.length) return;

  const name = document.getElementById("cart-name").value.trim();
  const phone = document.getElementById("cart-phone").value.trim();
  if (!phone) {
    showPopup("Please enter your WhatsApp number.");
    return;
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const grandTotal = subtotal + deliveryFee;

  // Save order into DB (backend)
  try {
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: name || null,
        customer_phone: phone,
        channel: "whatsapp",
        subtotal,
        deliveryOption,
        deliveryFee,
        items: cart.map((c) => ({
          product_id: c.id,
          quantity: c.qty,
          unit_price: c.price,
        })),
      }),
    });
  } catch {}

  // Save order history LOCALLY (for account page)
  try {
    const historyRaw = localStorage.getItem("kb_order_history") || "[]";
    const parsed = JSON.parse(historyRaw);
    const history = Array.isArray(parsed) ? parsed : [];
    const orderSummary = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      name: name || null,
      phone,
      deliveryOption,
      deliveryFee,
      subtotal,
      total: grandTotal,
      items: cart.map((c) => ({
        name: c.name,
        qty: c.qty,
        price: c.price,
      })),
    };
    history.unshift(orderSummary);
    localStorage.setItem("kb_order_history", JSON.stringify(history));
  } catch (e) {
    // ignore localStorage issues
  }

  // Build WhatsApp message
  let message = "New MarketMet order%0A%0A";
  if (name) message += `Name: ${encodeURIComponent(name)}%0A`;
  message += `Phone: ${encodeURIComponent(phone)}%0A%0AItems:%0A`;

  cart.forEach((item) => {
    message += `- ${encodeURIComponent(item.name)} x${item.qty} (${formatPrice(
      item.price
    )})%0A`;
  });

  message += `%0ASubtotal: ${encodeURIComponent(formatPrice(subtotal))}`;
  message += `%0ADelivery fee: ${encodeURIComponent(
    formatPrice(deliveryFee)
  )}`;
  message += `%0ATotal: ${encodeURIComponent(formatPrice(grandTotal))}`;

  const waPhone = "250780453704";
  window.open(`https://wa.me/${waPhone}?text=${message}`, "_blank");

  clearCart();
  closeCart();
}

// =============================================================
// MODAL
// =============================================================
function openModal(product) {
  modalProduct = product;

  document.getElementById("modal-title").textContent = product.name;
  document.getElementById("modal-image").src =
    product.image || "/placeholder.png";
  document.getElementById("modal-category").textContent = product.category;
  document.getElementById("modal-desc").textContent = product.description;

  const badges = document.getElementById("modal-badges");
  badges.innerHTML = "";
  const inStock = product.in_stock !== false;

  badges.innerHTML += `<span class="badge ${
    inStock ? "badge-stock" : "badge-out"
  }">${inStock ? "In stock" : "Out"}</span>`;

  if (product.is_promo)
    badges.innerHTML += `<span class="badge badge-promo">Promo</span>`;

  document.getElementById("modal-price").textContent =
    formatPrice(product.price);
  document.getElementById("modal-original").textContent =
    product.original_price ? formatPrice(product.original_price) : "";
  document.getElementById("modal-discount").textContent = product.discount
    ? `-${product.discount}%`
    : "";

  const wishBtn = document.getElementById("modal-wishlist");
  wishBtn.textContent = wishlist.has(product.id)
    ? "♥ In wishlist"
    : "♥ Wishlist";

  document.getElementById("detail-backdrop").style.display = "block";
  document.getElementById("product-modal").classList.add("open");
}

function closeModal() {
  document.getElementById("detail-backdrop").style.display = "none";
  document.getElementById("product-modal").classList.remove("open");
  modalProduct = null;
}

// =============================================================
// POPUP
// =============================================================
function showPopup(message, title = "Notice") {
  document.getElementById("kb-popup-title").textContent = title;
  document.getElementById("kb-popup-message").textContent = message;
  document.getElementById("kb-popup").classList.add("show");
}

document
  .getElementById("kb-popup-close")
  .addEventListener("click", () => {
    document.getElementById("kb-popup").classList.remove("show");
  });

// =============================================================
// INIT
// =============================================================
document.addEventListener("DOMContentLoaded", async () => {
  // Year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Session (customer + admin check)
  await checkCustomerSession();

  // Load wishlist
  await loadWishlist();
  updateWishlistUI();

  // Local cart
  loadLocalState();
  updateCartUI();

  // Theme
  const savedTheme = localStorage.getItem("kb_theme") || "light";
  applyTheme(savedTheme);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = document.body.classList.contains("dark-theme")
      ? "light"
      : "dark";
    applyTheme(newTheme);
    localStorage.setItem("kb_theme", newTheme);
  });

  // Products
  try {
    allProducts = await fetchProducts();
    buildCategories(allProducts);
    filteredProducts = [...allProducts];
    applyFilters();
  } catch (err) {
    const empty = document.getElementById("empty-state");
    empty.textContent = "Could not load products.";
    empty.style.display = "block";
  }

  // Filters
  document
    .getElementById("search-input")
    .addEventListener("input", applyFilters);
  document
    .getElementById("sort-select")
    .addEventListener("change", applyFilters);

  document
    .getElementById("category-pills")
    .addEventListener("click", (e) => {
      const pill = e.target.closest(".pill");
      if (!pill) return;
      document
        .querySelectorAll(".pill")
        .forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      applyFilters();
    });

  // Header links: New in / Best sellers / Promo
  const headerLinks = document.querySelectorAll(
    ".header-link:not(#wishlist-link)"
  );
  headerLinks.forEach((link) => {
    link.addEventListener("click", () => {
      headerLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      const label = link.textContent.trim().toLowerCase();
      if (label.startsWith("new")) headerMode = "new";
      else if (label.startsWith("best")) headerMode = "best";
      else if (label.startsWith("promo")) headerMode = "promo";
      else headerMode = "new";

      applyFilters();
    });
  });

  // Pagination
  document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderProducts();
    }
  });

  document.getElementById("next-page").addEventListener("click", () => {
    const totalPages = Math.ceil(filteredProducts.length / perPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderProducts();
    }
  });

  // Product grid clicks
  document
    .getElementById("products-grid")
    .addEventListener("click", async (e) => {
      const addBtn = e.target.closest(".add-to-cart");
      const quickBtn = e.target.closest(".quick-view");
      const wishBtn = e.target.closest(".wish-btn");

      if (addBtn) {
        const id = parseInt(addBtn.dataset.id, 10);
        addToCart(id);
        return;
      }

      if (quickBtn) {
        const id = parseInt(quickBtn.dataset.id, 10);
        const prod = findProduct(id);
        if (prod) openModal(prod);
        return;
      }

      if (wishBtn) {
        const id = parseInt(wishBtn.dataset.id, 10);

        if (wishlist.has(id)) wishlist.delete(id);
        else wishlist.add(id);

        await saveWishlistItem(id);
        updateWishlistUI();
        applyFilters();
      }
    });

  // Wishlist link → go to wishlist page
  document.getElementById("wishlist-link").addEventListener("click", () => {
    window.location.href = "/wishlist.html";
  });

  // Cart buttons
  document.getElementById("cart-toggle").addEventListener("click", openCart);
  document.getElementById("cart-close").addEventListener("click", closeCart);
  document
    .getElementById("cart-backdrop")
    .addEventListener("click", closeCart);
  document
    .getElementById("clear-cart-btn")
    .addEventListener("click", clearCart);
  document
    .getElementById("checkout-btn")
    .addEventListener("click", checkout);

  // Cart qty
  document.getElementById("cart-items").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = parseInt(btn.dataset.id, 10);
    const action = btn.dataset.action;
    const item = cart.find((c) => c.id === id);
    if (!item) return;

    if (action === "inc") item.qty += 1;
    if (action === "dec") item.qty = Math.max(1, item.qty - 1);
    if (action === "remove") cart = cart.filter((c) => c.id !== id);

    saveLocalState();
    updateCartUI();
  });

  // Delivery changes
  document
    .getElementById("delivery-option")
    .addEventListener("change", updateCartUI);

  // Modal
  document
    .getElementById("modal-close")
    .addEventListener("click", closeModal);
  document
    .getElementById("detail-backdrop")
    .addEventListener("click", closeModal);

  document
    .getElementById("modal-add-cart")
    .addEventListener("click", () => {
      if (modalProduct) addToCart(modalProduct.id);
    });

  document
    .getElementById("modal-wishlist")
    .addEventListener("click", async () => {
      if (!modalProduct) return;

      const id = modalProduct.id;

      if (wishlist.has(id)) wishlist.delete(id);
      else wishlist.add(id);

      await saveWishlistItem(id);
      updateWishlistUI();
      applyFilters();

      document.getElementById("modal-wishlist").textContent = wishlist.has(id)
        ? "♥ In wishlist"
        : "♥ Wishlist";
    });
});

// =============================================================
// THEME
// =============================================================
function applyTheme(theme) {
  if (theme === "dark") document.body.classList.add("dark-theme");
  else document.body.classList.remove("dark-theme");

  const icon = document.getElementById("theme-icon");
  if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";
}
