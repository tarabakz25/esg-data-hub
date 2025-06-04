# データカタログ API ドキュメント

ESG Data Hub のデータカタログAPI は、KPI、データソース、統計情報の検索・取得機能を提供します。

## 概要

- **ベースURL**: `/api/catalog`
- **認証**: 今後実装予定
- **レスポンス形式**: JSON
- **キャッシュ**: 各エンドポイントで適切なキャッシュ設定済み

## REST API エンドポイント

### 1. KPI 検索

#### `GET /api/catalog/kpis`

KPIを検索します。

**クエリパラメータ:**
- `q` (string, optional): 検索クエリ（KPI名、コードで検索）
- `regulation` (string, optional): 規制で絞り込み (ISSB, CSRD, etc.)
- `category` (string, optional): カテゴリで絞り込み
- `unit` (string, optional): 単位で絞り込み
- `page` (number, default: 1): ページ番号
- `limit` (number, default: 20, max: 100): 取得件数
- `sortBy` (string, default: 'relevance'): ソート基準 (name, code, createdAt, relevance)
- `sortOrder` (string, default: 'desc'): ソート順 (asc, desc)

**レスポンス例:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "CO2_SCOPE1",
      "displayName": "Scope1 CO2排出量",
      "baseUnit": "tCO2e",
      "requirements": [
        {
          "regulation": "ISSB",
          "isRequired": true,
          "dueDate": "2024-12-31T00:00:00Z",
          "department": "環境部"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### 2. KPI 詳細取得

#### `GET /api/catalog/kpis/{id}`

特定のKPIの詳細情報を取得します。

**パスパラメータ:**
- `id` (number): KPI ID

**レスポンス例:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "CO2_SCOPE1",
    "displayName": "Scope1 CO2排出量",
    "baseUnit": "tCO2e",
    "description": "直接排出される温室効果ガス排出量",
    "requirements": [
      {
        "regulation": "ISSB",
        "isRequired": true,
        "dueDate": "2024-12-31T00:00:00Z",
        "department": "環境部"
      }
    ]
  }
}
```

### 3. データソース検索

#### `GET /api/catalog/datasources`

データソースを検索します。

**クエリパラメータ:**
- `q` (string, optional): 検索クエリ（名前、説明で検索）
- `type` (string, optional): データソースタイプで絞り込み
- `page` (number, default: 1): ページ番号
- `limit` (number, default: 20, max: 100): 取得件数
- `sortBy` (string, default: 'name'): ソート基準 (name, createdAt)
- `sortOrder` (string, default: 'asc'): ソート順 (asc, desc)

### 4. データソース詳細取得

#### `GET /api/catalog/datasources/{id}`

特定のデータソースの詳細情報を取得します。

### 5. 統計情報取得

#### `GET /api/catalog/stats`

カタログ全体の統計情報を取得します。

**レスポンス例:**
```json
{
  "success": true,
  "data": {
    "totalKPIs": 45,
    "totalDataSources": 12,
    "totalRecords": 15432,
    "missingKPIs": 3,
    "recentAlerts": 7,
    "complianceRate": 93
  }
}
```

## GraphQL API

### エンドポイント: `POST /api/graphql`

GraphQLクエリをサポートしています。

**基本クエリ例:**

```graphql
query SearchKPIs {
  searchKPIs(input: { q: "CO2", page: 1, limit: 10 }) {
    data {
      id
      code
      displayName
      baseUnit
      requirements {
        regulation
        isRequired
      }
    }
    pagination {
      page
      total
    }
  }
}
```

**統計情報取得:**

```graphql
query GetStats {
  getCatalogStats {
    totalKPIs
    totalDataSources
    complianceRate
    missingKPIs
  }
}
```

## エラーレスポンス

すべてのAPIエンドポイントは、エラー発生時に以下の形式でレスポンスを返します：

```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

**HTTPステータスコード:**
- `200` - 成功
- `400` - リクエストエラー
- `404` - リソースが見つからない
- `500` - サーバーエラー

## 使用例

### JavaScript/TypeScript での利用

```typescript
// KPI検索
const response = await fetch('/api/catalog/kpis?q=CO2&regulation=ISSB');
const result = await response.json();

if (result.success) {
  console.log('KPIs:', result.data);
  console.log('ページネーション:', result.pagination);
}

// GraphQLクエリ
const graphqlResponse = await fetch('/api/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `
      query {
        getCatalogStats {
          totalKPIs
          complianceRate
        }
      }
    `
  })
});

const graphqlResult = await graphqlResponse.json();
console.log('統計:', graphqlResult.data.getCatalogStats);
```

### cURL での利用

```bash
# KPI検索
curl "http://localhost:3000/api/catalog/kpis?q=CO2&page=1&limit=5"

# 統計情報取得
curl "http://localhost:3000/api/catalog/stats"

# GraphQLクエリ
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ getCatalogStats { totalKPIs complianceRate } }"}' \
  http://localhost:3000/api/graphql
```

## パフォーマンス最適化

- **キャッシュ**: 各エンドポイントで適切なキャッシュ設定
- **ページネーション**: 大量データの効率的な取得
- **インデックス**: データベースの適切なインデックス設定
- **バッチクエリ**: N+1問題の回避

## セキュリティ

- **入力検証**: Zodスキーマによる厳密な検証
- **SQLインジェクション対策**: PrismaのORM使用
- **レート制限**: 今後実装予定
- **認証・認可**: 今後実装予定

## 制限事項

- REST APIの検索は基本的な文字列マッチングのみ
- GraphQLはフルスペックではなく簡略版の実装
- 現在は認証機能なし（今後追加予定）
- ベクトル検索機能は今後実装予定 