import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NotificationItem } from '@/types/services/notification';

/**
 * PUT /api/notifications/{id}/read - 通知を既読にする
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true, updatedAt: new Date() },
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
    console.error('通知既読エラー:', error);
    return NextResponse.json(
      { error: '通知の既読処理に失敗しました' },
      { status: 500 }
    );
  }
} 