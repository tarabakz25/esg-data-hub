import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  # カタログの基本型定義
  type KPI {
    id: Int!
    code: String!
    displayName: String!
    baseUnit: String!
    description: String
    category: String
    requirements: [KPIRequirement!]!
    recentRecords: Int
    lastUpdated: String
  }

  type KPIRequirement {
    regulation: String!
    isRequired: Boolean!
    dueDate: String
    department: String
  }

  type DataSource {
    id: Int!
    name: String!
    description: String
    type: String
    status: DataSourceStatus
    lastSync: String
    recordCount: Int
    createdAt: String!
    updatedAt: String!
  }

  enum DataSourceStatus {
    ACTIVE
    INACTIVE
    ERROR
  }

  type CatalogStats {
    totalKPIs: Int!
    totalDataSources: Int!
    totalRecords: Int!
    missingKPIs: Int!
    recentAlerts: Int!
    complianceRate: Int!
  }

  # ページネーション用の型
  type PageInfo {
    page: Int!
    limit: Int!
    total: Int!
    pages: Int!
  }

  type KPIConnection {
    data: [KPI!]!
    pagination: PageInfo!
  }

  type DataSourceConnection {
    data: [DataSource!]!
    pagination: PageInfo!
  }

  # クエリの入力型
  input KPISearchInput {
    q: String
    regulation: String
    category: String
    unit: String
    page: Int = 1
    limit: Int = 20
    sortBy: KPISortField = RELEVANCE
    sortOrder: SortOrder = DESC
  }

  input DataSourceSearchInput {
    q: String
    type: String
    page: Int = 1
    limit: Int = 20
    sortBy: DataSourceSortField = NAME
    sortOrder: SortOrder = ASC
  }

  enum KPISortField {
    NAME
    CODE
    CREATED_AT
    RELEVANCE
  }

  enum DataSourceSortField {
    NAME
    CREATED_AT
  }

  enum SortOrder {
    ASC
    DESC
  }

  # クエリの定義
  type Query {
    # KPI関連
    searchKPIs(input: KPISearchInput!): KPIConnection!
    getKPI(id: Int!): KPI
    
    # データソース関連
    searchDataSources(input: DataSourceSearchInput!): DataSourceConnection!
    getDataSource(id: Int!): DataSource
    
    # 統計情報
    getCatalogStats: CatalogStats!
  }

  # ミューテーション（将来の拡張用）
  type Mutation {
    # 将来のCRUD操作用にプレースホルダーを用意
    _placeholder: String
  }
`; 