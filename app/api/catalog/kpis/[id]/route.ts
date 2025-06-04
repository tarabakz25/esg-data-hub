import { NextRequest, NextResponse } from 'next/server';
import { CatalogService } from '@/lib/utils/catalog';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なKPI IDです',
        },
        { status: 400 }
      );
    }

    // KPI詳細を取得
    const result = await CatalogService.getKPIDetail(id);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=600', // 10分キャッシュ
      },
    });
  } catch (error) {
    console.error('KPI詳細取得APIエラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'リクエストの処理中にエラーが発生しました',
      },
      { status: 500 }
    );
  }
} 