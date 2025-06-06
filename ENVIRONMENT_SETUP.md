# 環境変数設定ガイド

## 必要な環境変数

プロジェクトを実行するために、以下の環境変数を設定する必要があります。

### 1. `.env.local` ファイルを作成

プロジェクトルートに `.env.local` ファイルを作成し、以下の内容をコピーして値を設定してください：

```bash
# NextAuth設定
NEXTAUTH_SECRET="your-super-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth設定（GitHubログインを使用する場合）
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# データベース設定
DATABASE_URL="your-database-connection-string"

# その他の設定
NODE_ENV="development"
```

### 2. GitHub OAuth設定

1. [GitHub Developer Settings](https://github.com/settings/developers) にアクセス
2. "OAuth Apps" → "New OAuth App" をクリック
3. 以下の情報を入力：
   - Application name: `ESG Data Hub`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. 作成後、Client IDとClient Secretを `.env.local` に設定

### 3. NextAuth Secret

安全なランダム文字列を生成してください：

```bash
# Unix/Linux/Mac の場合
openssl rand -base64 32

# または Node.js で生成
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. 設定確認

すべての環境変数を設定後、以下のコマンドで開発サーバーを起動：

```bash
npm run dev
```

## トラブルシューティング

### OAuth認証エラーの場合

1. GitHub OAuth設定が正しいか確認
2. Callback URLが正確か確認
3. Client IDとSecretが正しく設定されているか確認

### データベース接続エラーの場合

1. DATABASE_URLが正しく設定されているか確認
2. データベースが起動しているか確認
3. Prismaマイグレーションが完了しているか確認：

```bash
npm run db:migrate
npm run db:generate
```

## セキュリティ注意事項

- `.env.local` ファイルは絶対にgitにコミットしないでください
- 本番環境では強力なNEXTAUTH_SECRETを使用してください
- GitHubのClient Secretは外部に漏らさないでください 