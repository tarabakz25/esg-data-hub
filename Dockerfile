# Node.js公式イメージを使用（Alpine版で軽量化）
FROM node:18-alpine AS base

# 必要なパッケージをインストール
RUN apk add --no-cache libc6-compat

# 作業ディレクトリを設定
WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# Dependencies install stage
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .

# Prismaクライアントを生成
RUN npx prisma generate

# Next.jsアプリケーションをビルド
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# セキュリティのため非rootユーザーを作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 必要なファイルをコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# アップロードディレクトリを作成
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

# ポート3000を公開
EXPOSE 3000

# 非root ユーザーに切り替え
USER nextjs

# ヘルスチェック設定
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# アプリケーションを起動
CMD ["node", "server.js"] 