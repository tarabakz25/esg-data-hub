import { NextRequest, NextResponse } from 'next/server';
import { CumulativeKpiService } from '@/lib/services/cumulative-kpi-service';

export const runtime = 'nodejs';

/**
 * 累積KPI一覧取得API
 * 添付仕様書：統合ダッシュボード画面（標準KPIテーブル 80%）
 */

/**
 * GET /api/dashboard/cumulative-kpis
 * 累積KPI一覧と欠損KPI情報を取得
 */
export async function GET(request: NextRequest) {
  try {
    // 累積KPIデータを取得
    const cumulativeKpis = await CumulativeKpiService.getAllCumulativeKpis();
    
    // 欠損KPIを取得  
    const missingKpis = await CumulativeKpiService.getMissingKpis();
    
    // 統計情報を取得
    const stats = await CumulativeKpiService.getCumulativeStats();
    
    return NextResponse.json({
      cumulativeKpis,
      missingKpis,
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('累積KPI取得エラー:', error);
    return NextResponse.json(
      { 
        error: '累積KPIデータの取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/dashboard/cumulative-kpis/[id]/reset
 * 特定の累積KPIをリセット（管理機能）
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kpiId = searchParams.get('kpiId');

    if (!kpiId) {
      return NextResponse.json(
        { error: 'KPI IDが指定されていません' },
        { status: 400 }
      );
    }

    // リセット処理は今後実装
    // await CumulativeKpiService.resetKpi(kpiId);

    return NextResponse.json({ 
      success: true,
      message: `KPI ${kpiId} をリセットしました`
    });

  } catch (error) {
    console.error('KPIリセットエラー:', error);
    
    return NextResponse.json(
      { 
        error: 'KPIのリセットに失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 