// MarketMet - Wishlist page

const formatPrice = (num) =>
  "RWF " + (num || 0).toLocaleString("en-RW");

let loggedInUser = null;
let wishlist = new Set();
let allProducts = [];

// ---------- SESSION ----------
async function checkSessionForWishlist() {
  const adminBtn = document.getElementById("admin-page-btn");

  try {
    const res = await fetch("/api/check-auth");
    const data = await res.json();

    if (data.isAuthenticated && data.isAdmin) {
      // Admin logged in → show Admin button, keep wishlist as guest
      if (adminBtn) {
        adminBtn.style.display = "inline-block";
        adminBtn.onclick = () => (location.href = "/admin.html");
      }
      loggedInUser = null;
    } else if (data.isAuthenticated && !data.isAdmin) {
      loggedInUser = data.user;
      if (adminBtn) adminBtn.style.display = "none";
    } else {
      loggedInUser = null;
      if (adminBtn) adminBtn.style.display = "none";
    }

    updateAccountUIWishlist();
  } catch (err) {
    loggedInUser = null;
    if (adminBtn) adminBtn.style.display = "none";
    updateAccountUIWishlist();
  }
}

function updateAccountUIWishlist() {
  const loginBtn = document.getElementById("login-btn");
  const accountBox = document.getElementById("account-box");
  const accountEmail = document.getElementById("account-email");
  const logoutBtn = document.getElementById("logout-btn");

  if (!loginBtn || !accountBox) return;

  if (loggedInUser) {
    loginBtn.style.display = "none";
    accountBox.style.display = "flex";
    accountEmail.textContent = loggedInUser.email;

    logoutBtn.onclick = async () => {
      await fetch("/api/logout", { method: "POST" });
      location.href = "/login.html";
    };
  } else {
    loginBtn.style.display = "inline-block";
    accountBox.style.display = "none";
  }
}

// ---------- WISHLIST STORAGE ----------
function loadLocalWishlist() {
  try {
    const raw = localStorage.getItem("kb_wishlist") || "[]";
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr);
  } catch {}
  return new Set();
}

function saveLocalWishlist() {
  localStorage.setItem("kb_wishlist", JSON.stringify([...wishlist]));
}

async function loadWishlistSet() {
  if (loggedInUser) {
    try {
      const res = await fetch("/api/wishlist");
      if (!res.ok) throw new Error("wishlist error");
      const ids = await res.json();
      wishlist = new Set(ids);
      return;
    } catch (err) {
      // fall back to local
      wishlist = loadLocalWishlist();
      return;
    }
  } else {
    wishlist = loadLocalWishlist();
  }
}

async function saveWishlistChange(productId, presentNow) {
  if (loggedInUser) {
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          action: presentNow ? "add" : "remove",
        }),
      });
    } catch (err) {
      // ignore; local storage is still updated below
    }
  }
  saveLocalWishlist();
}

// ---------- CART (shared via localStorage with store page) ----------
function loadLocalCart() {
  try {
    const raw = localStorage.getItem("kb_cart") || "[]";
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
  } catch {}
  return [];
}

function saveLocalCart(cart) {
  localStorage.setItem("kb_cart", JSON.stringify(cart));
}

function addToCartFromWishlist(product) {
  let cart = loadLocalCart();
  const existing = cart.find((c) => c.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.image,
    });
  }
  saveLocalCart(cart);
  alert("Added to cart. You can finish checkout from the store page.");
}

// ---------- RENDER ----------
function renderWishlist() {
  const grid = document.getElementById("wishlist-grid");
  const empty = document.getElementById("wishlist-empty");

  const ids = [...wishlist];
  const products = allProducts.filter((p) => ids.includes(p.id));

  if (!products.length) {
    empty.style.display = "block";
    grid.innerHTML = "";
    return;
  }

  empty.style.display = "none";
  grid.innerHTML = "";

  products.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card";

    const promo = !!p.is_promo;
    const inStock = p.in_stock !== false;

    card.innerHTML = `
      <div class="card-image-wrapper">
        <button class="wish-btn active" data-id="${p.id}">
          <span>♥</span>
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
          <button class="btn btn-primary wish-add-cart" data-id="${p.id}">
            Add to cart
          </button>
          <button class="btn btn-outline wish-remove" data-id="${p.id}">
            Remove
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

// ---------- THEME ----------
function applyTheme(theme) {
  if (theme === "dark") document.body.classList.add("dark-theme");
  else document.body.classList.remove("dark-theme");

  const icon = document.getElementById("theme-icon");
  if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";
}

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
  // footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // theme
  const savedTheme = localStorage.getItem("kb_theme") || "light";
  applyTheme(savedTheme);
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = document.body.classList.contains("dark-theme")
      ? "light"
      : "dark";
    applyTheme(newTheme);
    localStorage.setItem("kb_theme", newTheme);
  });

  // session
  await checkSessionForWishlist();

  // products + wishlist
  try {
    const res = await fetch("/api/public-products");
    allProducts = await res.json();
  } catch (err) {
    console.error("Failed to load products for wishlist", err);
    allProducts = [];
  }

  await loadWishlistSet();
  renderWishlist();

  // Click handlers
  document
    .getElementById("wishlist-grid")
    .addEventListener("click", async (e) => {
      const removeBtn = e.target.closest(".wish-remove");
      const addCartBtn = e.target.closest(".wish-add-cart");
      const heartBtn = e.target.closest(".wish-btn");

      if (removeBtn || heartBtn) {
        const id = parseInt(
          (removeBtn || heartBtn).dataset.id || "0",
          10
        );
        if (!id) return;

        wishlist.delete(id);
        await saveWishlistChange(id, false);
        renderWishlist();
      }

      if (addCartBtn) {
        const id = parseInt(addCartBtn.dataset.id || "0", 10);
        const product = allProducts.find((p) => p.id === id);
        if (product) addToCartFromWishlist(product);
      }
    });
});
