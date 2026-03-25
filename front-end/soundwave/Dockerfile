# ── Stage 1: Build ────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY public ./public
COPY src    ./src

RUN npm run build

# ── Stage 2: Export static files to shared volume ─────────
FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/build /app/build

CMD ["sh", "-c", "cp -r /app/build/. /frontend-dist/ && echo 'Static files ready' && tail -f /dev/null"]
