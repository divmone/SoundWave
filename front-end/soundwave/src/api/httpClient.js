/**
 * ─────────────────────────────────────────────────────────────
 *  HTTP CLIENT  —  src/api/httpClient.js
 *
 *  Поддержка двух сервисов:
 *    - AUTH: сервис авторизации (порт 8080)
 *    - STORAGE: сервис хранения звуков (порт 8082)
 *  
 *  Используй так:
 *
 *    import { auth, storage } from '../api/httpClient';
 *
 *    // GET с авторизационного сервиса
 *    const user = await auth.get('/auth/me');
 *
 *    // POST с сервиса хранения
 *    const sounds = await storage.get('/api/v1.0/sounds/amount');
 *    
 *    // Или через прокси (если используется setupProxy.js)
 *    import { get, post } from '../api/httpClient';
 *    const data = await get('/api/v1.0/sounds/amount');
 * ─────────────────────────────────────────────────────────────
 */

const TIMEOUT = 15_000; // 15 секунд

// Конфигурация сервисов
const SERVICES = {
  AUTH: {
    name: 'auth',
    baseURL: process.env.REACT_APP_AUTH_URL || '',
    defaultPath: '/auth',
  },
  STORAGE: {
    name: 'storage',
    baseURL: process.env.REACT_APP_STORAGE_URL || '',
    defaultPath: '',
  },
  PAYMENT: {
    name: 'payment',
    baseURL: process.env.REACT_APP_PAYMENT_URL || '',
    defaultPath: '',
  },
  CRYPTO_PAYMENT: {
    name: 'crypto_payment',
    baseURL: process.env.REACT_APP_CRYPTO_PAYMENT_URL || '',
    defaultPath: '',
  },
};

// ── Token helpers ──────────────────────────────────────────
export const getToken = () => localStorage.getItem('sw_token');
export const setToken = (token) => localStorage.setItem('sw_token', token);
export const clearToken = () => {
  localStorage.removeItem('sw_token');
  localStorage.removeItem('sw_user');
  localStorage.removeItem('sw_refresh');
};

// ── Core executor ──────────────────────────────────────────
async function execute(serviceName, method, path, body = null, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);

  const isFormData = body instanceof FormData;
  const service = SERVICES[serviceName];
  
  if (!service) {
    throw new Error(`Unknown service: ${serviceName}. Available: ${Object.keys(SERVICES).join(', ')}`);
  }

  const baseURL = service.baseURL;
  const fullPath = `${baseURL}${path}`;

  const headers = {
    // Если FormData — Content-Type ставит браузер сам (с boundary)
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    // Auth токен — подставляем автоматически если есть
    ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
    // Кастомные заголовки поверх
    ...options.headers,
  };

  try {
    const res = await fetch(fullPath, {
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
    try {
      data = JSON.parse(text);
    } catch {
      /* plain text response */
    }

    if (!res.ok) {
      const err = new Error(data.message || text || `HTTP ${res.status}`);
      err.status = res.status;
      err.code = data.code || null;
      err.fields = data.fields || null;
      throw err;
    }

    return data;
  } catch (err) {
    clearTimeout(timer);

    // AbortController timeout
    if (err.name === 'AbortError') {
      const timeout = new Error('Request timed out. Check your connection.');
      timeout.code = 'TIMEOUT';
      throw timeout;
    }

    // Нет сети
    if (!navigator.onLine) {
      const offline = new Error('No internet connection.');
      offline.code = 'OFFLINE';
      throw offline;
    }

    throw err;
  }
}

// ── Клиент для сервиса авторизации (порт 8080) ─────────────
export const auth = {
  /** GET /path */
  get: (path, options) => execute('AUTH', 'GET', path, null, options),
  
  /** POST /path { body } */
  post: (path, body, options) => execute('AUTH', 'POST', path, body, options),
  
  /** PUT /path { body } */
  put: (path, body, options) => execute('AUTH', 'PUT', path, body, options),
  
  /** PATCH /path { body } */
  patch: (path, body, options) => execute('AUTH', 'PATCH', path, body, options),
  
  /** DELETE /path */
  del: (path, options) => execute('AUTH', 'DELETE', path, null, options),
  
  /** POST multipart/form-data (для файлов) */
  upload: (path, formData, options) => execute('AUTH', 'POST', path, formData, options),
};

// ── Клиент для сервиса хранения звуков (порт 8082) ─────────
export const storage = {
  /** GET /path */
  get: (path, options) => execute('STORAGE', 'GET', path, null, options),
  
  /** POST /path { body } */
  post: (path, body, options) => execute('STORAGE', 'POST', path, body, options),
  
  /** PUT /path { body } */
  put: (path, body, options) => execute('STORAGE', 'PUT', path, body, options),
  
  /** PATCH /path { body } */
  patch: (path, body, options) => execute('STORAGE', 'PATCH', path, body, options),
  
  /** DELETE /path */
  del: (path, options) => execute('STORAGE', 'DELETE', path, null, options),
  
  /** POST multipart/form-data (для файлов) */
  upload: (path, formData, options) => execute('STORAGE', 'POST', path, formData, options),
};

// ── Клиент для платежного сервиса (порт 8080) ───────────────
export const payment = {
  /** GET /path */
  get: (path, options) => execute('PAYMENT', 'GET', path, null, options),

  /** POST /path { body } */
  post: (path, body, options) => execute('PAYMENT', 'POST', path, body, options),

  /** PUT /path { body } */
  put: (path, body, options) => execute('PAYMENT', 'PUT', path, body, options),

  /** DELETE /path */
  del: (path, options) => execute('PAYMENT', 'DELETE', path, null, options),
};

// ── Клиент для крипто-платежного сервиса ─────────────────────
export const cryptoPayment = {
  /** GET /path */
  get: (path, options) => execute('CRYPTO_PAYMENT', 'GET', path, null, options),

  /** POST /path { body } */
  post: (path, body, options) => execute('CRYPTO_PAYMENT', 'POST', path, body, options),

  /** PUT /path { body } */
  put: (path, body, options) => execute('CRYPTO_PAYMENT', 'PUT', path, body, options),

  /** DELETE /path */
  del: (path, options) => execute('CRYPTO_PAYMENT', 'DELETE', path, null, options),
};

// ── Для обратной совместимости (если код использует старые импорты) ──
// По умолчанию используем storage сервис (звуки)
export const get = (path, options) => storage.get(path, options);
export const post = (path, body, options) => storage.post(path, body, options);
export const put = (path, body, options) => storage.put(path, body, options);
export const patch = (path, body, options) => storage.patch(path, body, options);
export const del = (path, options) => storage.del(path, options);
export const upload = (path, formData, options) => storage.upload(path, formData, options);