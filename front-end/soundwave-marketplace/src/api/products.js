/**
 * PRODUCTS API — заглушки + документация для бэкенда
 *
 * ═══════════════════════════════════════════════════════
 *  БЭКЕНД ДОЛЖЕН ВЕРНУТЬ:
 *
 *  GET /api/products?category=&search=&page=&limit=
 *  → {
 *      items: Product[],
 *      total: number,
 *      page: number,
 *      pages: number
 *    }
 *
 *  Product {
 *    id: string | number
 *    title: string
 *    creator: string        // "@handle"
 *    creatorAvatar?: string // URL
 *    price: number          // USD
 *    category: "alerts" | "transitions" | "jingles" | "ui" | "stingers"
 *    tags: string[]
 *    duration: number       // seconds
 *    previewUrl: string     // CDN URL для preview аудио
 *    downloadCount: number
 *    rating: number         // 0-5
 *    isFeatured?: boolean
 *    bars: number[]         // массив 15 чисел 20-100 (высоты waveform баров)
 *    createdAt: string      // ISO date
 *  }
 *
 *  GET /api/products/:id
 *  → Product (одна карточка)
 *
 *  POST /api/products  (multipart/form-data)
 *  body: { audio: File, data: JSON string }
 *  data {
 *    title, creator, price, category, tags: string[]
 *  }
 *  → { id, status: "pending" | "approved", message }
 *
 *  POST /api/products/:id/purchase
 *  body: { email, paymentMethodId } (Stripe)
 *  → { downloadUrl, receipt }
 *
 *  DELETE /api/products/:id  (auth required)
 *  → { success: true }
 * ═══════════════════════════════════════════════════════
 */

import { request, requestFormData } from './config';
import { MOCK_PRODUCTS } from './mock';

const USE_MOCK = process.env.REACT_APP_USE_MOCK !== 'false';

// ── GET /api/products ──────────────────────────────────
export async function getProducts({ category = 'all', search = '', page = 1, limit = 20 } = {}) {
  if (USE_MOCK) {
    // Имитируем задержку сервера
    await delay(420);
    let items = [...MOCK_PRODUCTS];
    if (category !== 'all') items = items.filter(p => p.category === category);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.creator.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return { items, total: items.length, page: 1, pages: 1 };
  }
  return request(`/products?category=${category}&search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`);
}

// ── GET /api/products/:id ──────────────────────────────
export async function getProduct(id) {
  if (USE_MOCK) {
    await delay(200);
    return MOCK_PRODUCTS.find(p => p.id === id) || null;
  }
  return request(`/products/${id}`);
}

// ── POST /api/products ─────────────────────────────────
export async function createProduct({ audioFile, title, creator, price, category, tags }) {
  if (USE_MOCK) {
    await delay(1200);
    console.log('[MOCK] createProduct →', { title, creator, price, category, tags, audioFile });
    return { id: Date.now(), status: 'pending', message: 'Track queued for review' };
  }
  const fd = new FormData();
  fd.append('audio', audioFile);
  fd.append('data', JSON.stringify({ title, creator, price, category, tags }));
  return requestFormData('/products', fd);
}

// ── POST /api/products/:id/purchase ───────────────────
export async function purchaseProduct(id, { email, paymentMethodId }) {
  if (USE_MOCK) {
    await delay(800);
    console.log('[MOCK] purchaseProduct →', { id, email, paymentMethodId });
    return { downloadUrl: '#mock-download-url', receipt: `RCP-${Date.now()}` };
  }
  return request(`/products/${id}/purchase`, {
    method: 'POST',
    body: JSON.stringify({ email, paymentMethodId }),
  });
}

// ── DELETE /api/products/:id ───────────────────────────
export async function deleteProduct(id) {
  if (USE_MOCK) {
    await delay(300);
    return { success: true };
  }
  return request(`/products/${id}`, { method: 'DELETE' });
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
