import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// アラートログ一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertType = searchParams.get('alertType');
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (alertType) where.alertType = alertType;
    if (status) where.status = status;
    if (department) where.department = department;

    const [alerts, total] = await Promise.all([
      prisma.alertLog.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.alertLog.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: alerts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      }
    });

  } catch (error) {
    console.error('アラートログ取得エラー:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// アラートステータス更新
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, status, userId } = body;

    if (!alertId || !status) {
      return NextResponse.json(
        { error: 'alertId and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['sent', 'acknowledged', 'resolved'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updateData: any = { status };
    
    if (status === 'acknowledged') {
      updateData.acknowledgedAt = new Date();
    } else if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const updatedAlert = await prisma.alertLog.update({
      where: { id: BigInt(alertId) },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedAlert,
    });

  } catch (error) {
    console.error('アラートステータス更新エラー:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 