// ============================================================
//  API SERVICE — подключи бэкенд здесь
//  Замени BASE_URL на адрес своего сервера
// ============================================================

const BASE_URL = 'http://localhost:3001/api'; // <-- твой бэкенд

// ---------- helpers ----------
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ---------- products ----------
export const api = {
  // GET /api/products?category=all&search=
  getProducts: (category = 'all', search = '') =>
    request(`/products?category=${category}&search=${encodeURIComponent(search)}`),

  // GET /api/products/:id
  getProduct: (id) => request(`/products/${id}`),

  // POST /api/products  (для загрузки нового звука)
  createProduct: (data) =>
    request('/products', { method: 'POST', body: JSON.stringify(data) }),

  // DELETE /api/products/:id
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // ---------- stats ----------
  getStats: () => request('/stats'),
};

// ============================================================
//  MOCK DATA — используется пока нет бэкенда
//  Удали (или закомментируй) этот блок когда подключишь API
// ============================================================
export const MOCK_PRODUCTS = [
  {
    id: 1,
    title: 'Epic Donation Drop',
    creator: '@SoundSmithAudio',
    price: 12,
    category: 'alerts',
    tags: ['Alert', 'Cinematic', 'Epic'],
    bars: [30, 50, 70, 45, 80, 60, 40, 55, 75, 50, 35, 65, 55, 70, 45],
  },
  {
    id: 2,
    title: 'Glitch Transition Pack',
    creator: '@PixelWaveStudio',
    price: 8,
    category: 'transitions',
    tags: ['Transition', 'Pack', 'Glitch'],
    bars: [40, 60, 50, 70, 55, 45, 65, 75, 50, 60, 40, 55, 70, 60, 50],
  },
  {
    id: 3,
    title: 'Retro Gaming Jingle',
    creator: '@8BitMaestro',
    price: 5,
    category: 'jingles',
    tags: ['Jingle', 'Retro', 'Gaming'],
    bars: [35, 55, 65, 45, 70, 60, 50, 75, 55, 40, 65, 50, 60, 45, 70],
  },
  {
    id: 4,
    title: 'Cyberpunk UI Kit',
    creator: '@NeonSoundLab',
    price: 15,
    category: 'ui',
    tags: ['UI', 'Pack', 'Futuristic'],
    bars: [45, 65, 55, 75, 50, 60, 70, 45, 80, 55, 65, 50, 60, 70, 55],
  },
  {
    id: 5,
    title: 'Minimal Ping Alerts',
    creator: '@CleanToneStudio',
    price: 6,
    category: 'alerts',
    tags: ['Alert', 'Minimal', 'Clean'],
    bars: [50, 70, 60, 40, 65, 55, 75, 50, 60, 70, 45, 55, 65, 50, 60],
  },
  {
    id: 6,
    title: 'Bass Drop Stinger',
    creator: '@BasslineBeats',
    price: 10,
    category: 'stingers',
    tags: ['Stinger', 'Bass', 'Impact'],
    bars: [55, 75, 65, 50, 80, 60, 45, 70, 55, 65, 50, 60, 75, 65, 55],
  },
  {
    id: 7,
    title: 'Neon Sub Alert',
    creator: '@SubFactory',
    price: 9,
    category: 'alerts',
    tags: ['Alert', 'Sub', 'Neon'],
    bars: [60, 40, 70, 55, 65, 75, 50, 45, 80, 60, 55, 70, 50, 65, 60],
  },
  {
    id: 8,
    title: 'Dark Ambient Stinger',
    creator: '@VoidSoundworks',
    price: 11,
    category: 'stingers',
    tags: ['Stinger', 'Dark', 'Ambient'],
    bars: [35, 65, 45, 75, 55, 60, 40, 70, 65, 50, 80, 45, 60, 55, 70],
  },
];

export const MOCK_STATS = {
  sounds: '12K+',
  creators: '3.5K+',
  streamers: '45K+',
  paid: '$250K',
};