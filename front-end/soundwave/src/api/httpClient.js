/**
 * ─────────────────────────────────────────────────────────────
 *  HTTP CLIENT  —  src/api/httpClient.js
 *
 *  Единый файл для всех HTTP-запросов.
 *  Используй так:
 *
 *    import { get, post, put, patch, del } from '../api/httpClient';
 *
 *    // GET
 *    const data = await get('/products?page=1');
 *
 *    // POST с телом
 *    const user = await post('/auth/login', { email, password });
 *
 *    // PUT / PATCH
 *    await put('/products/42', { title: 'New title' });
 *    await patch('/users/me', { avatar: url });
 *
 *    // DELETE
 *    await del('/products/42');
 *
 *    // С файлом (multipart)
 *    const fd = new FormData();
 *    fd.append('audio', file);
 *    await post('/products', fd);          // FormData детектится автоматически
 *
 *    // С кастомными заголовками
 *    await post('/admin/action', body, { headers: { 'X-Admin': '1' } });
 * ─────────────────────────────────────────────────────────────
 */

const BASE_URL = process.env.REACT_APP_API_URL || '';
const TIMEOUT  = 15_000; // 15 секунд

// ── Token helpers ──────────────────────────────────────────
export const getToken  = ()       => localStorage.getItem('sw_token');
export const setToken  = (token)  => localStorage.setItem('sw_token', token);
export const clearToken = ()      => { localStorage.removeItem('sw_token'); localStorage.removeItem('sw_user'); };

// ── Core executor ──────────────────────────────────────────
async function execute(method, path, body = null, options = {}) {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), TIMEOUT);

  const isFormData = body instanceof FormData;

  const headers = {
    // Если FormData — Content-Type ставит браузер сам (с boundary)
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    // Auth токен — подставляем автоматически если есть
    ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
    // Кастомные заголовки поверх
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      signal: controller.signal,
      // body только для методов с телом
      ...(body !== null && {
        body: isFormData ? body : JSON.stringify(body),
      }),
    });

    clearTimeout(timer);

    // Пустой ответ (204 No Content)
    if (res.status === 204) return null;

    const text = await res.text().catch(() => '');
    let data = {};
    try { data = JSON.parse(text); } catch { /* plain text response */ }

    if (!res.ok) {
      const err = new Error(data.message || text || `HTTP ${res.status}`);
      err.status = res.status;
      err.code   = data.code   || null;
      err.fields = data.fields || null;
      throw err;
    }

    return data;

  } catch (err) {
    clearTimeout(timer);

    // AbortController timeout
    if (err.name === 'AbortError') {
      const timeout = new Error('Request timed out. Check your connection.');
      timeout.code  = 'TIMEOUT';
      throw timeout;
    }

    // Нет сети
    if (!navigator.onLine) {
      const offline = new Error('No internet connection.');
      offline.code  = 'OFFLINE';
      throw offline;
    }

    throw err;
  }
}

// ── Public methods ─────────────────────────────────────────

/** GET /path */
export const get   = (path, options)       => execute('GET',    path, null, options);

/** POST /path  { body } */
export const post  = (path, body, options) => execute('POST',   path, body, options);

/** PUT /path  { body } */
export const put   = (path, body, options) => execute('PUT',    path, body, options);

/** PATCH /path  { body } */
export const patch = (path, body, options) => execute('PATCH',  path, body, options);

/** DELETE /path */
export const del   = (path, options)       => execute('DELETE', path, null, options);

/** POST multipart/form-data (для файлов) */
export const upload = (path, formData, options) => execute('POST', path, formData, options);
