import { get, del, upload } from '../httpClient';

const BASE = '/api/v1.0/sounds';

// ── List (страница звуков) ──────────────────────────────────
export async function getProducts({ page = 1 } = {}) {
  const [items, amountRes] = await Promise.all([
    get(`${BASE}/pages/${page}`),
    get(`${BASE}/amount`),
  ]);
  return {
    items: items ?? [],
    total: amountRes?.amount ?? 0,
    page,
  };
}

// ── Single ─────────────────────────────────────────────────
export async function getProduct(id) {
  return get(`${BASE}/${id}`);
}

// ── Звуки конкретного пользователя ─────────────────────────
export async function getUserProducts(userId) {
  return get(`${BASE}/user/${userId}`);
}

// ── Загрузить звук ─────────────────────────────────────────
// audioFile   — File object
// metadata    — { title, price, description?, originalName?, mimeType?, durationSeconds?, tags? }
export async function createProduct(userId, audioFile, metadata) {
  const fd = new FormData();
  fd.append('audio', audioFile);
  fd.append('metadata', JSON.stringify({
    title:           metadata.title,
    price:           String(metadata.price),
    description:     metadata.description     ?? '',
    originalName:    metadata.originalName    ?? audioFile.name,
    mimeType:        metadata.mimeType        ?? audioFile.type,
    durationSeconds: metadata.durationSeconds ?? 0,
    tags:            metadata.tags            ?? [],
  }));
  return upload(`${BASE}/user/${userId}/upload`, fd);
}

// ── Удалить ────────────────────────────────────────────────
export async function deleteProduct(id) {
  return del(`${BASE}/${id}`);
}

// ── Покупка (не реализована на бэкенде) ────────────────────
export async function purchaseProduct(_id, _params) {
  throw new Error('Purchase is not implemented yet');
}

// ── Получить аудиофайл (binary) ────────────────────────────
export function getProductAudioUrl(id) {
  return `${BASE}/${id}/data`;
}
