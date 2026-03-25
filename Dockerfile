# ─── Stage 1: Build ───────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# ─── Stage 2: Production ──────────────────────────────────────────
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only the built output
COPY --from=builder /app/.output ./output

EXPOSE 3000

CMD ["node", "output/server/index.mjs"]
