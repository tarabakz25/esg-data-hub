import { CatalogService } from '@/lib/utils/catalog';
import type { 
  KPISearchQuery, 
  DataSourceSearchQuery 
} from '@/types/catalog';

// GraphQLの引数を内部の型に変換するヘルパー関数
function convertKPISearchInput(input: any): KPISearchQuery {
  return {
    q: input.q,
    regulation: input.regulation,
    category: input.category,
    unit: input.unit,
    page: input.page || 1,
    limit: input.limit || 20,
    sortBy: input.sortBy?.toLowerCase() || 'name',
    sortOrder: input.sortOrder?.toLowerCase() || 'desc',
  };
}

function convertDataSourceSearchInput(input: any): DataSourceSearchQuery {
  return {
    q: input.q,
    type: input.type,
    page: input.page || 1,
    limit: input.limit || 20,
    sortBy: input.sortBy?.toLowerCase() || 'name',
    sortOrder: input.sortOrder?.toLowerCase() || 'asc',
  };
}

export const resolvers = {
  Query: {
    // KPI検索
    searchKPIs: async (_parent: any, { input }: { input: any }) => {
      const query = convertKPISearchInput(input);
      const result = await CatalogService.searchKPIs(query);
      
      if (!result.success) {
        throw new Error(result.error || 'KPI検索に失敗しました');
      }
      
      return {
        data: result.data,
        pagination: result.pagination,
      };
    },

    // 単一KPI取得
    getKPI: async (_parent: any, { id }: { id: string }) => {
      const result = await CatalogService.getKPIDetail(id);
      
      if (!result.success) {
        if (result.error === 'KPIが見つかりません') {
          return null; // GraphQLではnullを返す
        }
        throw new Error(result.error || 'KPI取得に失敗しました');
      }
      
      return result.data;
    },

    // データソース検索
    searchDataSources: async (_parent: any, { input }: { input: any }) => {
      const query = convertDataSourceSearchInput(input);
      const result = await CatalogService.searchDataSources(query);
      
      if (!result.success) {
        throw new Error(result.error || 'データソース検索に失敗しました');
      }
      
      return {
        data: result.data,
        pagination: result.pagination,
      };
    },

    // 単一データソース取得
    getDataSource: async (_parent: any, { id }: { id: number }) => {
      const result = await CatalogService.getDataSourceDetail(id);
      
      if (!result.success) {
        if (result.error === 'データソースが見つかりません') {
          return null; // GraphQLではnullを返す
        }
        throw new Error(result.error || 'データソース取得に失敗しました');
      }
      
      return result.data;
    },

    // カタログ統計情報
    getCatalogStats: async () => {
      const result = await CatalogService.getCatalogStats();
      
      if (!result.success) {
        throw new Error(result.error || '統計情報取得に失敗しました');
      }
      
      return result.data;
    },
  },

  Mutation: {
    _placeholder: () => 'プレースホルダー',
  },

  // カスタムスカラー/エナム型のリゾルバー（必要に応じて）
  DataSourceStatus: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ERROR: 'error',
  },
}; 