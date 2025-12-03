# Multi-stage Dockerfile pour monorepo pnpm

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copier les fichiers de configuration pnpm
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY domain/package.json ./domain/
COPY application/package.json ./application/
COPY infrastructure/package.json ./infrastructure/
COPY interfaces/*/package.json ./interfaces/*/

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copier les dépendances
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./
COPY . .

# Build tous les packages
RUN pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier seulement ce qui est nécessaire
COPY --from=builder /app/interfaces/app-next/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/interfaces/app-next/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/interfaces/app-next/.next/static ./interfaces/app-next/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "interfaces/app-next/server.js"]