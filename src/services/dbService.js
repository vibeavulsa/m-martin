/**
 * dbService.js
 *
 * Thin client that talks to the Vercel Postgres API routes.
 * All writes include the Firebase Auth JWT token for admin verification.
 * All writes are fire-and-forget safe: the caller receives the resolved
 * value (or throws on network / server error).
 */

import { auth } from '../config/firebase';

const BASE = '/api';

/**
 * Get the current user's Firebase ID token, or null if not logged in.
 */
async function getAuthToken() {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
}

/**
 * Build headers for a request. Includes auth token for write operations.
 * @param {boolean} includeAuth - Whether to include the auth token
 */
async function buildHeaders(includeAuth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

/**
 * Make a request to an API route.
 * @param {string} path - API path (e.g. '/products')
 * @param {object} options - fetch options
 * @param {boolean} requiresAuth - Whether this request needs auth token
 */
async function request(path, options = {}, requiresAuth = false) {
  const headers = await buildHeaders(requiresAuth);
  const res = await fetch(`${BASE}${path}`, {
    headers,
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
  }, true); // requires admin auth
}

export async function updateProduct(product) {
  return request('/products', {
    method: 'PUT',
    body: JSON.stringify(product),
  }, true); // requires admin auth
}

export async function deleteProduct(id) {
  return request(`/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' }, true);
}

// ─── Stock ───────────────────────────────────────────────────────────────────

export async function fetchStock() {
  return request('/stock');
}

export async function upsertStock(productId, quantity, minStock) {
  return request('/stock', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity, minStock }),
  }, true); // requires admin auth
}

export async function deleteStockEntry(productId) {
  return request(`/stock?id=${encodeURIComponent(productId)}`, { method: 'DELETE' }, true);
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function fetchOrders() {
  return request('/orders', {}, true); // admin-only: list all orders
}

export async function createOrder(order) {
  // Order creation is public (customers creating orders)
  // but we include auth token optionally so the server can attach userId
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  }, true);
}

export async function updateOrderStatus(id, status) {
  return request('/orders', {
    method: 'PUT',
    body: JSON.stringify({ id, status }),
  }, true); // requires admin auth
}

export async function deleteOrder(id) {
  return request(`/orders?id=${encodeURIComponent(id)}`, { method: 'DELETE' }, true);
}

/**
 * 🆕 Fetch orders for a specific user (client-facing "Meus Pedidos")
 * @param {string} userId - Firebase UID
 */
export async function fetchMyOrders(userId) {
  return request(`/orders?userId=${encodeURIComponent(userId)}`, {}, true);
}

// ─── Cushion Kit ─────────────────────────────────────────────────────────────

export async function fetchCushionKit() {
  return request('/cushion-kit');
}

export async function saveCushionKit(config) {
  return request('/cushion-kit', {
    method: 'POST',
    body: JSON.stringify(config),
  }, true); // requires admin auth
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function fetchSetting(key) {
  return request(`/settings?key=${encodeURIComponent(key)}`);
}

export async function fetchAllSettings() {
  return request('/settings');
}

export async function saveSetting(key, value) {
  return request('/settings', {
    method: 'POST',
    body: JSON.stringify({ key, value }),
  }, true); // requires admin auth
}

// ─── Categories & Fabrics (stored in settings table) ─────────────────────────

export async function fetchCategories() {
  return request('/settings?key=categories');
}

export async function saveCategories(categories) {
  return request('/settings', {
    method: 'POST',
    body: JSON.stringify({ key: 'categories', value: categories }),
  }, true); // requires admin auth
}

export async function fetchSofaFabrics() {
  return request('/settings?key=sofaFabrics');
}

export async function saveSofaFabrics(fabrics) {
  return request('/settings', {
    method: 'POST',
    body: JSON.stringify({ key: 'sofaFabrics', value: fabrics }),
  }, true); // requires admin auth
}

// ─── Seed / Migration ────────────────────────────────────────────────────────

export async function seedData() {
  return request('/seed-data', { method: 'POST' });
}
