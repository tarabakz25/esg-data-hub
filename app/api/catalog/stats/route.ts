import { NextRequest, NextResponse } from 'next/server';
import { CatalogService } from '@/lib/utils/catalog';

export async function GET(request: NextRequest) {
  try {
    // カタログ統計情報を取得
    const result = await CatalogService.getCatalogStats();
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=180', // 3分キャッシュ（頻繁に更新される可能性があるため短め）
      },
    });
  } catch (error) {
    console.error('カタログ統計情報取得APIエラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'リクエストの処理中にエラーが発生しました',
      },
      { status: 500 }
    );
  }
} 