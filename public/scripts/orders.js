// ===========================================================
//  ORDERS SYSTEM — CLEAN, MODERN, ADMIN-PROTECTED VERSION
// ===========================================================

let currentOrderId = null;
let ordersCache = [];

// -----------------------------------------------------------
// Admin-only auth check
// -----------------------------------------------------------
async function checkAdminAccess() {
  try {
    const res = await fetch("/api/check-auth");
    const data = await res.json();

    if (!data.isAuthenticated) {
      return (window.location.href = "/login.html");
    }

    if (data.user.email !== "jojogroceries@gmail.com" && data.user.role !== "ADMIN") {
      await fetch("/api/logout", { method: "POST" });
      return (window.location.href = "/login.html");
    }
  } catch (err) {
    return (window.location.href = "/login.html");
  }
}

// -----------------------------------------------------------
// Alerts
// -----------------------------------------------------------
function showOrdersAlert(message, type = "error") {
  const el = document.getElementById("orders-alert");

  if (!el) return;

  if (!message) {
    el.innerHTML = "";
    return;
  }

  el.innerHTML = `
    <div class="alert ${type === "error" ? "alert-error" : "alert-success"}">
      ${message}
    </div>
  `;
}

// -----------------------------------------------------------
// Metrics
// -----------------------------------------------------------
function updateOrderMetrics(orders) {
  const totalEl = document.getElementById("metric-orders-total");
  const todayEl = document.getElementById("metric-orders-today");
  const revenueEl = document.getElementById("metric-orders-revenue");
  const avgEl = document.getElementById("metric-orders-avg");

  const totalOrders = orders.length;

  let totalRevenue = 0;
  let todayCount = 0;

  const todayStr = new Date().toDateString();

  orders.forEach((o) => {
    const subtotal = o.subtotal || 0;
    const deliveryFee = o.delivery_fee || 0;
    totalRevenue += subtotal + deliveryFee;

    if (o.created_at) {
      const d = new Date(o.created_at);
      if (d.toDateString() === todayStr) {
        todayCount += 1;
      }
    }
  });

  if (totalEl) totalEl.textContent = totalOrders;
  if (todayEl) todayEl.textContent = todayCount;

  if (revenueEl) {
    revenueEl.textContent = totalRevenue.toLocaleString("en-RW") + " RWF";
  }

  if (avgEl) {
    const avg = totalOrders ? totalRevenue / totalOrders : 0;
    avgEl.textContent = avg.toFixed(0).toLocaleString("en-RW") + " RWF";
  }
}

// -----------------------------------------------------------
// Load orders
// -----------------------------------------------------------
async function loadOrders() {
  try {
    const res = await fetch("/api/orders");

    if (res.status === 403) {
      return (window.location.href = "/login.html");
    }

    const orders = await res.json();
    if (!Array.isArray(orders)) throw new Error("Invalid response");

    ordersCache = orders;
    filterAndRenderOrders();
    updateOrderMetrics(ordersCache);

  } catch (err) {
    showOrdersAlert("Failed to load orders");
  }
}

// -----------------------------------------------------------
// Filter + search
// -----------------------------------------------------------
function filterAndRenderOrders() {
  const search = document.getElementById("orders-search").value.toLowerCase().trim();
  const channel = document.getElementById("orders-channel").value;

  let list = ordersCache.slice();

  if (search) {
    list = list.filter((o) => {
      const combined =
        (String(o.id) || "") +
        " " +
        (o.customer_name || "") +
        " " +
        (o.customer_phone || "") +
        " " +
        (o.channel || "");

      return combined.toLowerCase().includes(search);
    });
  }

  if (channel !== "all") {
    list = list.filter((o) => (o.channel || "store") === channel);
  }

  renderOrders(list);
}

// -----------------------------------------------------------
// Render table
// -----------------------------------------------------------
function renderOrders(orders) {
  const tbody = document.getElementById("orders-body");
  tbody.innerHTML = "";

  orders.forEach((o) => {
    const subtotal = o.subtotal || 0;
    const deliveryFee = o.delivery_fee || 0;
    const total = subtotal + deliveryFee;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${o.id}</td>
      <td>${o.customer_name || "Unknown"}</td>
      <td>${o.customer_phone || "-"}</td>
      <td>${o.channel || "store"}</td>
      <td>${subtotal.toLocaleString()} RWF</td>
      <td>${o.delivery_option || "N/A"} – ${deliveryFee.toLocaleString()} RWF</td>
      <td>${total.toLocaleString()} RWF</td>
      <td>${o.created_at ? new Date(o.created_at).toLocaleString() : "-"}</td>
      <td>
        <button class="btn-outline btn-small" onclick="openOrder(${o.id})">View</button>
        <button class="btn-danger btn-small" onclick="deleteOrder(${o.id})">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// -----------------------------------------------------------
// View Order Details
// -----------------------------------------------------------
async function openOrder(id) {
  try {
    const res = await fetch(`/api/orders/${id}`);

    if (res.status === 403) return (window.location.href = "/login.html");

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");

    fillOrderModal(data.order, data.items);

  } catch (err) {
    showOrdersAlert(err.message);
  }
}

function fillOrderModal(order, items) {
  currentOrderId = order.id;

  const subtotal = order.subtotal || 0;
  const deliveryFee = order.delivery_fee || 0;
  const total = subtotal + deliveryFee;

  document.getElementById("order-modal-title").textContent =
    `Order #${order.id}`;

  document.getElementById("order-meta").innerHTML = `
    <div><strong>ID</strong><span>${order.id}</span></div>
    <div><strong>Customer</strong><span>${order.customer_name || "Unknown"}</span></div>
    <div><strong>Phone</strong><span>${order.customer_phone || "-"}</span></div>
    <div><strong>Channel</strong><span>${order.channel}</span></div>
    <div><strong>Delivery</strong><span>${order.delivery_option}</span></div>
    <div><strong>Delivery Fee</strong><span>${deliveryFee.toLocaleString()} RWF</span></div>
    <div><strong>Subtotal</strong><span>${subtotal.toLocaleString()} RWF</span></div>
    <div><strong>Total</strong><span>${total.toLocaleString()} RWF</span></div>
    <div><strong>Created</strong><span>${
      order.created_at ? new Date(order.created_at).toLocaleString() : "-"
    }</span></div>
  `;

  const body = document.querySelector("#order-items-table tbody");
  body.innerHTML = "";

  items.forEach((it) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${it.product_name || `#${it.product_id}`}</td>
      <td>${it.quantity}</td>
      <td>${it.unit_price.toLocaleString()} RWF</td>
      <td>${(it.unit_price * it.quantity).toLocaleString()} RWF</td>
    `;
    body.appendChild(tr);
  });

  document.getElementById("order-backdrop").style.display = "block";
  document.getElementById("order-modal").classList.add("open");
}

// -----------------------------------------------------------
// Close Modal
// -----------------------------------------------------------
function closeOrderModal() {
  document.getElementById("order-backdrop").style.display = "none";
  document.getElementById("order-modal").classList.remove("open");
  currentOrderId = null;
}

// -----------------------------------------------------------
// Delete Order
// -----------------------------------------------------------
async function deleteOrder(id) {
  if (!confirm(`Delete order #${id}?`)) return;

  try {
    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });

    if (res.status === 403)
      return (window.location.href = "/login.html");

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    closeOrderModal();
    showOrdersAlert(`Order #${id} deleted.`, "success");
    loadOrders();

  } catch (err) {
    showOrdersAlert(err.message);
  }
}

// -----------------------------------------------------------
// INIT
// -----------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  // 🔥 Enforce admin access
  await checkAdminAccess();

  // Enable notifications integration
  window.kbOnNewOrders = () => loadOrders();

  loadOrders();

  // Modal controls
  document.getElementById("order-close").onclick = closeOrderModal;
  document.getElementById("order-backdrop").onclick = closeOrderModal;

  // Delete button inside modal
  document.getElementById("order-delete").onclick = () => {
    if (currentOrderId) deleteOrder(currentOrderId);
  };

  // Search & Filter
  document.getElementById("orders-search").addEventListener("input", filterAndRenderOrders);
  document.getElementById("orders-channel").addEventListener("change", filterAndRenderOrders);
});
