# ============================================================
# EVee E-Commerce Backend — Dockerfile
# Crown Motors | Premium Electric Mobility
# ============================================================

# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root dependencies definition
COPY package*.json ./
COPY backend/tsconfig.json ./backend/

# Install all dependencies including devDependencies for TypeScript build
RUN npm ci

# Copy backend source
COPY backend/ ./backend/

# Build TypeScript to dist
RUN npm run build

# --- Stage 2: Production Runner ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy dependency manifests and install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled files from builder
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/src/docs ./backend/dist/docs

# Set permissions
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

CMD ["node", "backend/dist/server.js"]
