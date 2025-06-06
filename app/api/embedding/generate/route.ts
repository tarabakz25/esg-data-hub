import { NextRequest, NextResponse } from 'next/server';
import { OpenAIEmbeddingClient } from '@/lib/openai-client';
import { prisma, VectorUtils } from '@/lib/prisma';

const openaiClient = new OpenAIEmbeddingClient();

export async function POST(request: NextRequest) {
  try {
    const { columnNames } = await request.json();
    
    if (!columnNames || !Array.isArray(columnNames)) {
      return NextResponse.json(
        { error: 'columnNames array is required' },
        { status: 400 }
      );
    }

    if (columnNames.length === 0) {
      return NextResponse.json(
        { error: 'columnNames array cannot be empty' },
        { status: 400 }
      );
    }

    if (columnNames.length > 50) {
      return NextResponse.json(
        { error: 'columnNames array cannot exceed 50 items' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // OpenAI APIで埋め込み生成
    const embeddings = await openaiClient.generateBatchEmbeddings(columnNames);

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      embeddings,
      columnNames,
      count: embeddings.length,
      dimensions: embeddings[0]?.length || 1536, // OpenAI ada-002は1536次元
      processingTimeMs: processingTime,
      provider: 'openai', // プロバイダー識別用
    });

  } catch (error) {
    console.error('Embedding generation failed:', error);
    
    // OpenAI API エラーの場合は詳細を返す
    if (error instanceof Error && error.message.includes('OpenAI')) {
      return NextResponse.json(
        { error: 'OpenAI API error', details: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate embeddings' },
      { status: 500 }
    );
  }
}

// 既存の埋め込みを取得するGETエンドポイント
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataRowId = searchParams.get('dataRowId');

    if (!dataRowId) {
      return NextResponse.json(
        { error: 'dataRowId parameter is required' },
        { status: 400 }
      );
    }

    // 生のSQLクエリを使用してembeddingフィールドにアクセス
    const result = await prisma.$queryRaw<Array<{
      id: number;
      raw: any;
      embedding: string | null;
    }>>`
      SELECT id, raw, embedding::text as embedding
      FROM "DataRow"
      WHERE id = ${parseInt(dataRowId)}
    `;

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'DataRow not found' },
        { status: 404 }
      );
    }

    const dataRow = result[0];

    // dataRowが存在することを確認（result配列の長さは既に検証済み）
    if (!dataRow) {
      return NextResponse.json(
        { error: 'DataRow not found' },
        { status: 404 }
      );
    }

    // pgvectorからベクトルを取得
    let embedding = null;
    if (dataRow.embedding) {
      // PostgreSQLのvector型は文字列として返される
      embedding = VectorUtils.stringToVector(dataRow.embedding);
    }

    return NextResponse.json({
      embedding,
      hasEmbedding: !!dataRow.embedding,
    });

  } catch (error) {
    console.error('Failed to fetch embedding:', error);
    return NextResponse.json(
      { error: 'Failed to fetch embedding' },
      { status: 500 }
    );
  }
}

// 類似度検索エンドポイント
export async function PUT(request: NextRequest) {
  try {
    const { queryVector, limit = 10, threshold = 0.7, searchType = 'cosine' } = await request.json();

    if (!queryVector || !Array.isArray(queryVector)) {
      return NextResponse.json(
        { error: 'queryVector must be an array' },
        { status: 400 }
      );
    }

    let results;
    switch (searchType) {
      case 'cosine':
        results = await VectorUtils.findSimilarEmbeddings(queryVector, limit, threshold);
        break;
      case 'l2':
        results = await VectorUtils.findNearestEmbeddings(queryVector, limit);
        break;
      case 'inner_product':
        results = await VectorUtils.findByInnerProduct(queryVector, limit);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid searchType. Use: cosine, l2, or inner_product' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      results,
      searchType,
      queryVector,
      limit,
      threshold: searchType === 'cosine' ? threshold : undefined,
    });

  } catch (error) {
    console.error('Vector search failed:', error);
    return NextResponse.json(
      { error: 'Failed to perform vector search' },
      { status: 500 }
    );
  }
} 