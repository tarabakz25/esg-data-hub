import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import type { 
  NotificationFilter, 
  NotificationListResponse,
  NotificationItem
} from '@/types/services/notification';

/**
 * GET /api/notifications - 通知一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // クエリパラメータの解析
    const filter: NotificationFilter = {
      type: searchParams.get('type')?.split(',') as any,
      priority: searchParams.get('priority')?.split(',') as any,
      isRead: searchParams.get('isRead') === 'true' ? true : 
              searchParams.get('isRead') === 'false' ? false : undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // WHERE条件の構築
    const where: any = {};
    if (filter.type && filter.type.length > 0) {
      where.type = { in: filter.type };
    }
    if (filter.priority && filter.priority.length > 0) {
      where.priority = { in: filter.priority };
    }
    if (filter.isRead !== undefined) {
      where.isRead = filter.isRead;
    }

    // 通知データの取得
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          complianceCheckResult: {
            include: {
              missingKpis: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: filter.limit,
        skip: filter.offset,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, isRead: false } })
    ]);

    // レスポンス形式に変換
    const response: NotificationListResponse = {
      notifications: notifications.map((n: any): NotificationItem => ({
        id: n.id,
        type: n.type,
        priority: n.priority,
        title: n.title,
        message: n.message,
        severity: n.severity || undefined,
        isRead: n.isRead,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
        actionUrl: n.actionUrl || undefined,
        complianceDetails: n.complianceCheckResult ? {
          period: n.complianceCheckResult.period,
          standard: n.complianceCheckResult.standard,
          missingKpis: n.complianceCheckResult.missingKpis.map((mk: any) => ({
            kpiId: mk.kpiId,
            kpiName: mk.kpiName,
            category: mk.category
          })),
          complianceRate: n.complianceCheckResult.complianceRate
        } : undefined
      })),
      totalCount,
      unreadCount,
      hasMore: (filter.offset || 0) + notifications.length < totalCount
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('通知一覧取得エラー:', error);
    return NextResponse.json(
      { error: '通知一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications - 新しい通知を作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, priority, title, message, severity, complianceCheckResultId, actionUrl, userId } = body;

    const notification = await prisma.notification.create({
      data: {
        type,
        priority,
        title,
        message,
        severity,
        complianceCheckResultId,
        actionUrl,
        userId,
      },
      include: {
        complianceCheckResult: {
          include: {
            missingKpis: true
          }
        }
      }
    });

    const result: NotificationItem = {
      id: notification.id,
      type: notification.type,
      priority: notification.priority,
      title: notification.title,
      message: notification.message,
      severity: notification.severity || undefined,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      actionUrl: notification.actionUrl || undefined,
      complianceDetails: notification.complianceCheckResult ? {
        period: notification.complianceCheckResult.period,
        standard: notification.complianceCheckResult.standard,
        missingKpis: notification.complianceCheckResult.missingKpis.map((mk: any) => ({
          kpiId: mk.kpiId,
          kpiName: mk.kpiName,
          category: mk.category
        })),
        complianceRate: notification.complianceCheckResult.complianceRate
      } : undefined
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('通知作成エラー:', error);
    return NextResponse.json(
      { error: '通知の作成に失敗しました' },
      { status: 500 }
    );
  }
} 