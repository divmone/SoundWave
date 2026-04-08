# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SoundWave is an audio asset marketplace for video content creators. Users can upload, browse, preview, and purchase sound effects, alerts, transitions, and jingles. It is an academic prototype — purchases are recorded in the DB but no real payment is processed.

Two user roles: **Creator** (uploads sounds) and **Listener/Buyer** (browses and purchases).

---

## Architecture

The system is composed of three independent services behind an **Nginx reverse proxy** (the sole public entry point on port 80):

| Service | Language/Framework | Port (internal) | DB |
|---|---|---|---|
| `authService` | C++17 + uServer | 8080 | PostgreSQL `soundwaveUsers` |
| `soundsStorageService` | (separate backend) | 8080 | PostgreSQL `soundwaveSounds` |
| `frontend` | React 18 (CRA) | — | — |

Nginx routes:
- `/auth/*` → `auth-service:8080`
- `/api/*` → `sounds-storage:8080`
- Everything else → static frontend build

### Frontend (`front-end/soundwave/`)

- **No router library** — routing is manual via a `page` state string in [App.jsx](front-end/soundwave/src/pages/App.jsx). Pages: `'home'`, `'login'`, `'oauth-callback'`. Navigate by calling `setPage(...)` (passed as `onNavigate` prop).
- **HTTP client** (`src/api/httpClient.js`): two named clients — `auth` (→ authService) and `storage` (→ soundsStorageService). Legacy shorthand exports (`get`, `post`, etc.) route to `storage` by default. Always import the right client for the target service.
- **Auth state** lives in `useAuth` hook (in-memory React state, seeded from `localStorage`). Three localStorage keys: `sw_token` (JWT), `sw_refresh`, `sw_user` (JSON).
- **`useProducts` hook** fetches paginated sounds and then resolves each `authorId` to a username via `GET /users/{id}` on the auth service.
- **`category` and `search` filters** are passed to `useProducts` but the current storage service API does not support server-side filtering — they are ignored in the fetch call.

### Auth Service (`backend/authService/`)

C++ service using the **uServer** framework. Structure:
- `src/handlers/` — HTTP handler classes (one per endpoint)
- `src/services/auth_service.cpp` — business logic (JWT creation, bcrypt hashing)
- `src/repositories/user_repository.cpp` — DB access layer
- `src/models/user.hpp` — User model
- `configs/static_config.yaml` / `configs/config_vars.yaml` — uServer config

Build with CMake presets (see Makefile targets below).

### Sounds Storage Service (`backend/soundsStorageService/`)

Handles audio file storage and metadata. All endpoints under `/api/v1.0/sounds/`. Page size is fixed at 9. Audio files served with range-request support (`Accept-Ranges: bytes`) for Safari compatibility.

**Known limitations:**
- `DELETE /sounds/{id}` — not implemented (returns stub)
- `PUT /sounds/{id}` — not implemented
- Tags are partially broken

---

## Running the Project

### Docker (recommended — full stack)

```bash
cp .env.example .env   # set POSTGRES_USER / POSTGRES_PASSWORD
docker compose up --build
```

App available at `http://localhost:80`. pgAdmin at `http://localhost:5050`.

### Frontend dev server (local, proxies to running backends)

```bash
cd front-end/soundwave
npm install
npm start
```

Dev proxy (`setupProxy.js`) routes:
- `/auth/*` → `http://localhost:8080` (auth service)
- `/api/*` → `http://localhost:8082` (sounds storage, rewrites to `/api/v1.0`)

The frontend `.env` vars `REACT_APP_AUTH_URL` and `REACT_APP_STORAGE_URL` override service base URLs (empty by default — uses proxy).

### Auth Service (C++ / uServer)

```bash
cd backend/authService
make cmake-debug        # configure
make build-debug        # build
make start-debug        # build + start with testsuite
make test-debug         # build + run tests
make format             # reformat C++ and Python sources
```

---

## Frontend Commands

```bash
npm start         # dev server on :3000
npm run build     # production build
npm test          # run tests (react-scripts / Jest)
npm test -- --testPathPattern=MyComponent   # single test file
```

---

## Key Patterns

- **Adding a new page**: create a JSX file in `src/pages/`, add a new `page` string value, and add a conditional render in [App.jsx](front-end/soundwave/src/pages/App.jsx). Pass `onNavigate` down to allow navigation.
- **Calling the auth service**: use `import { auth } from '../api/httpClient'` then `auth.get('/auth/me')`.
- **Calling the storage service**: use `import { storage } from '../api/httpClient'` then `storage.get('/api/v1.0/sounds/...')`, or use the helpers in `src/api/services/productsService.js`.
- **Inline styles only** — the project uses no CSS-in-JS library. All styling is done with inline style objects and a small set of global CSS classes in `src/styles/globals.css` (e.g. `btn-primary`, `btn-ghost`, `r-grid`, `hide-mobile`).
- **CSS custom properties** for the design system: `--cyan`, `--violet`, `--bg2`/`--bg3`/`--bg4`, `--text`/`--text2`/`--text3`, `--line`, `--font-display`, `--font-mono`, `--radius-pill`, etc.
- **Debug panel**: `Ctrl+Shift+D` on any page opens an overlay showing current user, pagination state, and all loaded products with resolved creator names.
