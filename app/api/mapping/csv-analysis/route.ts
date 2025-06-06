import { NextRequest, NextResponse } from 'next/server';
import { CSVAnalyzer, type KPIGroupData, type CSVAnalysisResult } from '@/lib/csv-analyzer';
import { OpenAIEmbeddingClient } from '@/lib/openai-client';
import { KPIEmbeddingManager } from '@/lib/kpi-embedding-manager';

const openaiClient = new OpenAIEmbeddingClient();

interface CSVMappingRequest {
  csvData: any[];
  kpiColumn: string;
  valueColumn: string;
  unitColumn: string;
  periodColumn?: string;
  dataRowIdColumn?: string;
}

interface MappingResult {
  kpiIdentifier: string;
  aggregatedValue: number;
  unit: string;
  recordCount: number;
  suggestedKPI: {
    id: string;
    name: string;
    category: string;
    unit: string;
  } | null;
  confidence: number;
  alternativeSuggestions: Array<{
    kpi: any;
    confidence: number;
  }>;
  originalConfidence?: number;
  confidenceBoosts?: {
    unitMatch: number;
    dataQuality: number;
    sampleSize: number;
    valueRange: number;
  };
}

interface CSVMappingResponse {
  success: boolean;
  groupedMappings: MappingResult[];
  dataQuality: CSVAnalysisResult['dataQuality'];
  analysisResult: CSVAnalysisResult;
  processingTimeMs: number;
  provider: string;
}

export async function POST(request: NextRequest) {
  try {
    const { csvData, kpiColumn, valueColumn, unitColumn, periodColumn, dataRowIdColumn } = 
      await request.json() as CSVMappingRequest;

    // 入力検証
    if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
      return NextResponse.json(
        { error: 'csvData配列は必須で、空でない配列である必要があります' },
        { status: 400 }
      );
    }

    if (!kpiColumn || !valueColumn || !unitColumn) {
      return NextResponse.json(
        { error: 'kpiColumn、valueColumn、unitColumnは必須項目です' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // 1. CSV分析とグループ化
    const analysisResult = CSVAnalyzer.analyzeCSV(csvData, {
      kpiColumn,
      valueColumn,
      unitColumn,
      periodColumn: periodColumn || '',
      dataRowIdColumn: dataRowIdColumn || ''
    });

    if (analysisResult.groupedKPIs.length === 0) {
      return NextResponse.json({
        success: true,
        groupedMappings: [],
        dataQuality: analysisResult.dataQuality,
        analysisResult,
        processingTimeMs: Date.now() - startTime,
        provider: 'gemini',
        message: '有効なKPIグループが見つかりませんでした'
      });
    }

    // 2. 各グループに対してマッピング実行
    const mappingResults: MappingResult[] = [];
    
    for (const group of analysisResult.groupedKPIs) {
      try {
        const mapping = await performKPIMapping(group);
        mappingResults.push(mapping);
      } catch (error) {
        console.error(`Mapping failed for KPI ${group.kpiIdentifier}:`, error);
        // エラーが発生したグループも結果に含める（信頼度0で）
        mappingResults.push({
          kpiIdentifier: group.kpiIdentifier,
          aggregatedValue: group.aggregatedValue,
          unit: group.commonUnit,
          recordCount: group.recordCount,
          suggestedKPI: null,
          confidence: 0,
          alternativeSuggestions: [],
          originalConfidence: 0,
          confidenceBoosts: {
            unitMatch: 0,
            dataQuality: 0,
            sampleSize: 0,
            valueRange: 0
          }
        });
      }
    }

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      groupedMappings: mappingResults,
      dataQuality: analysisResult.dataQuality,
      analysisResult,
      processingTimeMs: processingTime,
      provider: 'gemini'
    });

  } catch (error) {
    console.error('CSV mapping analysis failed:', error);
    
    if (error instanceof Error && error.message.includes('Gemini')) {
      return NextResponse.json(
        { error: 'Gemini API エラー', details: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'CSVマッピング分析に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * 個別のKPIグループに対してマッピングを実行
 */
async function performKPIMapping(group: KPIGroupData): Promise<MappingResult> {
  // 新しいKPIEmbeddingManagerのsuggestKPIGroupMappingメソッドを使用
  const kpiManager = new KPIEmbeddingManager();
  const groupMapping = await kpiManager.suggestKPIGroupMapping(group, 3, 0.5);
  
  // MappingResult形式に変換
  return {
    kpiIdentifier: group.kpiIdentifier,
    aggregatedValue: group.aggregatedValue,
    unit: group.commonUnit,
    recordCount: group.recordCount,
    suggestedKPI: groupMapping.bestMatch ? {
      id: groupMapping.bestMatch.kpi.id,
      name: groupMapping.bestMatch.kpi.name,
      category: groupMapping.bestMatch.kpi.category,
      unit: groupMapping.bestMatch.kpi.unit || ''
    } : null,
    confidence: groupMapping.adjustedConfidence,
    alternativeSuggestions: groupMapping.topMatches.slice(1).map(match => ({
      kpi: {
        id: match.kpi.id,
        name: match.kpi.name,
        category: match.kpi.category,
        unit: match.kpi.unit || ''
      },
      confidence: match.similarity
    })),
    // 追加情報を含める
    originalConfidence: groupMapping.originalConfidence,
    confidenceBoosts: groupMapping.confidenceBoosts
  };
}

// 分析結果のみを返すGETエンドポイント（マッピング無し）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const csvDataParam = searchParams.get('csvData');
    const kpiColumn = searchParams.get('kpiColumn') || 'kpiId';
    const valueColumn = searchParams.get('valueColumn') || 'value';
    const unitColumn = searchParams.get('unitColumn') || 'unit';

    if (!csvDataParam) {
      return NextResponse.json(
        { error: 'csvDataパラメータが必要です' },
        { status: 400 }
      );
    }

    let csvData;
    try {
      csvData = JSON.parse(csvDataParam);
    } catch (error) {
      return NextResponse.json(
        { error: 'csvDataは有効なJSON形式である必要があります' },
        { status: 400 }
      );
    }

    const analysisResult = CSVAnalyzer.analyzeCSV(csvData, {
      kpiColumn,
      valueColumn,
      unitColumn
    });

    return NextResponse.json({
      success: true,
      analysisResult,
      groupedKPIs: analysisResult.groupedKPIs,
      dataQuality: analysisResult.dataQuality
    });

  } catch (error) {
    console.error('CSV analysis failed:', error);
    return NextResponse.json(
      { error: 'CSV分析に失敗しました' },
      { status: 500 }
    );
  }
} 