import { get, post, put, del, upload } from '../httpClient';

/**
 * PRODUCTS SERVICE
 * ─────────────────────────────────────────────
 * GET    /products               → { items, total, page, pages }
 * GET    /products/:id           → Product
 * POST   /products               → { id, status, message }  (multipart)
 * PUT    /products/:id           → Product
 * DELETE /products/:id           → null
 * POST   /products/:id/purchase  → { downloadUrl, receipt }
 */

// ── List ───────────────────────────────────────────────────
export async function getProducts({ category = 'all', search = '', page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (category !== 'all') params.set('category', category);
  if (search)             params.set('search', search);
  return get(`/products?${params}`);
}

// ── Single ─────────────────────────────────────────────────
export async function getProduct(id) {
  return get(`/products/${id}`);
}

// ── Create (with audio file) ───────────────────────────────
export async function createProduct({ audioFile, title, creator, price, category, tags }) {
  const fd = new FormData();
  if (audioFile) fd.append('audio', audioFile);
  fd.append('data', JSON.stringify({ title, creator, price, category, tags }));
  return upload('/products', fd);
}

// ── Update ─────────────────────────────────────────────────
export async function updateProduct(id, fields) {
  return put(`/products/${id}`, fields);
}

// ── Delete ─────────────────────────────────────────────────
export async function deleteProduct(id) {
  return del(`/products/${id}`);
}

// ── Purchase ───────────────────────────────────────────────
export async function purchaseProduct(id, { email, paymentMethodId }) {
  return post(`/products/${id}/purchase`, { email, paymentMethodId });
}
