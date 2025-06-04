import { NextRequest, NextResponse } from 'next/server';
import { KPIEmbeddingManager } from '@/lib/kpi-embedding-manager';

const kpiManager = new KPIEmbeddingManager();

// 列名とサンプル値からKPIマッピングを提案
export async function POST(request: NextRequest) {
  try {
    const { columnName, sampleValues, limit = 3, threshold = 0.5 } = await request.json();
    
    if (!columnName) {
      return NextResponse.json(
        { error: 'columnName is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // KPIマッピングの提案
    const mapping = await kpiManager.suggestKPIMapping(
      columnName, 
      sampleValues, 
      limit
    );

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      mapping,
      processingTimeMs: processingTime,
      dictionaryStats: kpiManager.getDictionaryStats(),
      provider: 'openrouter', // プロバイダー識別用
    });

  } catch (error) {
    console.error('KPI similarity search failed:', error);
    
    if (error instanceof Error && error.message.includes('OpenRouter')) {
      return NextResponse.json(
        { error: 'OpenRouter API error', details: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to perform KPI similarity search' },
      { status: 500 }
    );
  }
}

// ハイブリッド検索（テキスト + ベクトル）
export async function PUT(request: NextRequest) {
  try {
    const { 
      query, 
      vectorWeight = 0.7, 
      textWeight = 0.3 
    } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'query is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const results = await kpiManager.hybridKPISearch(
      query, 
      vectorWeight, 
      textWeight
    );

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      query,
      results,
      processingTimeMs: processingTime,
      searchParams: {
        vectorWeight,
        textWeight,
      },
    });

  } catch (error) {
    console.error('Hybrid KPI search failed:', error);
    return NextResponse.json(
      { error: 'Failed to perform hybrid KPI search' },
      { status: 500 }
    );
  }
}

// KPI辞書の統計情報とカテゴリ分布
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'generate-embeddings') {
      // KPI埋め込みの強制再生成
      const startTime = Date.now();
      const embeddings = await kpiManager.generateAllKPIEmbeddings();
      const processingTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        embeddings: embeddings.length,
        processingTimeMs: processingTime,
        message: 'KPI embeddings generated successfully',
      });
    }

    // デフォルト：統計情報取得
    const stats = kpiManager.getDictionaryStats();
    const categoryDistribution = kpiManager.getCategoryDistribution();

    return NextResponse.json({
      success: true,
      stats,
      categoryDistribution,
    });

  } catch (error) {
    console.error('Failed to get KPI stats:', error);
    return NextResponse.json(
      { error: 'Failed to get KPI statistics' },
      { status: 500 }
    );
  }
} 