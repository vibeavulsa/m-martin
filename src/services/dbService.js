/**
 * dbService.js
 *
 * Thin client that talks to the Vercel Postgres API routes.
 * All writes are fire-and-forget safe: the caller receives the resolved
 * value (or throws on network / server error).
 */

const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function fetchProducts() {
  return request('/products');
}

export async function createProduct(product) {
  return request('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export async function updateProduct(product) {
  return request('/products', {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}

export async function deleteProduct(id) {
  return request(`/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// ─── Stock ───────────────────────────────────────────────────────────────────

export async function fetchStock() {
  return request('/stock');
}

export async function upsertStock(productId, quantity, minStock) {
  return request('/stock', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity, minStock }),
  });
}

export async function deleteStockEntry(productId) {
  return request(`/stock?id=${encodeURIComponent(productId)}`, { method: 'DELETE' });
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function fetchOrders() {
  return request('/orders');
}

export async function createOrder(order) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
}

export async function updateOrderStatus(id, status) {
  return request('/orders', {
    method: 'PUT',
    body: JSON.stringify({ id, status }),
  });
}

// ─── Cushion Kit ─────────────────────────────────────────────────────────────

export async function fetchCushionKit() {
  return request('/cushion-kit');
}

export async function saveCushionKit(config) {
  return request('/cushion-kit', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function fetchSetting(key) {
  return request(`/settings?key=${encodeURIComponent(key)}`);
}

export async function saveSetting(key, value) {
  return request('/settings', {
    method: 'POST',
    body: JSON.stringify({ key, value }),
  });
}
