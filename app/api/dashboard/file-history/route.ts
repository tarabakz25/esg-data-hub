import { NextRequest, NextResponse } from 'next/server';
import { CsvHistoryService } from '@/lib/services/csv-history-service';

export const runtime = 'nodejs';

/**
 * ファイル履歴取得API
 * 添付仕様書：アップロード履歴（15%）
 */

/**
 * GET /api/dashboard/file-history
 * ファイル履歴一覧を取得（ページネーション対応）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // ページネーションパラメータ
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    
    // ファイル履歴を取得（正しいシグネチャで呼び出し）
    const fileHistory = await CsvHistoryService.getFileHistory(page, limit);
    
    // 処理統計を取得
    const processingStats = await CsvHistoryService.getProcessingStatistics();
    
    return NextResponse.json({
      files: fileHistory.files,
      pagination: fileHistory.pagination,
      processingStats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('ファイル履歴取得エラー:', error);
    return NextResponse.json(
      { 
        error: 'ファイル履歴の取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dashboard/file-history/[id]
 * ファイル履歴を削除（累積データからも削除）
 */
export async function DELETE(request: NextRequest) {
  try {
    // URLからファイルIDを取得
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const fileId = parseInt(pathSegments[pathSegments.length - 1]);

    if (!fileId || isNaN(fileId)) {
      return NextResponse.json(
        { error: 'Invalid file ID' },
        { status: 400 }
      );
    }

    // ファイル削除
    await CsvHistoryService.deleteFile(fileId);

    return NextResponse.json({ 
      success: true,
      message: `ファイル ID=${fileId} を削除しました`
    });

  } catch (error) {
    console.error('ファイル削除エラー:', error);
    
    return NextResponse.json(
      { 
        error: 'ファイルの削除に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * 処理状況アイコンの取得
 * 添付仕様書：処理状況アイコン表示
 */
function getStatusIcon(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return '✅'; // 処理完了
    case 'PROCESSING':
      return '⏳'; // 処理中
    case 'ERROR':
      return '❌'; // エラー
    case 'PENDING':
      return '⏸️'; // 待機中
    default:
      return '❓'; // 不明
  }
} 