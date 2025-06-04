import { prisma as db } from '../prisma';
import { AutoAccumulationService, type MappingResult } from './auto-accumulation-service';
import { CumulativeKpiService } from './cumulative-kpi-service';
import { CsvHistoryService } from './csv-history-service';

export interface ProcessingChainResult {
  success: boolean;
  uploadId: number;
  detectedKpis: number;
  processedRecords: number;
  updatedCumulativeKpis: string[];
  processingTimeMs: number;
  errors: string[];
}

/**
 * Phase 2: 完全自動化処理チェーン
 * アップロード完了トリガーで実行される統合処理
 */
export class AutoProcessingChain {
  
  /**
   * メイン自動処理フロー
   * 添付仕様書 12.2.3「完全自動化ワークフロー」の実装
   */
  static async executeAutoProcessing(uploadId: number): Promise<ProcessingChainResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    
    try {
      console.log(`自動処理チェーン開始: Upload ID ${uploadId}`);
      
      // 0. CSV履歴記録を作成（処理開始） - 最初に作成して存在を保証
      const step0Start = Date.now();
      const historyRecord = await CsvHistoryService.createProcessingRecord(uploadId, 'PROCESSING');
      console.log(`履歴記録作成完了: History ID=${historyRecord.id}, Upload ID=${uploadId} (${Date.now() - step0Start}ms)`);
      
      // 1. CSV解析・KPI検出（自動）
      const step1Start = Date.now();
      const analysisResult = await this.analyzeCSVData(uploadId);
      console.log(`KPI検出完了: ${analysisResult.detectedKpis}個のKPI (${Date.now() - step1Start}ms)`);
      
      // 2. 自動KPIマッピング（承認なし・自動）
      const step2Start = Date.now();
      const mappingResults = await this.performAutoMapping(analysisResult.kpiValues);
      console.log(`自動マッピング完了: ${mappingResults.length}個のマッピング (${Date.now() - step2Start}ms)`);
      
      // 3. 累積値計算・更新（自動）- 履歴レコードIDを使用
      const step3Start = Date.now();
      const accumulationResult = await AutoAccumulationService.processFileForAccumulation(
        historyRecord.id,  // uploadIdではなく、履歴レコードのIDを使用
        mappingResults
      );
      console.log(`累積更新完了: ${accumulationResult.updatedKpis.length}個のKPI更新 (${Date.now() - step3Start}ms)`);
      
      // 🎯 部分成功の詳細ログ
      if (accumulationResult.errorsCount > 0) {
        console.warn(`⚠️ 部分的な問題が発生: エラー=${accumulationResult.errorsCount}件, 重複=${accumulationResult.duplicatesFound}件`);
        // 完全失敗ではなく、成功分は処理を継続
      }
      
      // 4. 処理結果の永続化
      const step4Start = Date.now();
      await CsvHistoryService.updateProcessingResults(uploadId, {
        status: 'COMPLETED',
        detectedKpis: analysisResult.detectedKpis,
        processedRecords: accumulationResult.totalContributions,
        mappingResults: mappingResults,
        analysisResults: {
          uniqueKpiIds: analysisResult.uniqueKpiIds,
          processingChainResult: 'AUTO_PROCESSING_SUCCESS'
        },
        complianceImpact: {
          // 今後のPhase実装で詳細な影響分析を追加予定
          impactType: 'CUMULATIVE_UPDATE',
          affectedKpis: accumulationResult.updatedKpis
        },
        processingTimeMs: Date.now() - startTime
      });
      console.log(`処理結果永続化完了 (${Date.now() - step4Start}ms)`);
      
      const processingTimeMs = Date.now() - startTime;
      console.log(`🎉 自動処理チェーン完了: 総処理時間=${processingTimeMs}ms`);
      
      return {
        success: true,
        uploadId,
        detectedKpis: analysisResult.detectedKpis,
        processedRecords: accumulationResult.totalContributions,
        updatedCumulativeKpis: accumulationResult.updatedKpis,
        processingTimeMs,
        errors
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);
      console.error(`自動処理チェーンエラー: ${errorMessage}`);
      
      // エラー時の履歴更新
      await CsvHistoryService.updateProcessingResults(uploadId, {
        status: 'ERROR',
        errorDetails: errorMessage,
        detectedKpis: 0,
        processedRecords: 0,
        mappingResults: [],
        analysisResults: {
          processingChainResult: 'AUTO_PROCESSING_ERROR',
          errorMessage: errorMessage
        },
        complianceImpact: {
          impactType: 'ERROR',
          affectedKpis: []
        },
        processingTimeMs: Date.now() - startTime
      });
      
      return {
        success: false,
        uploadId,
        detectedKpis: 0,
        processedRecords: 0,
        updatedCumulativeKpis: [],
        processingTimeMs: Date.now() - startTime,
        errors
      };
    }
  }
  
  /**
   * 1. CSV解析・KPI検出
   */
  private static async analyzeCSVData(uploadId: number) {
    const kpiValues = await db.kPIValue.findMany({
      where: {
        dataRow: {
          uploadId: uploadId
        }
      },
      include: {
        dataRow: true
      }
    });
    
    // KPI識別子を抽出
    const uniqueKpiIds = [...new Set(kpiValues.map((kv: any) => kv.kpiId))];
    
    return {
      detectedKpis: uniqueKpiIds.length,
      kpiValues: kpiValues,
      uniqueKpiIds
    };
  }
  
  /**
   * 2. 自動KPIマッピング（承認なし）
   * Phase 2の重要機能：手動承認を除去した自動マッピング
   */
  private static async performAutoMapping(kpiValues: any[]): Promise<MappingResult[]> {
    const mappingResults: MappingResult[] = [];
    
    // KPI識別子ごとにグループ化
    const kpiGroups = this.groupByKpiId(kpiValues);
    
    for (const [csvKpiId, values] of Object.entries(kpiGroups)) {
      // 標準KPIマッピングを実行
      const standardMapping = await CumulativeKpiService.mapToStandardKpi(csvKpiId);
      
      if (standardMapping && standardMapping.confidence >= 0.6) { // 60%以上で自動承認
        const mappingResult: MappingResult = {
          csvKpiId,
          standardKpiId: standardMapping.standardKpiId,
          values: (values as any[]).map(v => ({
            value: v.value,
            unit: v.unit || '',
            period: v.period,
            dataRowId: v.dataRowId
          })),
          confidence: standardMapping.confidence,
          mappingDetails: {
            reason: standardMapping.reason,
            autoApproved: true,
            approvalTimestamp: new Date().toISOString()
          }
        };
        
        mappingResults.push(mappingResult);
        console.log(`自動承認: ${csvKpiId} → ${standardMapping.standardKpiId} (${Math.round(standardMapping.confidence * 100)}%)`);
      } else {
        console.warn(`マッピング信頼度不足: ${csvKpiId} (${standardMapping?.confidence ? Math.round(standardMapping.confidence * 100) : 0}%)`);
      }
    }
    
    return mappingResults;
  }
  
  /**
   * KPI値をKPI IDでグループ化
   */
  private static groupByKpiId(kpiValues: any[]): Record<string, any[]> {
    return kpiValues.reduce((groups: Record<string, any[]>, kpiValue) => {
      const kpiId = kpiValue.kpiId;
      if (!groups[kpiId]) {
        groups[kpiId] = [];
      }
      groups[kpiId].push(kpiValue);
      return groups;
    }, {});
  }
  
  /**
   * 処理統計の取得
   */
  static async getProcessingStatistics(): Promise<{
    totalProcessedFiles: number;
    averageProcessingTime: number;
    successRate: number;
    autoApprovalRate: number;
  }> {
    const histories = await db.csvFileHistory.findMany({
      select: {
        processingStatus: true,
        processingTimeMs: true,
        mappingResults: true
      }
    });
    
    const totalFiles = histories.length;
    const successfulFiles = histories.filter((h: any) => h.processingStatus === 'COMPLETED').length;
    const totalProcessingTime = histories.reduce((sum: number, h: any) => sum + (h.processingTimeMs || 0), 0);
    
    // 自動承認率の計算
    let totalMappings = 0;
    let autoApprovedMappings = 0;
    
    histories.forEach((h: any) => {
      if (h.mappingResults && Array.isArray(h.mappingResults)) {
        totalMappings += h.mappingResults.length;
        autoApprovedMappings += h.mappingResults.filter((m: any) => 
          m.mappingDetails?.autoApproved === true
        ).length;
      }
    });
    
    return {
      totalProcessedFiles: totalFiles,
      averageProcessingTime: totalFiles > 0 ? Math.round(totalProcessingTime / totalFiles) : 0,
      successRate: totalFiles > 0 ? Math.round((successfulFiles / totalFiles) * 100) / 100 : 0,
      autoApprovalRate: totalMappings > 0 ? Math.round((autoApprovedMappings / totalMappings) * 100) / 100 : 0
    };
  }
} 