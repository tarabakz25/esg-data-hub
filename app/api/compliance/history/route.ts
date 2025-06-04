import { NextRequest, NextResponse } from 'next/server';
import { KPIComplianceChecker } from '@/lib/services';
import { type ComplianceStandard } from '@/lib/services';

/**
 * GET /api/compliance/history - コンプライアンスチェック履歴を取得
 * ?standard=issb&limit=10
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const standard = searchParams.get('standard') as ComplianceStandard | null;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    if (standard && !['issb', 'csrd', 'custom'].includes(standard)) {
      return NextResponse.json(
        { error: '無効な standard です。issb, csrd, custom のいずれかを指定してください' },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'limit は1から100の間で指定してください' },
        { status: 400 }
      );
    }

    const checker = new KPIComplianceChecker();
    try {
      const history = await checker.getComplianceHistory(standard || undefined, limit);
      return NextResponse.json(history);
    } finally {
      await checker.dispose();
    }
  } catch (error) {
    console.error('コンプライアンス履歴取得エラー:', error);
    return NextResponse.json(
      { error: 'コンプライアンス履歴の取得に失敗しました' },
      { status: 500 }
    );
  }
} 