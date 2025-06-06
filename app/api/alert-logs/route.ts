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
    if (alertType) where.type = alertType;
    if (status) where.isRead = status === 'read';
    if (department) where.user = { department };

    const [alerts, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where })
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

    const updateData: any = {};
    
    if (status === 'acknowledged' || status === 'resolved') {
      updateData.isRead = true;
      updateData.updatedAt = new Date();
    }

    const updatedAlert = await prisma.notification.update({
      where: { id: alertId },
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