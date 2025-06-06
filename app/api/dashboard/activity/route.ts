import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // 最近のアップロード
    const recentUploads = await prisma.upload.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    // 最近のコンプライアンスチェック
    const recentComplianceChecks = await prisma.complianceCheckResult.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // 最近の通知
    const recentNotifications = await prisma.notification.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // 最近の監査ログ
    const recentAuditLogs = await prisma.auditTrail.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // アクティビティ統合とフォーマット
    const activities = [
      // アップロードアクティビティ
      ...recentUploads.map(upload => ({
        id: `upload-${upload.id}`,
        type: 'upload' as const,
        title: 'ファイルアップロード',
        description: `${upload.filename} がアップロードされました`,
        status: upload.status === 'parsed' ? 'success' : upload.status === 'errored' ? 'error' : 'warning',
        timestamp: upload.createdAt,
        user: upload.user?.name || 'システム',
        actionUrl: upload.id ? `/file-details/${upload.id}` : undefined,
        metadata: {
          filename: upload.filename,
          status: upload.status
        }
      })),

      // コンプライアンスチェックアクティビティ
      ...recentComplianceChecks.map(check => ({
        id: `compliance-${check.id}`,
        type: 'compliance' as const,
        title: 'コンプライアンスチェック',
        description: `${check.standard} のコンプライアンスチェックが完了しました`,
        status: check.status === 'compliant' ? 'success' : check.status === 'critical' ? 'error' : 'warning',
        timestamp: check.createdAt,
        user: 'システム',
        actionUrl: `/compliance`,
        metadata: {
          standard: check.standard,
          status: check.status,
          complianceRate: check.complianceRate
        }
      })),

      // 通知アクティビティ
      ...recentNotifications.map(notification => ({
        id: `notification-${notification.id}`,
        type: 'notification' as const,
        title: notification.title,
        description: notification.message,
        status: notification.priority === 'high' ? 'error' : notification.priority === 'medium' ? 'warning' : 'info',
        timestamp: notification.createdAt,
        user: 'システム',
        actionUrl: notification.actionUrl || undefined,
        metadata: {
          type: notification.type,
          priority: notification.priority,
          isRead: notification.isRead
        }
      })),

      // 監査ログアクティビティ（重要なアクションのみ）
      ...recentAuditLogs
        .filter(log => ['INSERT', 'UPDATE', 'DELETE'].includes(log.action))
        .map(log => ({
          id: `audit-${log.id}`,
          type: 'audit' as const,
          title: 'データ変更',
          description: `${log.tableName} テーブルで ${log.action} 操作が実行されました`,
          status: 'info' as const,
          timestamp: log.createdAt,
          user: log.userId || 'システム',
          metadata: {
            tableName: log.tableName,
            action: log.action,
            recordId: log.recordId.toString()
          }
        }))
    ];

    // タイムスタンプでソートして制限
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return NextResponse.json({
      activities: sortedActivities,
      total: sortedActivities.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('最近のアクティビティ取得エラー:', error);
    return NextResponse.json(
      { 
        error: '最近のアクティビティの取得に失敗しました',
        activities: [],
        total: 0,
        lastUpdated: new Date().toISOString()
      },
      { status: 50 }
    );
  }
} 