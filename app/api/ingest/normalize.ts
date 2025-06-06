import { prisma } from "@/lib/prisma";
import { convertUnit } from "@/lib/utils/unit";
import { embedText } from "@/lib/utils/embedding";
import { findNearestKpi, KpiSearchError } from "../rag/kpiRepo";

// CSVデータの型定義を改善
export interface CsvRow {
  id: string;
  header: string;
  value: number;
  unit: string;
  source?: string;
  timestamp?: Date;
}

// 正規化エラーの型定義
export class NormalizationError extends Error {
  constructor(message: string, public override cause?: unknown, public rowId?: string) {
    super(message);
    this.name = 'NormalizationError';
  }
}

// 正規化結果の型定義
export interface NormalizationResult {
  success: boolean;
  rowId: string;
  kpiId?: string;
  normalizedValue?: number;
  unit?: string;
  error?: string;
}

// バリデーション関数
function validateCsvRow(row: any): row is CsvRow {
  if (!row || typeof row !== 'object') {
    return false;
  }

  if (!row.id || typeof row.id !== 'string') {
    return false;
  }

  if (!row.header || typeof row.header !== 'string') {
    return false;
  }

  if (typeof row.value !== 'number' || isNaN(row.value)) {
    return false;
  }

  if (!row.unit || typeof row.unit !== 'string') {
    return false;
  }

  return true;
}

export async function normalize(row: any): Promise<NormalizationResult> {
  // 型安全性のためのバリデーション
  if (!validateCsvRow(row)) {
    const rowId = row?.id || 'unknown';
    console.log(`[Normalize] バリデーションエラー: ID=${rowId}`);
    return {
      success: false,
      rowId,
      error: "無効なCSVデータです"
    };
  }

  console.log(`[Normalize] 処理開始: ID=${row.id}, Header=${row.header}`);

  try {
    // 埋め込みベクトルの取得
    let vec: number[];
    try {
      const embeddingText = `${row.header} ${row.value} ${row.unit}`;
      vec = await embedText(embeddingText);
    } catch (error) {
      console.error(`[Normalize] 埋め込みベクトル取得エラー (ID: ${row.id}):`, error);
      throw new NormalizationError(
        "埋め込みベクトルの取得に失敗しました", 
        error, 
        row.id
      );
    }

    // 最適なKPIの検索
    let kpis;
    try {
      kpis = await findNearestKpi(vec, { limit: 1 });
    } catch (error) {
      if (error instanceof KpiSearchError) {
        console.error(`[Normalize] KPI検索エラー (ID: ${row.id}):`, error.message);
        throw new NormalizationError(
          "適切なKPIが見つかりませんでした", 
          error, 
          row.id
        );
      }
      throw error;
    }

    if (!kpis || kpis.length === 0) {
      throw new NormalizationError(
        "マッチするKPIが見つかりませんでした", 
        undefined, 
        row.id
      );
    }

    const kpi = kpis[0];
    
    // kpiの存在確認
    if (!kpi) {
      throw new NormalizationError(
        "取得されたKPIデータが無効です", 
        undefined, 
        row.id
      );
    }

    // 単位変換
    let baseValue: number;
    try {
      baseValue = convertUnit(row.value, row.unit, kpi.base_unit);
    } catch (error) {
      console.error(`[Normalize] 単位変換エラー (ID: ${row.id}):`, error);
      throw new NormalizationError(
        `単位変換に失敗しました: ${row.unit} -> ${kpi.base_unit}`, 
        error, 
        row.id
      );
    }

    // データベースへの保存
    try {
      await prisma.normalizedRecord.create({
        data: {
          dataRecordId: BigInt(row.id),
          kpiId: parseInt(kpi.id),
          normalizedValue: baseValue.toString(),
          originalValue: row.value.toString(),
        }
      });

      console.log(`[Normalize] 正規化完了: ID=${row.id}, KPI=${kpi.code}, Value=${baseValue}`);

      return {
        success: true,
        rowId: row.id,
        kpiId: kpi.id,
        normalizedValue: baseValue,
        unit: kpi.base_unit
      };

    } catch (error) {
      console.error(`[Normalize] データベース保存エラー (ID: ${row.id}):`, error);
      throw new NormalizationError(
        "データベースへの保存に失敗しました", 
        error, 
        row.id
      );
    }

  } catch (error) {
    if (error instanceof NormalizationError) {
      return {
        success: false,
        rowId: row.id,
        error: error.message
      };
    }

    console.error(`[Normalize] 予期しないエラー (ID: ${row.id}):`, error);
    return {
      success: false,
      rowId: row.id,
      error: '予期しないエラーが発生しました'
    };
  }
}

// バッチ正規化関数
export async function normalizeBatch(rows: CsvRow[]): Promise<NormalizationResult[]> {
  console.log(`[Normalize] バッチ処理開始: ${rows.length}件`);

  const results: NormalizationResult[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (const row of rows) {
    try {
      const result = await normalize(row);
      results.push(result);
      
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    } catch (error) {
      console.error(`[Normalize] バッチ処理エラー (ID: ${row.id}):`, error);
      results.push({
        success: false,
        rowId: row.id,
        error: '処理中にエラーが発生しました'
      });
      errorCount++;
    }
  }

  console.log(`[Normalize] バッチ処理完了: 成功=${successCount}, エラー=${errorCount}`);
  return results;
}