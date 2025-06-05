# ESG Data Hub - 本番環境設定ガイド

## 🚀 本番環境デプロイメント

### 必要な環境
- Node.js 18.0.0以上
- PostgreSQL 13以上
- Redis 6以上（オプション）
- Docker & Docker Compose（推奨）

## 📋 事前準備

### 1. 環境変数の設定
```bash
# .env.productionファイルを作成
cp .env.example .env.production

# 必要な環境変数を設定
DATABASE_URL="postgresql://username:password@localhost:5432/esg_data_hub"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
NODE_ENV="production"
```

### 2. データベースのセットアップ
```bash
# Prismaマイグレーションの実行
npm run db:migrate:prod

# 初期データの投入
npm run db:seed
```

### 3. セキュリティ設定
```bash
# セキュリティ監査の実行
npm run security:audit

# 脆弱性の修正
npm run security:fix
```

## 🐳 Dockerを使用したデプロイ

### 1. コンテナのビルド
```bash
# Dockerイメージのビルド
npm run docker:build

# または docker-composeを使用
docker-compose build
```

### 2. 本番環境の起動
```bash
# サービスの起動
docker-compose up -d

# ログの確認
docker-compose logs -f app
```

### 3. ヘルスチェック
```bash
# アプリケーションの健全性確認
curl http://localhost:3000/api/health
```

## 🔧 従来の方法でのデプロイ

### 1. 依存関係のインストール
```bash
# 本番用パッケージのインストール
npm ci --only=production
```

### 2. アプリケーションのビルド
```bash
# 本番用ビルド
npm run build:prod
```

### 3. アプリケーションの起動
```bash
# 本番環境での起動
npm run start:prod
```

## 🛡️ セキュリティ機能

### 実装済みセキュリティ機能
- ✅ レート制限（1分間に10回まで）
- ✅ ファイル形式検証（CSV, Excel, JSON）
- ✅ ファイルサイズ制限（50MB）
- ✅ セキュアなファイル名生成
- ✅ CSRFプロテクション
- ✅ セキュリティヘッダー
- ✅ 入力値サニタイゼーション

### 追加セキュリティ設定
```javascript
// next.config.ts内のセキュリティヘッダー
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // その他のセキュリティヘッダー
]
```

## 📊 モニタリング

### ログ管理
```bash
# アプリケーションログの確認
tail -f logs/application.log

# エラーログの確認
tail -f logs/error.log
```

### メトリクス監視
- アップロード成功率
- API応答時間
- エラー発生率
- ファイル処理時間

## 🔄 アップデート手順

### 1. バックアップ
```bash
# データベースのバックアップ
pg_dump esg_data_hub > backup_$(date +%Y%m%d).sql

# ファイルのバックアップ
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

### 2. アプリケーション更新
```bash
# Gitから最新コードを取得
git pull origin main

# 依存関係の更新
npm ci

# データベースマイグレーション
npm run db:migrate:prod

# アプリケーションのリビルド
npm run build:prod

# サービスの再起動
npm run start:prod
```

## 🔍 トラブルシューティング

### よくある問題と解決方法

#### 1. ファイルアップロードエラー
```bash
# ディスク容量の確認
df -h

# アップロードディレクトリの権限確認
ls -la uploads/
```

#### 2. データベース接続エラー
```bash
# PostgreSQLサービスの状態確認
systemctl status postgresql

# 接続テスト
psql -h localhost -U username -d esg_data_hub
```

#### 3. メモリ不足
```bash
# Node.jsヒープサイズの調整
NODE_OPTIONS="--max-old-space-size=4096" npm run start:prod
```

## 📈 パフォーマンス最適化

### 実装済み最適化
- ✅ ファイル圧縮
- ✅ ETags生成
- ✅ 画像最適化
- ✅ CSS最適化
- ✅ 並列API呼び出し
- ✅ コンソールログ除去（本番環境）

### 追加最適化案
- Redis使用によるキャッシュ機能
- CDN活用による静的ファイル配信
- データベースインデックスの最適化

## 🔐 バックアップ戦略

### 自動バックアップ設定
```bash
# crontabに追加
0 2 * * * /path/to/backup-script.sh
```

### バックアップスクリプト例
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump esg_data_hub > /backups/db_$DATE.sql
tar -czf /backups/uploads_$DATE.tar.gz uploads/
```

## 📞 サポート

本番環境での問題が発生した場合：
1. まずログファイルを確認
2. システムリソース（CPU、メモリ、ディスク）を確認
3. データベースの状態を確認
4. 必要に応じてサービスの再起動

緊急時の連絡先：
- システム管理者: [email]
- 開発チーム: [email] 