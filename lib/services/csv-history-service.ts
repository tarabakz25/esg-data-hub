import { prisma } from '@/lib/prisma';

export interface ProcessingResults {
  mappingResults: any;
  analysisResults: any;
  complianceImpact: any;
  detectedKpis: number;
  processedRecords: number;
  processingTimeMs: number;
  errorDetails?: string;
}

export interface FileHistoryItem {
  id: number;
  uploadId: number;
  filename: string;
  uploadedAt: Date;
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  detectedKpis: number;
  processedRecords: number;
  processingTimeMs?: number;
}

export interface FileDetailsResponse {
  file: {
    id: number;
    uploadId: number;
    filename: string;
    uploadedAt: Date;
    processingTimeMs: number | null;
    processingStatus: string;
    errorDetails?: string;
  };
  mappingResults: Array<{
    csvKpiId: string;
    standardKpiId: string;
    standardKpiName: string;
    confidence: number;
    contributedValue: number;
    recordCount: number;
  }>;
  kpiContributions: Array<{
    standardKpiId: string;
    standardKpiName: string;
    previousValue: number;
    addedValue: number;
    newValue: number;
    unit: string;
    contributionPercentage: number;
    recordCount: number;
  }>;
  analysisResults?: any;
  complianceImpact?: any;
}

/**
 * CSV履歴管理サービス
 * 添付された仕様書（12.2.5 CSVファイル履歴・詳細機能）に基づく実装
 */
export class CsvHistoryService {
  /**
   * ファイル処理開始時の履歴記録作成
   * 
   * アップロード直後に呼び出され、履歴管理を開始
   */
  static async createProcessingRecord(
    uploadId: number,
    processingStatus: 'PENDING' | 'PROCESSING' = 'PENDING'
  ): Promise<{
    id: number;
    uploadId: number;
    filename: string;
    uploadedAt: Date;
    processingStatus: 'PENDING' | 'PROCESSING';
  }> {
    try {
      // アップロード情報からファイル名を取得
      const upload = await prisma.upload.findUnique({
        where: { id: uploadId },
        select: { filename: true }
      });

      if (!upload) {
        throw new Error(`アップロード情報が見つかりません: Upload ID ${uploadId}`);
      }

      const history = await prisma.csvFileHistory.create({
        data: {
          uploadId,
          filename: upload.filename,
          uploadedAt: new Date(),
          processingStatus,
          detectedKpis: 0,
          processedRecords: 0
        }
      });

      return {
        id: history.id,
        uploadId: history.uploadId,
        filename: history.filename,
        uploadedAt: history.uploadedAt,
        processingStatus: history.processingStatus as 'PENDING' | 'PROCESSING'
      };

    } catch (error) {
      console.error('履歴記録作成エラー:', error);
      throw new Error(`履歴記録の作成に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 処理完了時の詳細情報更新
   * 
   * マッピング結果、分析結果、コンプライアンス影響等を記録
   */
  static async updateProcessingResults(
    uploadId: number,
    results: ProcessingResults & {
      status?: 'COMPLETED' | 'ERROR' | 'PROCESSING';
      errorDetails?: string;
    }
  ): Promise<void> {
    try {
      await prisma.csvFileHistory.updateMany({
        where: { uploadId: uploadId },
        data: {
          processingStatus: results.status || (results.errorDetails ? 'ERROR' : 'COMPLETED'),
          mappingResults: results.mappingResults,
          analysisResults: results.analysisResults,
          complianceImpact: results.complianceImpact,
          detectedKpis: results.detectedKpis,
          processedRecords: results.processedRecords,
          processingTimeMs: results.processingTimeMs,
          errorDetails: results.errorDetails
        }
      });

      console.log(`履歴更新完了: Upload ID=${uploadId}, Status=${results.status || (results.errorDetails ? 'ERROR' : 'COMPLETED')}`);

    } catch (error) {
      console.error('履歴更新エラー:', error);
      // 履歴更新の失敗は処理全体を止めない
    }
  }

  /**
   * ファイル履歴一覧取得（ページネーション対応）
   * 
   * 添付仕様書：「履歴表示仕様 - ソート: 降順（最新が上）」
   */
  static async getFileHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    files: FileHistoryItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
      totalPages: number;
    };
  }> {
    try {
      const offset = (page - 1) * limit;

      const [files, total] = await Promise.all([
        prisma.csvFileHistory.findMany({
          orderBy: { uploadedAt: 'desc' }, // 最新が上（降順）
          skip: offset,
          take: limit,
          select: {
            id: true,
            uploadId: true,
            filename: true,
            uploadedAt: true,
            processingStatus: true,
            detectedKpis: true,
            processedRecords: true,
            processingTimeMs: true
          }
        }),
        prisma.csvFileHistory.count()
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;

      return {
        files: files.map((file: any) => ({
          id: file.id,
          uploadId: file.uploadId,
          filename: file.filename,
          uploadedAt: file.uploadedAt,
          processingStatus: file.processingStatus as FileHistoryItem['processingStatus'],
          detectedKpis: file.detectedKpis,
          processedRecords: file.processedRecords,
          processingTimeMs: file.processingTimeMs || undefined
        })),
        pagination: {
          page,
          limit,
          total,
          hasMore,
          totalPages
        }
      };

    } catch (error) {
      console.error('履歴一覧取得エラー:', error);
      throw new Error(`履歴一覧の取得に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * ファイル詳細情報取得
   * 
   * 添付仕様書：ファイル詳細画面（/dashboard/file-details/[fileId]）の表示内容
   */
  static async getFileDetails(fileId: number): Promise<FileDetailsResponse> {
    try {
      // 基本履歴情報を取得
      const history = await prisma.csvFileHistory.findUnique({
        where: { id: fileId },
        include: {
          contributions: {
            include: {
              cumulativeKpi: true
            }
          }
        }
      });

      if (!history) {
        throw new Error(`ファイル履歴が見つかりません: ID=${fileId}`);
      }

      // マッピング結果の整理
      const mappingResults = this.extractMappingResults(history.mappingResults);

      // KPI貢献度の計算
      const kpiContributions = await this.calculateKpiContributions(history.contributions);

      return {
        file: {
          id: history.id,
          uploadId: history.uploadId,
          filename: history.filename,
          uploadedAt: history.uploadedAt,
          processingTimeMs: history.processingTimeMs,
          processingStatus: history.processingStatus,
          errorDetails: history.errorDetails || undefined
        },
        mappingResults,
        kpiContributions,
        analysisResults: history.analysisResults,
        complianceImpact: history.complianceImpact
      };

    } catch (error) {
      console.error('ファイル詳細取得エラー:', error);
      throw new Error(`ファイル詳細の取得に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * マッピング結果の抽出・整理
   * 添付仕様書：「🎯 KPIマッピング分析結果」セクション
   */
  private static extractMappingResults(mappingResults: any): Array<{
    csvKpiId: string;
    standardKpiId: string;
    standardKpiName: string;
    confidence: number;
    contributedValue: number;
    recordCount: number;
  }> {
    if (!mappingResults || !Array.isArray(mappingResults)) {
      return [];
    }

    return mappingResults.map((result: any) => ({
      csvKpiId: result.csvKpiId || '不明',
      standardKpiId: result.standardKpiId || '未マッピング',
      standardKpiName: result.standardKpiName || result.standardKpiId || '未特定',
      confidence: result.confidence || 0,
      contributedValue: result.contributedValue || 0,
      recordCount: result.recordCount || 0
    }));
  }

  /**
   * KPI貢献度の計算
   * 添付仕様書：「📊 累積KPIへの貢献度」セクション
   */
  private static async calculateKpiContributions(
    contributions: Array<{
      contributedValue: any;
      recordCount: number;
      cumulativeKpi: {
        standardKpiId: string;
        standardKpiName: string;
        cumulativeValue: any;
        unit: string;
      };
    }>
  ): Promise<Array<{
    standardKpiId: string;
    standardKpiName: string;
    previousValue: number;
    addedValue: number;
    newValue: number;
    unit: string;
    contributionPercentage: number;
    recordCount: number;
  }>> {
    return contributions.map(contrib => {
      const newValue = contrib.cumulativeKpi.cumulativeValue.toNumber();
      const addedValue = contrib.contributedValue.toNumber();
      const previousValue = newValue - addedValue;
      
      // 貢献度パーセンテージの計算
      let contributionPercentage = 0;
      if (previousValue > 0) {
        contributionPercentage = (addedValue / previousValue) * 100;
      } else if (addedValue > 0) {
        // 新しいKPIの場合は100%とする
        contributionPercentage = 100;
      }

      return {
        standardKpiId: contrib.cumulativeKpi.standardKpiId,
        standardKpiName: contrib.cumulativeKpi.standardKpiName,
        previousValue: Math.max(0, previousValue),
        addedValue,
        newValue,
        unit: contrib.cumulativeKpi.unit,
        contributionPercentage: Math.round(contributionPercentage * 10) / 10, // 小数点1桁に丸める
        recordCount: contrib.recordCount
      };
    });
  }

  /**
   * ファイル削除
   * 累積データからも貢献度を削除
   */
  static async deleteFile(fileId: number): Promise<void> {
    try {
      await prisma.$transaction(async (tx: any) => {
        // 累積KPIから貢献度を削除
        const contributions = await tx.kpiContribution.findMany({
          where: { csvFileHistoryId: fileId },
          include: { cumulativeKpi: true }
        });

        for (const contribution of contributions) {
          const cumulativeKpi = contribution.cumulativeKpi;
          const newValue = cumulativeKpi.cumulativeValue.toNumber() - contribution.contributedValue.toNumber();
          const newRecordCount = cumulativeKpi.recordCount - contribution.recordCount;
          const newFileIds = cumulativeKpi.contributingFileIds.filter((id: any) => id !== fileId);

          await tx.cumulativeKpi.update({
            where: { id: cumulativeKpi.id },
            data: {
              cumulativeValue: Math.max(0, newValue),
              recordCount: Math.max(0, newRecordCount),
              contributingFileIds: newFileIds,
              lastUpdated: new Date()
            }
          });
        }

        // 貢献度記録を削除
        await tx.kpiContribution.deleteMany({
          where: { csvFileHistoryId: fileId }
        });

        // 履歴記録を削除
        await tx.csvFileHistory.delete({
          where: { id: fileId }
        });
      });

      console.log(`ファイル削除完了: ID=${fileId}`);

    } catch (error) {
      console.error('ファイル削除エラー:', error);
      throw new Error(`ファイルの削除に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 処理統計の取得
   * 添付仕様書：管理者向け統計情報
   */
  static async getProcessingStatistics(): Promise<{
    totalFiles: number;
    completedFiles: number;
    errorFiles: number;
    averageProcessingTime: number;
    totalKpisDetected: number;
    totalRecordsProcessed: number;
    successRate: number;
  }> {
    try {
      const [files, stats] = await Promise.all([
        prisma.csvFileHistory.findMany({
          select: {
            processingStatus: true,
            processingTimeMs: true,
            detectedKpis: true,
            processedRecords: true
          }
        }),
        prisma.csvFileHistory.aggregate({
          _count: true,
          _sum: {
            detectedKpis: true,
            processedRecords: true,
            processingTimeMs: true
          }
        })
      ]);

      const totalFiles = files.length;
      const completedFiles = files.filter((f: any) => f.processingStatus === 'COMPLETED').length;
      const errorFiles = files.filter((f: any) => f.processingStatus === 'ERROR').length;
      const averageProcessingTime = totalFiles > 0 ? 
        (stats._sum.processingTimeMs || 0) / totalFiles : 0;
      const successRate = totalFiles > 0 ? completedFiles / totalFiles : 0;

      return {
        totalFiles,
        completedFiles,
        errorFiles,
        averageProcessingTime: Math.round(averageProcessingTime),
        totalKpisDetected: stats._sum.detectedKpis || 0,
        totalRecordsProcessed: stats._sum.processedRecords || 0,
        successRate: Math.round(successRate * 100) / 100
      };

    } catch (error) {
      console.error('統計取得エラー:', error);
      throw new Error(`統計情報の取得に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 