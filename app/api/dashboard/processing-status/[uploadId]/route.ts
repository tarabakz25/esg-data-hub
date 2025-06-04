import { NextRequest, NextResponse } from 'next/server';
import { CsvHistoryService } from '@/lib/services/csv-history-service';
import { AutoProcessingChain } from '@/lib/services/auto-processing-chain';

interface ProcessingStatusParams {
  uploadId: string;
}

/**
 * リアルタイム処理状況監視API
 * Phase 2: 自動処理の進行状況をリアルタイムで追跡
 */
export async function GET(
  request: NextRequest,
  { params }: { params: ProcessingStatusParams }
) {
  try {
    const uploadId = parseInt(params.uploadId);
    
    if (isNaN(uploadId)) {
      return NextResponse.json(
        { error: 'Invalid upload ID' },
        { status: 400 }
      );
    }

    // ファイル処理履歴から現在のステータスを取得
    const histories = await CsvHistoryService.getFileHistory(1, 100);
    const currentFile = histories.files.find(f => f.uploadId === uploadId);
    
    if (!currentFile) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // 処理が完了している場合は詳細を取得
    let processingDetails = null;
    if (currentFile.processingStatus === 'COMPLETED' || currentFile.processingStatus === 'ERROR') {
      try {
        processingDetails = await CsvHistoryService.getFileDetails(currentFile.id);
      } catch (error) {
        console.warn('処理詳細取得エラー:', error);
      }
    }

    // 処理統計の取得
    const stats = await AutoProcessingChain.getProcessingStatistics();

    return NextResponse.json({
      uploadId,
      filename: currentFile.filename,
      processingStatus: currentFile.processingStatus,
      uploadedAt: currentFile.uploadedAt,
      detectedKpis: currentFile.detectedKpis,
      processedRecords: currentFile.processedRecords,
      processingTimeMs: currentFile.processingTimeMs,
      processingDetails,
      globalStats: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('処理状況取得エラー:', error);
    return NextResponse.json(
      { 
        error: '処理状況の取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 