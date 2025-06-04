import { prisma as db } from '../prisma';
import { CumulativeKpiService, type CumulativeUpdate } from './cumulative-kpi-service';

export interface MappingResult {
  csvKpiId: string;
  standardKpiId: string;
  values: Array<{
    value: number;
    unit: string;
    period: Date;
    dataRowId: number;
  }>;
  confidence: number;
  mappingDetails: any;
}

export interface ProcessingResults {
  updatedKpis: string[];
  totalContributions: number;
  processingTimeMs: number;
  duplicatesFound: number;
  errorsCount: number;
}

/**
 * 自動累積計算サービス
 * 添付された仕様書（12.2.3 完全自動化ワークフロー）に基づく実装
 */
export class AutoAccumulationService {
  /**
   * CSVファイル処理完了時の自動累積更新
   * 
   * 添付仕様書の完全自動プロセス:
   * 1. ファイル解析（自動）
   * 2. KPIマッピング（承認なし・自動）
   * 3. 累積値計算・更新（自動）
   * 4. コンプライアンスチェック（自動）
   * 5. ダッシュボード更新（自動）
   */
  static async processFileForAccumulation(
    historyRecordId: number,
    mappingResults: MappingResult[]
  ): Promise<ProcessingResults> {
    const startTime = Date.now();
    let duplicatesFound = 0;
    let errorsCount = 0;

    try {
      // 累積更新データを準備
      const cumulativeUpdates: CumulativeUpdate[] = [];

      for (const mapping of mappingResults) {
        try {
          // 値の集計
          let totalValue = 0;
          let recordCount = 0;
          const commonUnit = mapping.values[0]?.unit || '';

          // 重複チェックを行いながら値を集計
          for (const valueData of mapping.values) {
            const isDuplicate = await this.checkDuplicateValues(
              mapping.standardKpiId,
              valueData.period,
              valueData.value
            );

            if (isDuplicate) {
              duplicatesFound++;
              console.warn(`重複値を検出: ${mapping.standardKpiId}, ${valueData.period}, ${valueData.value}`);
              continue; // 重複値はスキップ
            }

            totalValue += valueData.value;
            recordCount++;
          }

          if (recordCount > 0) {
            cumulativeUpdates.push({
              standardKpiId: mapping.standardKpiId,
              addedValue: totalValue,
              sourceFileId: historyRecordId,
              recordCount,
              confidence: mapping.confidence,
              mappingDetails: {
                csvKpiId: mapping.csvKpiId,
                commonUnit,
                originalRecords: mapping.values.length,
                processedRecords: recordCount,
                ...mapping.mappingDetails
              }
            });
          }

        } catch (error) {
          errorsCount++;
          console.error(`マッピング処理エラー: ${mapping.csvKpiId}`, error);
        }
      }

      // 累積KPIを一括更新
      const updateResult = await CumulativeKpiService.updateCumulative(cumulativeUpdates);
      
      const processingTimeMs = Date.now() - startTime;

      // 🎯 部分成功の処理
      if (updateResult.results.failed.length > 0) {
        console.warn(`部分的な失敗: ${updateResult.results.failed.length}件のKPIで問題が発生`);
        updateResult.results.failed.forEach(failure => {
          console.warn(`- ${failure.standardKpiId}: ${failure.error}`);
          errorsCount++;
        });
      }

      console.log(`累積更新結果: 成功=${updateResult.results.successful.length}, 失敗=${updateResult.results.failed.length}, 貢献=${updateResult.totalContributions}`);

      return {
        updatedKpis: updateResult.updatedKpis,
        totalContributions: updateResult.totalContributions,
        processingTimeMs,
        duplicatesFound,
        errorsCount
      };

    } catch (error) {
      console.error('自動累積処理エラー:', error);
      throw new Error(`自動累積処理に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * KPI値の重複チェック・防止
   * 
   * 同一KPI、同一期間、同一値の重複を検出
   * データ整合性を保つために重要な機能
   */
  static async checkDuplicateValues(
    standardKpiId: string,
    period: Date,
    value: number
  ): Promise<boolean> {
    try {
      // 既存のKPIValueテーブルから重複チェック
      const existingValue = await db.kPIValue.findFirst({
        where: {
          kpi: {
            // 標準KPIとの関連を確認（暫定的に名前マッチング）
            name: {
              contains: standardKpiId.replace('_', ' ')
            }
          },
          period,
          value
        }
      });

      if (existingValue) {
        return true; // 重複発見
      }

      // CumulativeKpiの貢献履歴からも確認
      const cumulativeKpi = await db.cumulativeKpi.findUnique({
        where: { standardKpiId },
        include: {
          contributions: {
            where: {
              // 同じ期間・値での貢献がないかチェック
              mappingDetails: {
                path: ['period'],
                equals: period.toISOString()
              }
            }
          }
        }
      });

      if (cumulativeKpi?.contributions.some((contrib: any) => 
        contrib.contributedValue.toNumber() === value)) {
        return true; // 累積履歴に重複発見
      }

      return false; // 重複なし

    } catch (error) {
      console.error('重複チェックエラー:', error);
      return false; // エラー時は重複なしとして処理を継続
    }
  }

  /**
   * ファイル処理の進捗状況更新
   */
  static async updateProcessingProgress(
    historyRecordId: number,
    status: 'PROCESSING' | 'COMPLETED' | 'ERROR',
    details?: {
      detectedKpis?: number;
      processedRecords?: number;
      processingTimeMs?: number;
      errorDetails?: string;
    }
  ): Promise<void> {
    try {
      const updateData: any = {
        processingStatus: status
      };

      if (details) {
        if (details.detectedKpis !== undefined) {
          updateData.detectedKpis = details.detectedKpis;
        }
        if (details.processedRecords !== undefined) {
          updateData.processedRecords = details.processedRecords;
        }
        if (details.processingTimeMs !== undefined) {
          updateData.processingTimeMs = details.processingTimeMs;
        }
        if (details.errorDetails) {
          updateData.errorDetails = details.errorDetails;
        }
      }

      await db.csvFileHistory.update({
        where: { id: historyRecordId },
        data: updateData
      });

    } catch (error) {
      console.error('進捗更新エラー:', error);
      // 進捗更新の失敗は処理全体を止めない
    }
  }

  /**
   * データ品質チェック
   * 累積計算前に実行する検証
   */
  static async validateDataQuality(mappingResults: MappingResult[]): Promise<{
    isValid: boolean;
    warnings: string[];
    errors: string[];
  }> {
    const warnings: string[] = [];
    const errors: string[] = [];

    for (const mapping of mappingResults) {
      // 信頼度チェック
      if (mapping.confidence < 0.6) {
        warnings.push(`低信頼度マッピング: ${mapping.csvKpiId} -> ${mapping.standardKpiId} (${Math.round(mapping.confidence * 100)}%)`);
      }

      // 値の妥当性チェック
      for (const valueData of mapping.values) {
        if (valueData.value < 0) {
          warnings.push(`負の値: ${mapping.csvKpiId} = ${valueData.value}`);
        }

        if (valueData.value > 1e9) {
          warnings.push(`異常に大きな値: ${mapping.csvKpiId} = ${valueData.value}`);
        }

        if (!valueData.unit) {
          warnings.push(`単位未設定: ${mapping.csvKpiId}`);
        }
      }

      // 必須フィールドチェック
      if (!mapping.standardKpiId) {
        errors.push(`標準KPI IDが未設定: ${mapping.csvKpiId}`);
      }

      if (mapping.values.length === 0) {
        errors.push(`値が空: ${mapping.csvKpiId}`);
      }
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }

  /**
   * 統計情報の取得
   * 処理効率の監視用
   */
  static async getProcessingStats(): Promise<{
    totalProcessedFiles: number;
    averageProcessingTime: number;
    successRate: number;
    duplicateRate: number;
  }> {
    const histories = await db.csvFileHistory.findMany({
      select: {
        processingStatus: true,
        processingTimeMs: true,
        detectedKpis: true,
        processedRecords: true
      }
    });

    const totalFiles = histories.length;
    const completedFiles = histories.filter((h: any) => h.processingStatus === 'COMPLETED').length;
    const totalProcessingTime = histories.reduce((sum: number, h: any) => sum + (h.processingTimeMs || 0), 0);
    const averageProcessingTime = totalFiles > 0 ? totalProcessingTime / totalFiles : 0;
    const successRate = totalFiles > 0 ? completedFiles / totalFiles : 0;

    // 重複率の計算（簡易版）
    const totalDetected = histories.reduce((sum: number, h: any) => sum + (h.detectedKpis || 0), 0);
    const totalProcessed = histories.reduce((sum: number, h: any) => sum + (h.processedRecords || 0), 0);
    const duplicateRate = totalDetected > 0 ? 1 - (totalProcessed / totalDetected) : 0;

    return {
      totalProcessedFiles: totalFiles,
      averageProcessingTime: Math.round(averageProcessingTime),
      successRate: Math.round(successRate * 100) / 100,
      duplicateRate: Math.round(duplicateRate * 100) / 100
    };
  }
} 