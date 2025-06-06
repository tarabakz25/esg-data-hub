import { NextRequest, NextResponse } from 'next/server';
import { CatalogService } from '@/lib/utils/catalog';
import type { 
  KPISearchQuery, 
  DataSourceSearchQuery 
} from '@/types/catalog';

// 簡素なGraphQLクエリパーサー
function parseGraphQLQuery(query: string): any {
  // 基本的なクエリパースを実装（簡略版）
  const trimmed = query.trim();
  
  if (trimmed.includes('searchKPIs')) {
    const match = trimmed.match(/searchKPIs\s*\(\s*input:\s*{([^}]*)}\s*\)/);
    if (match) {
      const inputStr = match[1];
      const input: any = {};
      
      // inputStrの存在確認
      if (!inputStr) {
        return { type: 'searchKPIs', input: {} };
      }
      
      // 基本的なフィールド解析
      const qMatch = inputStr.match(/q:\s*"([^"]*)"/);
      if (qMatch && qMatch[1]) input.q = qMatch[1];
      
      const regulationMatch = inputStr.match(/regulation:\s*"([^"]*)"/);
      if (regulationMatch && regulationMatch[1]) input.regulation = regulationMatch[1];
      
      const pageMatch = inputStr.match(/page:\s*(\d+)/);
      if (pageMatch && pageMatch[1]) input.page = parseInt(pageMatch[1]);
      
      const limitMatch = inputStr.match(/limit:\s*(\d+)/);
      if (limitMatch && limitMatch[1]) input.limit = parseInt(limitMatch[1]);
      
      return { type: 'searchKPIs', input };
    }
  }
  
  if (trimmed.includes('getKPI')) {
    const match = trimmed.match(/getKPI\s*\(\s*id:\s*"([^"]*)"\s*\)/) || trimmed.match(/getKPI\s*\(\s*id:\s*(\w+)\s*\)/);
    if (match) {
      return { type: 'getKPI', id: match[1] };
    }
  }
  
  if (trimmed.includes('searchDataSources')) {
    const match = trimmed.match(/searchDataSources\s*\(\s*input:\s*{([^}]*)}\s*\)/);
    if (match) {
      const inputStr = match[1];
      const input: any = {};
      
      // inputStrの存在確認
      if (!inputStr) {
        return { type: 'searchDataSources', input: {} };
      }
      
      const qMatch = inputStr.match(/q:\s*"([^"]*)"/);
      if (qMatch && qMatch[1]) input.q = qMatch[1];
      
      const pageMatch = inputStr.match(/page:\s*(\d+)/);
      if (pageMatch && pageMatch[1]) input.page = parseInt(pageMatch[1]);
      
      const limitMatch = inputStr.match(/limit:\s*(\d+)/);
      if (limitMatch && limitMatch[1]) input.limit = parseInt(limitMatch[1]);
      
      return { type: 'searchDataSources', input };
    }
  }
  
  if (trimmed.includes('getDataSource')) {
    const match = trimmed.match(/getDataSource\s*\(\s*id:\s*(\d+)\s*\)/);
    if (match && match[1]) {
      return { type: 'getDataSource', id: parseInt(match[1]) };
    }
  }
  
  if (trimmed.includes('getCatalogStats')) {
    return { type: 'getCatalogStats' };
  }
  
  throw new Error('サポートされていないクエリです');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, variables } = body;
    
    if (!query) {
      return NextResponse.json(
        {
          errors: [{ message: 'クエリが指定されていません' }]
        },
        { status: 400 }
      );
    }
    
    const parsedQuery = parseGraphQLQuery(query);
    let result: any;
    
    switch (parsedQuery.type) {
      case 'searchKPIs':
        const kpiQuery: KPISearchQuery = {
          q: parsedQuery.input.q,
          regulation: parsedQuery.input.regulation,
          page: parsedQuery.input.page || 1,
          limit: parsedQuery.input.limit || 20,
          sortBy: 'name',
          sortOrder: 'desc',
        };
        const kpiResult = await CatalogService.searchKPIs(kpiQuery);
        if (!kpiResult.success) {
          throw new Error(kpiResult.error);
        }
        result = {
          searchKPIs: {
            data: kpiResult.data,
            pagination: kpiResult.pagination,
          }
        };
        break;
        
      case 'getKPI':
        const kpiDetailResult = await CatalogService.getKPIDetail(parsedQuery.id);
        if (!kpiDetailResult.success) {
          throw new Error(kpiDetailResult.error);
        }
        result = { getKPI: kpiDetailResult.data };
        break;
        
      case 'searchDataSources':
        const dsQuery: DataSourceSearchQuery = {
          q: parsedQuery.input.q,
          page: parsedQuery.input.page || 1,
          limit: parsedQuery.input.limit || 20,
          sortBy: 'name',
          sortOrder: 'asc',
        };
        const dsResult = await CatalogService.searchDataSources(dsQuery);
        if (!dsResult.success) {
          throw new Error(dsResult.error);
        }
        result = {
          searchDataSources: {
            data: dsResult.data,
            pagination: dsResult.pagination,
          }
        };
        break;
        
      case 'getDataSource':
        const dsDetailResult = await CatalogService.getDataSourceDetail(parsedQuery.id);
        if (!dsDetailResult.success) {
          throw new Error(dsDetailResult.error);
        }
        result = { getDataSource: dsDetailResult.data };
        break;
        
      case 'getCatalogStats':
        const statsResult = await CatalogService.getCatalogStats();
        if (!statsResult.success) {
          throw new Error(statsResult.error);
        }
        result = { getCatalogStats: statsResult.data };
        break;
        
      default:
        throw new Error('サポートされていないクエリタイプです');
    }
    
    return NextResponse.json({ data: result }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
    
  } catch (error) {
    console.error('GraphQL エラー:', error);
    return NextResponse.json(
      {
        errors: [{ 
          message: error instanceof Error ? error.message : 'GraphQLクエリの処理中にエラーが発生しました' 
        }]
      },
      { status: 500 }
    );
  }
}

// GraphQL スキーマの取得（開発用）
export async function GET(request: NextRequest) {
  const schema = `
    type Query {
      searchKPIs(input: KPISearchInput!): KPIConnection!
      getKPI(id: Int!): KPI
      searchDataSources(input: DataSourceSearchInput!): DataSourceConnection!
      getDataSource(id: Int!): DataSource
      getCatalogStats: CatalogStats!
    }
    
    # 詳細な型定義は省略...
  `;
  
  return NextResponse.json({ 
    schema,
    examples: {
      searchKPIs: `
        query {
          searchKPIs(input: { q: "CO2", page: 1, limit: 10 }) {
            data {
              id
              code
              displayName
              baseUnit
            }
            pagination {
              page
              total
            }
          }
        }
      `,
      getCatalogStats: `
        query {
          getCatalogStats {
            totalKPIs
            totalDataSources
            complianceRate
          }
        }
      `
    }
  });
}
