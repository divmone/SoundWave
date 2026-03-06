# SoundWave Marketplace

## Структура проекта

```
src/
├── api/
│   ├── config.js       — базовая fetch-обёртка, BASE_URL
│   ├── products.js     — CRUD для продуктов + документация backend API
│   ├── stats.js        — получение статистики
│   ├── mock.js         — мок-данные (удалить после подключения бэка)
│   └── index.js        — barrel export
├── components/
│   ├── Header.jsx
│   ├── Hero.jsx
│   ├── FilterTabs.jsx
│   ├── ProductCard.jsx
│   ├── Waveform.jsx
│   ├── StatsBar.jsx
│   ├── UploadModal.jsx
│   ├── CTASection.jsx
│   ├── CardSkeleton.jsx
│   ├── EmptyState.jsx
│   └── Footer.jsx
├── hooks/
│   ├── useProducts.js
│   └── useStats.js
├── pages/
│   └── App.jsx
└── styles/
    └── globals.css
```

## Backend API — что нужно от сервера

### GET /api/products
Query params: `category`, `search`, `page`, `limit`

Возвращает:
```json
{
  "items": [
    {
      "id": 1,
      "title": "Epic Donation Drop",
      "creator": "@SoundSmithAudio",
      "price": 12,
      "category": "alerts",
      "tags": ["Alert", "Cinematic"],
      "duration": 8,
      "previewUrl": "https://cdn.example.com/preview/1.mp3",
      "downloadCount": 2341,
      "rating": 4.9,
      "isFeatured": true,
      "bars": [30,50,70,45,80,60,40,55,75,50,35,65,55,70,45],
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

### POST /api/products  (multipart/form-data)
- `audio`: File
- `data`: JSON string `{ title, creator, price, category, tags }`

Возвращает: `{ id, status: "pending" | "approved", message }`

### POST /api/products/:id/purchase
Body: `{ email, paymentMethodId }` (Stripe)

Возвращает: `{ downloadUrl, receipt }`

### GET /api/stats
Возвращает: `{ sounds, creators, streamers, paid }`

## Включить реальный API

В `.env`:
```
REACT_APP_USE_MOCK=false
REACT_APP_API_URL=https://your-backend.com/api
```
