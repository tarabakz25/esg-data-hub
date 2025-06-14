import { NextRequest, NextResponse } from 'next/server';
import { CatalogService } from '@/lib/utils/catalog';
import { DataSourceSearchQuery } from '@/types/catalog';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // クエリパラメータを解析
    const queryData = {
      q: searchParams.get('q') || undefined,
      type: searchParams.get('type') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: searchParams.get('sortBy') as any || 'name',
      sortOrder: searchParams.get('sortOrder') as any || 'asc',
    };

    // バリデーション
    const validatedQuery = DataSourceSearchQuery.parse(queryData);
    
    // データソース検索を実行
    const result = await CatalogService.searchDataSources(validatedQuery);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // 5分キャッシュ
      },
    });
  } catch (error) {
    console.error('データソース検索APIエラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'リクエストの処理中にエラーが発生しました',
      },
      { status: 500 }
    );
  }
} 