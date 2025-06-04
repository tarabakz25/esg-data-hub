import { z } from 'zod'

// KPI検索クエリ
export const KPISearchQuery = z.object({
  q: z.string().optional(),
  regulation: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
  sortBy: z.enum(['name', 'code', 'createdAt', 'relevance']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})
export type KPISearchQuery = z.infer<typeof KPISearchQuery>

// データソース検索クエリ
export const DataSourceSearchQuery = z.object({
  q: z.string().optional(),
  type: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
  sortBy: z.enum(['name', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})
export type DataSourceSearchQuery = z.infer<typeof DataSourceSearchQuery>

// ページネーション情報
export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

// API レスポンス
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  pagination?: Pagination
}

// KPI要件
export interface KPIRequirement {
  regulation: string
  isRequired: boolean
  dueDate?: Date
  department?: string
}

// KPI詳細
export interface KPIDetail {
  id: number
  code: string
  displayName: string
  baseUnit: string
  requirements: KPIRequirement[]
}

// データソース詳細
export interface DataSourceDetail {
  id: number
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

// カタログ統計
export interface CatalogStats {
  totalKPIs: number
  totalDataSources: number
  totalRecords: number
  missingKPIs: number
  recentAlerts: number
  complianceRate: number
}