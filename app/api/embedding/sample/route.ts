import { NextRequest, NextResponse } from 'next/server';
import { GeminiEmbeddingClient } from '@/lib/gemini-client';
import { SampleValueAnalyzer, type KPIGroupAnalysis } from '@/lib/sample-analyzer';
import { CSVAnalyzer, type KPIGroupData } from '@/lib/csv-analyzer';
import { prisma, VectorUtils } from '@/lib/prisma';

const geminiClient = new GeminiEmbeddingClient();

interface SampleEmbeddingRequest {
  dataRowId: number;
  columnName: string;
  sampleValues: string[];
}

// 新規追加: KPIグループ埋め込み用のリクエスト
interface KPIGroupEmbeddingRequest {
  kpiGroups: KPIGroupData[];
  includeAnalysis?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { columnName, sampleValues } = await request.json();
    
    if (!columnName) {
      return NextResponse.json(
        { error: 'columnName is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // 1. サンプル値の分析（型推定・統計計算）
    const analysis = SampleValueAnalyzer.analyzeSamples(sampleValues || []);
    
    // 2. 列名とサンプル値の文字列結合
    const sampleStr = sampleValues && sampleValues.length > 0 
      ? sampleValues.slice(0, 5).join(', ') 
      : 'no samples';
    
    // 3. Gemini用の検索テキスト作成
    const hybridText = SampleValueAnalyzer.createEmbeddingSummary(analysis, columnName);
    
    // 4. Gemini で埋め込み生成
    const embedding = await geminiClient.generateEmbedding(hybridText);

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      columnName,
      sampleValues,
      analysis,
      hybridText,
      embedding,
      dimensions: embedding.length, // Geminiは768次元
      processingTimeMs: processingTime,
      provider: 'gemini',
    });

  } catch (error) {
    console.error('Sample embedding generation failed:', error);
    
    if (error instanceof Error && error.message.includes('Gemini')) {
      return NextResponse.json(
        { error: 'Gemini API error', details: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate sample embedding' },
      { status: 500 }
    );
  }
}

// バッチ処理エンドポイント
export async function PUT(request: NextRequest) {
  try {
    const { columns, kpiGroups } = await request.json();
    
    // 従来の列ベース処理
    if (columns && Array.isArray(columns)) {
      return await handleColumnBatchProcessing(columns);
    }
    
    // 新規: KPIグループベース処理
    if (kpiGroups && Array.isArray(kpiGroups)) {
      return await handleKPIGroupBatchProcessing(kpiGroups);
    }
    
    return NextResponse.json(
      { error: 'columns配列またはkpiGroups配列が必要です' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Batch embedding failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate batch embeddings' },
      { status: 500 }
    );
  }
}

/**
 * 従来の列ベースバッチ処理
 */
async function handleColumnBatchProcessing(columns: any[]) {
  const startTime = Date.now();
  const results = [];

  // 列ごとにサンプル分析とハイブリッドテキスト生成
  const hybridTexts = columns.map(({ columnName, sampleValues }) => {
    const analysis = SampleValueAnalyzer.analyzeSamples(sampleValues || []);
    const hybridText = SampleValueAnalyzer.createEmbeddingSummary(analysis, columnName);
    return { columnName, analysis, hybridText };
  });

  // Gemini で一括埋め込み生成
  const embeddings = await geminiClient.generateBatchEmbeddings(hybridTexts.map(h => h.hybridText));

  // 結果をまとめる
  for (let i = 0; i < columns.length; i++) {
    results.push({
      columnName: columns[i].columnName,
      sampleValues: columns[i].sampleValues,
      analysis: hybridTexts[i].analysis,
      hybridText: hybridTexts[i].hybridText,
      embedding: embeddings[i],
    });
  }

  const processingTime = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    results,
    count: results.length,
    dimensions: embeddings[0]?.length || 768,
    processingTimeMs: processingTime,
    avgTimePerColumn: processingTime / columns.length,
    provider: 'gemini',
    processingType: 'column-based'
  });
}

/**
 * 新規: KPIグループベースバッチ処理
 */
async function handleKPIGroupBatchProcessing(kpiGroups: KPIGroupData[]) {
  const startTime = Date.now();
  const results = [];

  // 各KPIグループの埋め込みテキスト生成
  const embeddingTexts = kpiGroups.map(group => {
    const embeddingText = CSVAnalyzer.createKPIEmbeddingText(group);
    
    // 詳細分析も実行
    const values = group.records.map(r => r.value.toString());
    const units = group.records.map(r => r.unit);
    const periods = group.records.map(r => r.period);
    
    const groupAnalysis = SampleValueAnalyzer.analyzeKPIGroup(
      group.kpiIdentifier,
      values,
      units,
      periods
    );

    return { 
      group, 
      embeddingText, 
      groupAnalysis,
      enhancedText: `${embeddingText} Quality score: ${groupAnalysis.qualityScore}. Type: ${SampleValueAnalyzer.estimateKPIType(group.kpiIdentifier, group.records.map(r => r.value), group.commonUnit)}.`
    };
  });

  // Gemini で一括埋め込み生成
  const embeddings = await geminiClient.generateBatchEmbeddings(embeddingTexts.map(et => et.enhancedText));

  // 結果をまとめる
  for (let i = 0; i < kpiGroups.length; i++) {
    results.push({
      kpiIdentifier: kpiGroups[i].kpiIdentifier,
      aggregatedValue: kpiGroups[i].aggregatedValue,
      unit: kpiGroups[i].commonUnit,
      recordCount: kpiGroups[i].recordCount,
      embeddingText: embeddingTexts[i].embeddingText,
      enhancedText: embeddingTexts[i].enhancedText,
      groupAnalysis: embeddingTexts[i].groupAnalysis,
      embedding: embeddings[i],
      estimatedType: SampleValueAnalyzer.estimateKPIType(
        kpiGroups[i].kpiIdentifier, 
        kpiGroups[i].records.map(r => r.value), 
        kpiGroups[i].commonUnit
      )
    });
  }

  const processingTime = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    results,
    count: results.length,
    dimensions: embeddings[0]?.length || 768,
    processingTimeMs: processingTime,
    avgTimePerKPI: processingTime / kpiGroups.length,
    provider: 'gemini',
    processingType: 'kpi-group-based'
  });
}

// サンプル分析のみ（埋め込み生成なし）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const samplesParam = searchParams.get('samples');
    const columnName = searchParams.get('columnName') || 'unknown';
    const analysisType = searchParams.get('type') || 'sample'; // 'sample' | 'kpi-group'

    if (!samplesParam) {
      return NextResponse.json(
        { error: 'samples parameter is required' },
        { status: 400 }
      );
    }

    const sampleValues = samplesParam.split(',').map(s => s.trim());

    if (analysisType === 'kpi-group') {
      // KPIグループ分析モード
      const units = searchParams.get('units')?.split(',').map(s => s.trim()) || [];
      const periods = searchParams.get('periods')?.split(',').map(s => s.trim()) || [];
      
      const groupAnalysis = SampleValueAnalyzer.analyzeKPIGroup(
        columnName,
        sampleValues,
        units,
        periods
      );

      const estimatedType = SampleValueAnalyzer.estimateKPIType(
        columnName, 
        sampleValues.map(v => parseFloat(v)).filter(v => !isNaN(v)), 
        units[0] || ''
      );

      return NextResponse.json({
        success: true,
        kpiIdentifier: columnName,
        groupAnalysis,
        estimatedType,
        analysisType: 'kpi-group'
      });
    } else {
      // 従来のサンプル分析モード
      const analysis = SampleValueAnalyzer.analyzeSamples(sampleValues);
      const summary = SampleValueAnalyzer.createEmbeddingSummary(analysis, columnName);

      return NextResponse.json({
        success: true,
        columnName,
        analysis,
        summary,
        analysisType: 'sample'
      });
    }

  } catch (error) {
    console.error('Analysis failed:', error);
    return NextResponse.json(
      { error: 'Failed to analyze data' },
      { status: 500 }
    );
  }
} 