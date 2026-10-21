# Multi-stage Dockerfile for Next.js Standalone on Port 1886
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Step 1: Dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Step 2: Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=1886

RUN npm run build

# Step 3: Runner
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=1886
ENV HOSTNAME="0.0.0.0"

# Directories for persistence
RUN mkdir -p /app/data /app/public/uploads && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app/data /app/public/uploads

# Copy build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 1886

VOLUME ["/app/data", "/app/public/uploads"]

CMD ["node", "server.js"]
