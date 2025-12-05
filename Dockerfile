# Multi-stage Dockerfile pour monorepo pnpm

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate
WORKDIR /app

# Copier les fichiers de configuration pnpm et workspace
COPY pnpm-workspace.yaml package.json ./
COPY pnpm-lock.yaml ./

# Copier tous les package.json des workspaces
COPY domain/package.json ./domain/package.json
COPY application/package.json ./application/package.json
COPY infrastructure/package.json ./infrastructure/package.json
COPY interfaces/app-next/package.json ./interfaces/app-next/package.json
COPY interfaces/express/package.json ./interfaces/express/package.json
COPY interfaces/sockets/package.json ./interfaces/sockets/package.json

# Installer toutes les dépendances
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copier les node_modules depuis deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./

# Copier tout le code source
COPY . .

# Build tous les packages
RUN pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers buildés nécessaires
COPY --from=builder /app/interfaces/app-next/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/interfaces/app-next/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/interfaces/app-next/.next/static ./interfaces/app-next/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "interfaces/app-next/server.js"]