import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NotificationStats } from '@/types/services/notification';

/**
 * GET /api/notifications/stats - 通知統計を取得
 */
export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalNotifications,
      unreadNotifications,
      criticalUnread,
      warningUnread,
      todayNotifications
    ] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.notification.count({
        where: {
          isRead: false,
          severity: 'critical'
        }
      }),
      prisma.notification.count({
        where: {
          isRead: false,
          severity: 'warning'
        }
      }),
      prisma.notification.count({
        where: {
          createdAt: { gte: today }
        }
      })
    ]);

    const stats: NotificationStats = {
      totalNotifications,
      unreadNotifications,
      criticalUnread,
      warningUnread,
      todayNotifications
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('通知統計取得エラー:', error);
    return NextResponse.json(
      { error: '通知統計の取得に失敗しました' },
      { status: 500 }
    );
  }
} 