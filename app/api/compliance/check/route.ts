import { NextRequest, NextResponse } from 'next/server';
import { KPIComplianceChecker } from '@/lib/services';
import { type ComplianceStandard } from '@/lib/services';
import { 
  ComplianceChecker, 
  type ComplianceCheckRequest, 
  type ComplianceCheckResponse,
  type MappingResult 
} from '@/lib/compliance-checker';

/**
 * GET /api/compliance/check - コンプライアンスチェック結果を取得
 * ?period=2024Q3&standard=issb
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const standard = searchParams.get('standard') as ComplianceStandard;

    if (!period || !standard) {
      return NextResponse.json(
        { error: 'period と standard パラメータが必要です' },
        { status: 400 }
      );
    }

    if (!['issb', 'csrd', 'custom'].includes(standard)) {
      return NextResponse.json(
        { error: '無効な standard です。issb, csrd, custom のいずれかを指定してください' },
        { status: 400 }
      );
    }

    const result = await KPIComplianceChecker.getCheckResult(period, standard);
    
    if (!result) {
      return NextResponse.json(
        { error: '指定された期間と標準のチェック結果が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('コンプライアンスチェック結果取得エラー:', error);
    return NextResponse.json(
      { error: 'コンプライアンスチェック結果の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/compliance/check - KPIマッピング結果ベースのコンプライアンスチェック
 * Body: { mappingResults: MappingResult[], requiredCategories: string[], minConfidenceThreshold: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 新しいKPIマッピングベースのチェック
    if (body.mappingResults && Array.isArray(body.mappingResults)) {
      return await handleMappingBasedCheck(body);
    }
    
    // 従来の期間ベースのチェック（後方互換性のため）
    const { period, standard, createNotifications = true } = body;

    if (!period || !standard) {
      return NextResponse.json(
        { error: 'period と standard は必須です' },
        { status: 400 }
      );
    }

    if (!['issb', 'csrd', 'custom'].includes(standard)) {
      return NextResponse.json(
        { error: '無効な standard です。issb, csrd, custom のいずれかを指定してください' },
        { status: 400 }
      );
    }

    console.log(`🔍 従来のコンプライアンスチェック実行: ${period} (${standard})`);
    const result = await KPIComplianceChecker.checkCompliance(period, standard, createNotifications);

    return NextResponse.json(result);
  } catch (error) {
    console.error('コンプライアンスチェック実行エラー:', error);
    
    if (error instanceof Error && error.message.includes('無効な期間形式')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'コンプライアンスチェックの実行に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * 新規追加: KPIマッピング結果ベースのコンプライアンスチェック処理
 */
async function handleMappingBasedCheck(
  requestBody: ComplianceCheckRequest
): Promise<NextResponse<ComplianceCheckResponse>> {
  const startTime = Date.now();
  
  try {
    const {
      mappingResults,
      requiredCategories = ['Environment', 'Social', 'Governance'],
      minConfidenceThreshold = 0.6,
      includeDataQuality = true
    } = requestBody;

    // 入力検証
    if (!mappingResults || !Array.isArray(mappingResults) || mappingResults.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'mappingResults配列は必須で、空でない配列である必要があります' 
        },
        { status: 400 }
      );
    }

    if (minConfidenceThreshold < 0 || minConfidenceThreshold > 1) {
      return NextResponse.json(
        { 
          success: false,
          error: 'minConfidenceThresholdは0から1の間で指定してください' 
        },
        { status: 400 }
      );
    }

    console.log(`🔍 KPIマッピングベースのコンプライアンスチェック開始: ${mappingResults.length}件のマッピング結果`);

    // 新しいコンプライアンスチェッカーでチェック実行
    const complianceResult = ComplianceChecker.checkKPICompliance(mappingResults, {
      requiredCategories,
      minConfidenceThreshold,
      includeDataQuality
    });

    // 詳細レポート生成
    const detailedReport = ComplianceChecker.generateDetailedReport(complianceResult);

    const processingTime = Date.now() - startTime;

    console.log(`✅ コンプライアンスチェック完了: 総合スコア ${complianceResult.overallScore}%`);

    const response: ComplianceCheckResponse = {
      success: true,
      complianceResult,
      detailedReport,
      processingTimeMs: processingTime
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('KPIマッピングベースのコンプライアンスチェック失敗:', error);
    
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json(
      { 
        success: false,
        error: 'コンプライアンスチェックの実行に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
        processingTimeMs: processingTime
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/compliance/check - 一括コンプライアンスチェック（複数のマッピング結果セット）
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { mappingResultSets, globalOptions } = body;

    if (!mappingResultSets || !Array.isArray(mappingResultSets)) {
      return NextResponse.json(
        { error: 'mappingResultSets配列が必要です' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const results = [];

    for (let i = 0; i < mappingResultSets.length; i++) {
      const mappingSet = mappingResultSets[i];
      const options = { ...globalOptions, ...mappingSet.options };

      try {
        const complianceResult = ComplianceChecker.checkKPICompliance(
          mappingSet.mappingResults,
          options
        );

        const detailedReport = ComplianceChecker.generateDetailedReport(complianceResult);

        results.push({
          setIndex: i,
          setName: mappingSet.name || `Set ${i + 1}`,
          success: true,
          complianceResult,
          detailedReport
        });

      } catch (error) {
        console.error(`マッピングセット ${i} のチェック失敗:`, error);
        results.push({
          setIndex: i,
          setName: mappingSet.name || `Set ${i + 1}`,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      results,
      totalSets: mappingResultSets.length,
      successfulSets: results.filter(r => r.success).length,
      processingTimeMs: processingTime
    });

  } catch (error) {
    console.error('一括コンプライアンスチェック失敗:', error);
    return NextResponse.json(
      { error: '一括コンプライアンスチェックの実行に失敗しました' },
      { status: 500 }
    );
  }
} 