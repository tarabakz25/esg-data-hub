import prisma from "@/lib/utils/db";

// KPI型の定義を拡張
export interface Kpi {
  id: string;
  code: string;
  base_unit: string;
  name?: string;
  description?: string;
}

// エラー型の定義
export class KpiSearchError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'KpiSearchError';
  }
}

// 検索オプションの型定義
export interface KpiSearchOptions {
  limit?: number;
  threshold?: number;
}

export async function findNearestKpi(
  vec: number[], 
  options: KpiSearchOptions = {}
): Promise<Kpi[]> {
  // バリデーション
  if (!vec || vec.length === 0) {
    throw new KpiSearchError("ベクトルが空です");
  }

  if (vec.some(v => typeof v !== 'number' || isNaN(v))) {
    throw new KpiSearchError("ベクトルに無効な値が含まれています");
  }

  const { limit = 3, threshold } = options;

  try {
    // SQL インジェクション対策のため、ベクトル値をサニタイズ
    const sanitizedVec = vec.map(v => Number(v).toFixed(6));
    
    const result = await prisma.$queryRaw<Kpi[]>`
      SELECT id, code, base_unit, name, description
      FROM "KPI"
      ORDER BY embedding <-> cube(array[${sanitizedVec.join(",")}]) 
      LIMIT ${limit}
    `;

    if (!result || result.length === 0) {
      console.warn('[KpiRepo] 検索結果が見つかりませんでした');
      return [];
    }

    console.log(`[KpiRepo] ${result.length}件のKPIが見つかりました`);
    return result;

  } catch (error) {
    console.error('[KpiRepo] KPI検索エラー:', error);
    throw new KpiSearchError(
      "KPI検索中にエラーが発生しました", 
      error
    );
  }
}

// KPIをIDで取得する関数
export async function findKpiById(id: string): Promise<Kpi | null> {
  if (!id || typeof id !== 'string') {
    throw new KpiSearchError("有効なIDが必要です");
  }

  try {
    const kpi = await prisma.kPI.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        code: true,
        baseUnit: true,
        displayName: true,
      }
    });

    if (!kpi) {
      return null;
    }

    // Prismaのレスポンスを統一されたKpi型に変換
    return {
      id: kpi.id.toString(),
      code: kpi.code,
      base_unit: kpi.baseUnit,
      name: kpi.displayName,
    };
  } catch (error) {
    console.error('[KpiRepo] KPI取得エラー:', error);
    throw new KpiSearchError("KPI取得中にエラーが発生しました", error);
  }
}