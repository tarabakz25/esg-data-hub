import { NextRequest, NextResponse } from 'next/server';
import { CsvHistoryService } from '@/lib/services/csv-history-service';

export const runtime = 'nodejs';

/**
 * ファイル詳細情報取得API
 * 添付仕様書：ファイル詳細画面（/dashboard/file-details/[fileId]）
 */

/**
 * GET /api/dashboard/file-details/[id]
 * 特定ファイルの詳細情報を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = parseInt(params.id);

    if (!fileId || isNaN(fileId)) {
      return NextResponse.json(
        { error: 'Invalid file ID' },
        { status: 400 }
      );
    }

    // ファイル詳細情報を取得
    const fileDetails = await CsvHistoryService.getFileDetails(fileId);

    // 添付仕様書の表示形式に合わせて整形
    const response = {
      file: {
        id: fileDetails.file.id,
        uploadId: fileDetails.file.uploadId,
        filename: fileDetails.file.filename,
        uploadedAt: fileDetails.file.uploadedAt.toISOString(),
        processingTimeMs: fileDetails.file.processingTimeMs,
        processingStatus: fileDetails.file.processingStatus,
        errorDetails: fileDetails.file.errorDetails
      },
      
      // 🎯 KPIマッピング分析結果
      mappingAnalysis: {
        detectedKpiIdentifiers: fileDetails.mappingResults.length,
        highConfidenceMappings: fileDetails.mappingResults.filter(r => r.confidence >= 0.8).length,
        mediumConfidenceMappings: fileDetails.mappingResults.filter(r => r.confidence >= 0.6 && r.confidence < 0.8).length,
        totalRecords: fileDetails.mappingResults.reduce((sum, r) => sum + r.recordCount, 0),
        processingTimeMs: fileDetails.file.processingTimeMs || 0
      },

      // 📊 満たした標準KPI
      fulfillmentResults: fileDetails.mappingResults.map(result => ({
        csvKpiId: result.csvKpiId,
        standardKpiId: result.standardKpiId,
        standardKpiName: result.standardKpiName,
        addedValue: result.contributedValue,
        recordCount: result.recordCount,
        confidence: result.confidence,
        confidenceLabel: getConfidenceLabel(result.confidence)
      })),

      // 累積貢献度
      kpiContributions: fileDetails.kpiContributions.map(contrib => ({
        standardKpiName: contrib.standardKpiName,
        beforeValue: contrib.previousValue,
        afterValue: contrib.newValue,
        contribution: contrib.addedValue,
        unit: contrib.unit,
        contributionFormatted: `${contrib.previousValue}→${contrib.newValue} ${contrib.unit}`
      })),

      // その他の詳細情報
      analysisResults: fileDetails.analysisResults,
      complianceImpact: fileDetails.complianceImpact
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('ファイル詳細取得エラー:', error);
    
    return NextResponse.json(
      { 
        error: 'ファイル詳細の取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * 信頼度ラベルの取得
 * 添付仕様書：信頼度表示形式
 */
function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) {
    return `✅ 高信頼度 (${Math.round(confidence * 100)}%)`;
  } else if (confidence >= 0.6) {
    return `⚠️ 中信頼度 (${Math.round(confidence * 100)}%)`;
  } else {
    return `❌ 低信頼度 (${Math.round(confidence * 100)}%)`;
  }
} 