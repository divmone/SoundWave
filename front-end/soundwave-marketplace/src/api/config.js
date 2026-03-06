// ─────────────────────────────────────────────────────────
//  API CONFIG
//  Замени BASE_URL на адрес своего сервера перед деплоем
// ─────────────────────────────────────────────────────────

export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const API_TIMEOUT = 10_000; // ms

export async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function requestFormData(path, formData, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: formData,
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}
