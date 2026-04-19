// Esoko - My account page

const formatPrice = (num) =>
  "RWF " + (num || 0).toLocaleString("en-RW");

let loggedInUser = null;

// ---------- SESSION ----------
async function checkSessionForAccount() {
  const adminBtn = document.getElementById("admin-page-btn");

  try {
    const res = await fetch("/api/check-auth");
    const data = await res.json();

    if (data.isAuthenticated && data.isAdmin) {
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

    updateAccountUIAccountPage();
  } catch (err) {
    loggedInUser = null;
    if (adminBtn) adminBtn.style.display = "none";
    updateAccountUIAccountPage();
  }
}

function updateAccountUIAccountPage() {
  const loginBtn = document.getElementById("login-btn");
  const accountBox = document.getElementById("account-box");
  const accountEmail = document.getElementById("account-email");
  const logoutBtn = document.getElementById("logout-btn");
  const subtitle = document.getElementById("account-subtitle");

  if (!loginBtn || !accountBox) return;

  if (loggedInUser) {
    loginBtn.style.display = "none";
    accountBox.style.display = "flex";
    accountEmail.textContent = loggedInUser.email;
    if (subtitle) {
      subtitle.textContent = `Signed in as ${loggedInUser.email}`;
    }

    logoutBtn.onclick = async () => {
      await fetch("/api/logout", { method: "POST" });
      location.href = "/login.html";
    };
  } else {
    loginBtn.style.display = "inline-block";
    accountBox.style.display = "none";
    if (subtitle) {
      subtitle.textContent = "Please log in to view your account.";
    }
  }
}

// ---------- ORDER HISTORY (LOCAL) ----------
function loadOrderHistory() {
  let history = [];
  try {
    const raw = localStorage.getItem("kb_order_history") || "[]";
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) history = parsed;
  } catch {
    history = [];
  }
  return history;
}

function renderOrderHistory() {
  const listEl = document.getElementById("orders-list");
  const emptyEl = document.getElementById("orders-empty");
  const history = loadOrderHistory();

  if (!listEl || !emptyEl) return;

  if (!history.length) {
    emptyEl.style.display = "block";
    listEl.innerHTML = "";
    return;
  }

  emptyEl.style.display = "none";
  listEl.innerHTML = "";

  history.forEach((order) => {
    const wrapper = document.createElement("article");
    wrapper.className = "order-card";

    const date = order.createdAt
      ? new Date(order.createdAt)
      : new Date();
    const dateStr = date.toLocaleString();

    const header = document.createElement("div");
    header.className = "order-card-header";

    const left = document.createElement("div");
    left.className = "order-total";
    left.textContent = `Total: ${formatPrice(order.total || 0)}`;

    const right = document.createElement("div");
    right.className = "order-date";
    right.textContent = dateStr;

    header.appendChild(left);
    header.appendChild(right);

    const meta = document.createElement("div");
    meta.className = "order-meta";
    meta.textContent = `Delivery: ${order.deliveryOption || "pickup"} · Phone: ${
      order.phone || "N/A"
    }`;

    const itemsList = document.createElement("div");
    itemsList.className = "order-items";

    if (Array.isArray(order.items) && order.items.length) {
      order.items.forEach((item) => {
        const line = document.createElement("div");
        line.textContent = `- ${item.name} x${item.qty} (${formatPrice(
          item.price
        )})`;
        itemsList.appendChild(line);
      });
    }

    wrapper.appendChild(header);
    wrapper.appendChild(meta);
    wrapper.appendChild(itemsList);

    listEl.appendChild(wrapper);
  });
}

// ---------- WISHLIST PREVIEW ----------
function loadLocalWishlist() {
  try {
    const raw = localStorage.getItem("kb_wishlist") || "[]";
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr);
  } catch {}
  return new Set();
}

async function loadWishlistIds() {
  if (loggedInUser) {
    try {
      const res = await fetch("/api/wishlist");
      if (!res.ok) throw new Error("wishlist 401");
      const ids = await res.json();
      return new Set(ids);
    } catch {
      return loadLocalWishlist();
    }
  }
  return loadLocalWishlist();
}

async function renderWishlistPreview() {
  const container = document.getElementById("account-wishlist-list");
  const empty = document.getElementById("account-wishlist-empty");
  if (!container || !empty) return;

  const idsSet = await loadWishlistIds();
  const ids = [...idsSet];

  if (!ids.length) {
    empty.style.display = "block";
    container.innerHTML = "";
    return;
  }

  empty.style.display = "none";

  let products = [];
  try {
    const res = await fetch("/api/public-products");
    products = await res.json();
  } catch {
    products = [];
  }

  const wishProducts = products.filter((p) => ids.includes(p.id)).slice(0, 4);

  if (!wishProducts.length) {
    empty.style.display = "block";
    container.innerHTML = "";
    return;
  }

  container.innerHTML = "";
  wishProducts.forEach((p) => {
    const row = document.createElement("div");
    row.className = "account-wishlist-item";

    row.innerHTML = `
      <div class="account-wish-main">
        <div class="account-wish-name">${p.name}</div>
        <div class="account-wish-meta">${p.category || ""}</div>
      </div>
      <div class="account-wish-price">${formatPrice(p.price)}</div>
    `;

    container.appendChild(row);
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
  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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

  // Session
  await checkSessionForAccount();

  // If not logged in as customer, redirect to login
  if (!loggedInUser) {
    setTimeout(() => {
      window.location.href = "/login.html";
    }, 800);
    return;
  }

  // Orders + wishlist
  renderOrderHistory();
  await renderWishlistPreview();
});
