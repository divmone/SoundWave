# SoundWave Marketplace

## Запуск

```bash
npm install
npm start        # http://localhost:3000
```

## Структура проекта

```
src/
├── api/
│   ├── httpClient.js          ← ЕДИНЫЙ HTTP-клиент (get/post/put/patch/del/upload)
│   ├── index.js               ← barrel export
│   └── services/
│       ├── authService.js     ← login, register, logout, Google, Apple, role
│       ├── productsService.js ← CRUD продуктов, purchase
│       └── statsService.js    ← статистика маркетплейса
│
├── components/
│   ├── auth/
│   │   ├── AuthInput.jsx      ← инпут с валидацией, показ/скрытие пароля
│   │   └── AuthLayout.jsx     ← фоновый layout для страниц авторизации
│   ├── layout/
│   │   ├── Header.jsx         ← навбар с auth state
│   │   └── Footer.jsx
│   ├── product/
│   │   ├── ProductCard.jsx    ← карточка трека с waveform
│   │   ├── CardSkeleton.jsx   ← skeleton-загрузка
│   │   ├── UploadModal.jsx    ← модалка загрузки трека
│   │   └── Waveform.jsx       ← анимированный waveform
│   ├── ui/
│   │   ├── Button.jsx         ← кнопка (primary/ghost/danger, sm/md/lg)
│   │   ├── Badge.jsx          ← бейдж/тег
│   │   ├── Spinner.jsx        ← лоадер
│   │   └── ErrorBanner.jsx    ← баннер ошибки
│   ├── Hero.jsx
│   ├── FilterTabs.jsx
│   ├── StatsBar.jsx
│   ├── CTASection.jsx
│   └── EmptyState.jsx
│
├── constants/
│   └── index.js               ← CATEGORIES, ROLES, regex-константы
│
├── hooks/
│   ├── useAuth.js
│   ├── useProducts.js
│   └── useStats.js
│
├── pages/
│   ├── App.jsx                ← роутер + главная страница
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── ForgotPasswordPage.jsx
│
└── styles/
    └── globals.css            ← CSS-переменные, keyframes, btn-классы
```

## Как делать запросы к backend

```js
import { get, post, put, patch, del, upload } from '../api/httpClient';

// GET
const products = await get('/products?page=1');

// POST с телом
const user = await post('/auth/login', { email, password });

// PUT / PATCH
await put('/products/42', { title: 'New title' });
await patch('/users/me', { avatar: url });

// DELETE
await del('/products/42');

// Загрузка файла (multipart/form-data)
const fd = new FormData();
fd.append('audio', file);
await upload('/products', fd);
```

Токен JWT подставляется **автоматически** из localStorage.

## Backend API endpoints

| Method | Path | Описание |
|--------|------|----------|
| POST | /auth/register | Регистрация |
| POST | /auth/login | Вход |
| POST | /auth/logout | Выход |
| GET | /auth/me | Текущий пользователь |
| POST | /auth/refresh | Обновить access token |
| POST | /auth/forgot-password | Письмо для сброса пароля |
| POST | /auth/google | OAuth через Google (code) |
| POST | /auth/apple | OAuth через Apple (identityToken) |
| POST | /auth/role | Установить роль buyer/creator |
| GET | /products | Список треков |
| GET | /products/:id | Один трек |
| POST | /products | Загрузить трек (multipart) |
| PUT | /products/:id | Обновить трек |
| DELETE | /products/:id | Удалить трек |
| POST | /products/:id/purchase | Купить трек (Stripe) |
| GET | /stats | Статистика маркетплейса |

## Переменные окружения

```bash
# .env
REACT_APP_API_URL=http://localhost:3001/api
```
