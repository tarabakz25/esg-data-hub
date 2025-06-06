import { NextResponse } from 'next/server';
import { embedText as getEmbedding } from "@/lib/utils/embedding";
import prisma from "@/lib/utils/db";
import { findNearestKpi, KpiSearchError, type Kpi } from "./kpiRepo";

// 型定義の改善
interface KPI extends Kpi {
  id: string;
  code: string;
  base_unit: string;
  name?: string;
  description?: string;
}

// Prismaから取得される実際のNormalizedRecord型
interface PrismaNormalizedRecord {
  id: bigint;
  dataRecordId: bigint;
  kpiId: number;
  normalizedValue: string;
  originalValue: string;
  createdAt: Date;
  dataRecord: {
    reportDate: Date;
    source: {
      name: string;
    };
  };
}

// リクエストボディの型定義
interface RAGRequest {
  query: string;
  limit?: number;
  includeMetadata?: boolean;
}

// レスポンスの型定義
interface RAGResponse {
  query: string;
  results: Array<{
    kpi: {
      id: string;
      code: string;
      baseUnit: string;
      name?: string;
      description?: string;
    };
    records: Array<{
      id: string;
      value: number;
      unit: string;
      source: string;
      date: Date;
      createdAt?: Date;
    }>;
    metadata?: {
      recordCount: number;
      relevanceScore?: number;
    };
  }>;
  metadata: {
    totalResults: number;
    executionTime: number;
    timestamp: string;
  };
}

// バリデーション関数
function validateRAGRequest(body: any): body is RAGRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }
  
  if (!body.query || typeof body.query !== 'string' || body.query.trim().length === 0) {
    return false;
  }

  if (body.limit && (typeof body.limit !== 'number' || body.limit < 1 || body.limit > 50)) {
    return false;
  }

  return true;
}

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    // リクエストボディの解析
    let body: any;
    try {
      body = await request.json();
    } catch (error) {
      console.error('[RAG API] JSON解析エラー:', error);
      return NextResponse.json(
        { 
          error: '無効なJSONフォーマットです',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

    // バリデーション
    if (!validateRAGRequest(body)) {
      return NextResponse.json(
        { 
          error: 'クエリパラメータが必要です。クエリは1文字以上50文字以下の文字列である必要があります。',
          code: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }

    const { query, limit = 5, includeMetadata = false } = body as RAGRequest;

    console.log(`[RAG API] クエリ処理開始: "${query}"`);

    // クエリの埋め込みベクトルを取得
    let queryEmbedding: number[];
    try {
      queryEmbedding = await getEmbedding(query);
    } catch (error) {
      console.error('[RAG API] 埋め込みベクトル取得エラー:', error);
      return NextResponse.json(
        { 
          error: 'クエリの処理中にエラーが発生しました',
          code: 'EMBEDDING_ERROR'
        },
        { status: 500 }
      );
    }

    // 最も関連性の高いKPIを検索
    let relevantKpis: KPI[];
    try {
      relevantKpis = await findNearestKpi(queryEmbedding, { limit: 3 });
    } catch (error) {
      if (error instanceof KpiSearchError) {
        console.error('[RAG API] KPI検索エラー:', error.message);
        return NextResponse.json(
          { 
            error: 'KPI検索中にエラーが発生しました',
            code: 'KPI_SEARCH_ERROR'
          },
          { status: 500 }
        );
      }
      throw error;
    }

    if (!relevantKpis || relevantKpis.length === 0) {
      console.warn('[RAG API] 関連するKPIが見つかりませんでした');
      return NextResponse.json({
        query,
        results: [],
        metadata: {
          totalResults: 0,
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      } as RAGResponse);
    }

    // 関連するデータレコードを取得
    const results = await Promise.all(
      relevantKpis.map(async (kpi: KPI) => {
        try {
          const normalizedRecords = await prisma.normalizedRecord.findMany({
            where: {
              kpiId: parseInt(kpi.id)
            },
            take: limit,
            orderBy: {
              createdAt: 'desc'
            }
          });

          const records = normalizedRecords.map((record) => ({
            id: record.id.toString(),
            value: parseFloat(record.normalizedValue),
            unit: kpi.base_unit,
            source: 'データソース',
            date: record.createdAt,
            ...(includeMetadata && { createdAt: record.createdAt })
          }));

          return {
            kpi: {
              id: kpi.id,
              code: kpi.code,
              baseUnit: kpi.base_unit,
              name: kpi.name,
              description: kpi.description
            },
            records,
            ...(includeMetadata && {
              metadata: {
                recordCount: records.length,
              }
            })
          };
        } catch (error) {
          console.error(`[RAG API] KPI ${kpi.id} のデータ取得エラー:`, error);
          return {
            kpi: {
              id: kpi.id,
              code: kpi.code,
              baseUnit: kpi.base_unit,
              name: kpi.name,
              description: kpi.description
            },
            records: [],
            ...(includeMetadata && {
              metadata: {
                recordCount: 0,
                error: 'データ取得に失敗しました'
              }
            })
          };
        }
      })
    );

    const executionTime = Date.now() - startTime;
    console.log(`[RAG API] 処理完了: ${executionTime}ms, 結果数: ${results.length}`);

    const response: RAGResponse = {
      query,
      results,
      metadata: {
        totalResults: results.length,
        executionTime,
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[RAG API] 予期しないエラー:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        code: 'INTERNAL_ERROR',
        metadata: {
          executionTime,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

// GET メソッドのサポート（ヘルスチェック）
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'RAG API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}
