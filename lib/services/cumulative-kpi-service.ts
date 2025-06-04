import { prisma as db } from '../prisma';

export interface CumulativeUpdate {
  standardKpiId: string;
  addedValue: number;
  sourceFileId: number;
  recordCount: number;
  confidence: number;
  mappingDetails?: any;
}

export interface CumulativeKpiData {
  id: number;
  standardKpiId: string;
  standardKpiName: string;
  cumulativeValue: number;
  unit: string;
  lastUpdated: Date;
  recordCount: number;
  contributingFileIds: number[];
}

export interface StandardKpiMapping {
  csvKpiId: string;
  standardKpiId: string;
  confidence: number;
  reason: string;
}

/**
 * 累積KPI管理サービス
 * 添付された仕様書（12.2.4 累積データ管理の詳細仕様）に基づく実装
 */
export class CumulativeKpiService {
  /**
   * 累積KPIの更新（新しいCSVデータの追加）
   * 
   * @example
   * // 既存値: 300 t-CO2
   * // 新規データ: 50 t-CO2
   * // 結果: 350 t-CO2 (自動累積計算)
   */
  static async updateCumulative(updates: CumulativeUpdate[]): Promise<{
    updatedKpis: string[];
    totalContributions: number;
    results: {
      successful: string[];
      failed: Array<{ standardKpiId: string; error: string }>;
    };
  }> {
    const successful: string[] = [];
    const failed: Array<{ standardKpiId: string; error: string }> = [];
    let totalContributions = 0;

    try {
      // 🎯 1️⃣ 事前データ取得（トランザクション外）
      console.log('事前データ取得開始...');
      
      // 必要な標準KPI定義を一括取得
      const standardKpiIds = [...new Set(updates.map(u => u.standardKpiId))];
      const standardKpis = await db.standardKpiDefinition.findMany({
        where: { 
          id: { in: standardKpiIds },
          isActive: true 
        }
      });
      const standardKpiMap = new Map(standardKpis.map(kpi => [kpi.id, kpi]));

      // CSV履歴の存在確認（1回だけ）
      const historyIds = [...new Set(updates.map(u => u.sourceFileId))];
      const csvHistories = await db.csvFileHistory.findMany({
        where: { id: { in: historyIds } }
      });
      const csvHistoryMap = new Map(csvHistories.map(h => [h.id, h]));

      // 既存の累積KPIを一括取得
      const existingKpis = await db.cumulativeKpi.findMany({
        where: { standardKpiId: { in: standardKpiIds } }
      });
      const existingKpiMap = new Map(existingKpis.map(kpi => [kpi.standardKpiId, kpi]));

      console.log(`事前データ取得完了: 標準KPI=${standardKpis.length}, 履歴=${csvHistories.length}, 既存KPI=${existingKpis.length}`);

      // 🎯 2️⃣ バリデーション（トランザクション外）
      const validUpdates: Array<{
        update: CumulativeUpdate;
        standardKpi: any;
        csvHistory: any;
        existingKpi: any | null;
      }> = [];

      for (const update of updates) {
        try {
          const standardKpi = standardKpiMap.get(update.standardKpiId);
          if (!standardKpi) {
            failed.push({ 
              standardKpiId: update.standardKpiId, 
              error: `標準KPI定義が見つかりません: ${update.standardKpiId}` 
            });
            continue;
          }

          const csvHistory = csvHistoryMap.get(update.sourceFileId);
          if (!csvHistory) {
            failed.push({ 
              standardKpiId: update.standardKpiId, 
              error: `CSV履歴レコードが存在しません: historyId=${update.sourceFileId}` 
            });
            continue;
          }

          const existingKpi = existingKpiMap.get(update.standardKpiId);

          validUpdates.push({
            update,
            standardKpi,
            csvHistory,
            existingKpi
          });

        } catch (error) {
          failed.push({ 
            standardKpiId: update.standardKpiId, 
            error: `バリデーションエラー: ${error instanceof Error ? error.message : 'Unknown error'}` 
          });
        }
      }

      console.log(`バリデーション完了: 有効=${validUpdates.length}, 無効=${failed.length}`);

      // 🎯 3️⃣ 軽量トランザクション（データ更新のみ）
      if (validUpdates.length > 0) {
        await db.$transaction(async (tx: any) => {
          for (const { update, standardKpi, csvHistory, existingKpi } of validUpdates) {
            try {
              let cumulativeKpi = existingKpi;

              // 新規累積KPIの作成（必要な場合）
              if (!cumulativeKpi) {
                cumulativeKpi = await tx.cumulativeKpi.create({
                  data: {
                    standardKpiId: update.standardKpiId,
                    standardKpiName: standardKpi.name,
                    cumulativeValue: 0,
                    unit: standardKpi.preferredUnit,
                    recordCount: 0,
                    contributingFileIds: []
                  }
                });
              }

              // 累積値の計算と更新
              const newCumulativeValue = cumulativeKpi.cumulativeValue.toNumber() + update.addedValue;
              const newRecordCount = cumulativeKpi.recordCount + update.recordCount;
              const newContributingFileIds = [...cumulativeKpi.contributingFileIds, update.sourceFileId];

              await tx.cumulativeKpi.update({
                where: { id: cumulativeKpi.id },
                data: {
                  cumulativeValue: newCumulativeValue,
                  recordCount: newRecordCount,
                  contributingFileIds: newContributingFileIds,
                  lastUpdated: new Date()
                }
              });

              // 貢献度記録の作成
              await tx.kpiContribution.create({
                data: {
                  cumulativeKpiId: cumulativeKpi.id,
                  csvFileHistoryId: update.sourceFileId,
                  contributedValue: update.addedValue,
                  recordCount: update.recordCount,
                  confidence: update.confidence,
                  mappingDetails: update.mappingDetails
                }
              });

              successful.push(update.standardKpiId);
              totalContributions++;

            } catch (error) {
              failed.push({ 
                standardKpiId: update.standardKpiId, 
                error: `トランザクション内エラー: ${error instanceof Error ? error.message : 'Unknown error'}` 
              });
            }
          }
        }, { timeout: 30000 }); // 🎯 4️⃣ タイムアウト延長（保険）
      }

      console.log(`処理完了: 成功=${successful.length}, 失敗=${failed.length}, 貢献=${totalContributions}`);

      return { 
        updatedKpis: successful, 
        totalContributions,
        results: { successful, failed }
      };

    } catch (error) {
      console.error('累積KPI更新エラー:', error);
      throw new Error(`累積KPI更新に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 標準KPI一覧の取得
   * ダッシュボード表示用（添付仕様書 12.2.2 統合ダッシュボード画面）
   */
  static async getAllCumulativeKpis(): Promise<CumulativeKpiData[]> {
    const kpis = await db.cumulativeKpi.findMany({
      orderBy: { lastUpdated: 'desc' }
    });

    return kpis.map((kpi: any) => ({
      id: kpi.id,
      standardKpiId: kpi.standardKpiId,
      standardKpiName: kpi.standardKpiName,
      cumulativeValue: kpi.cumulativeValue.toNumber(),
      unit: kpi.unit,
      lastUpdated: kpi.lastUpdated,
      recordCount: kpi.recordCount,
      contributingFileIds: kpi.contributingFileIds
    }));
  }

  /**
   * 欠損KPIの取得
   * 仕様書の「欠損KPI表示（5%）」部分の実装
   */
  static async getMissingKpis(): Promise<string[]> {
    // すべての標準KPI定義を取得
    const allStandardKpis = await db.standardKpiDefinition.findMany({
      where: { isActive: true }
    });

    // 既存の累積KPIを取得
    const existingKpis = await db.cumulativeKpi.findMany({
      select: { standardKpiId: true }
    });

    const existingKpiIds = new Set(existingKpis.map((kpi: any) => kpi.standardKpiId));

    // 欠損KPIを特定
    const missingKpis = allStandardKpis
      .filter((standardKpi: any) => !existingKpiIds.has(standardKpi.id))
      .map((standardKpi: any) => standardKpi.name);

    return missingKpis;
  }

  /**
   * 特定ファイルの貢献度削除（ファイル削除時）
   */
  static async removeFileContribution(fileId: number): Promise<void> {
    await db.$transaction(async (tx: any) => {
      // ファイルの貢献度を取得
      const contributions = await tx.kpiContribution.findMany({
        where: { csvFileHistoryId: fileId },
        include: { cumulativeKpi: true }
      });

      for (const contribution of contributions) {
        const cumulativeKpi = contribution.cumulativeKpi;
        
        // 累積値から貢献分を減算
        const newCumulativeValue = cumulativeKpi.cumulativeValue.toNumber() - contribution.contributedValue.toNumber();
        const newRecordCount = cumulativeKpi.recordCount - contribution.recordCount;
        const newContributingFileIds = cumulativeKpi.contributingFileIds.filter((id: any) => id !== fileId);

        await tx.cumulativeKpi.update({
          where: { id: cumulativeKpi.id },
          data: {
            cumulativeValue: Math.max(0, newCumulativeValue), // 負の値を防ぐ
            recordCount: Math.max(0, newRecordCount),
            contributingFileIds: newContributingFileIds,
            lastUpdated: new Date()
          }
        });

        // 貢献度記録を削除
        await tx.kpiContribution.delete({
          where: { id: contribution.id }
        });
      }
    });
  }

  /**
   * KPI識別子の標準化マッピング
   * 自動マッピング機能（添付仕様書 12.2.3 完全自動化ワークフロー）
   */
  static async mapToStandardKpi(csvKpiId: string): Promise<StandardKpiMapping | null> {
    // 標準KPI定義から類似度を計算
    const standardKpis = await db.standardKpiDefinition.findMany({
      where: { isActive: true }
    });

    // 簡易的な文字列マッチング（実際にはEmbedding-based検索）
    for (const standardKpi of standardKpis) {
      // エイリアスとの完全一致チェック
      if (standardKpi.aliases.includes(csvKpiId.toUpperCase())) {
        return {
          csvKpiId,
          standardKpiId: standardKpi.id,
          confidence: 0.95,
          reason: 'エイリアス完全一致'
        };
      }

      // 名前との部分一致チェック
      if (standardKpi.name.includes(csvKpiId) || csvKpiId.includes(standardKpi.name)) {
        return {
          csvKpiId,
          standardKpiId: standardKpi.id,
          confidence: 0.8,
          reason: '名前部分一致'
        };
      }

      // ID部分一致チェック
      if (standardKpi.id.toLowerCase().includes(csvKpiId.toLowerCase()) || 
          csvKpiId.toLowerCase().includes(standardKpi.id.toLowerCase())) {
        return {
          csvKpiId,
          standardKpiId: standardKpi.id,
          confidence: 0.75,
          reason: 'ID部分一致'
        };
      }
    }

    return null; // マッピング候補が見つからない
  }

  /**
   * 累積KPIの統計情報取得
   * ダッシュボード表示用
   */
  static async getCumulativeStats(): Promise<{
    totalKpis: number;
    totalFiles: number;
    lastUpdated: Date | null;
    missingKpisCount: number;
  }> {
    const [totalKpis, missingKpis, lastKpi] = await Promise.all([
      db.cumulativeKpi.count(),
      this.getMissingKpis(),
      db.cumulativeKpi.findFirst({
        orderBy: { lastUpdated: 'desc' },
        select: { lastUpdated: true }
      })
    ]);

    // 貢献ファイル数をカウント
    const allKpis = await db.cumulativeKpi.findMany({
      select: { contributingFileIds: true }
    });
    
    const uniqueFileIds = new Set<number>();
    allKpis.forEach((kpi: any) => {
      kpi.contributingFileIds.forEach((fileId: any) => uniqueFileIds.add(fileId));
    });

    return {
      totalKpis,
      totalFiles: uniqueFileIds.size,
      lastUpdated: lastKpi?.lastUpdated || null,
      missingKpisCount: missingKpis.length
    };
  }
} 