import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // クエリパラメータの取得
    const kpiId = searchParams.get('kpiId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');
    
    // ページネーション用の計算
    const skip = (page - 1) * limit;
    
    // 基本的なwhere条件
    const where: any = {};
    
    // 特定のKPI IDが指定された場合
    if (kpiId) {
      where.id = kpiId;
    }
    
    // 検索機能
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 総数を取得（ページネーション用）
    const totalCount = await prisma.kpi.count({ where });
    
    // KPIデータを取得
    const kpis = await prisma.kpi.findMany({
      where,
      select: {
        id: true,
        name: true,
        unit: true,
        createdAt: true,
        _count: {
          select: {
            data: true,
            values: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
    });

    // ページネーション情報
    const pagination = {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrev: page > 1,
    };

    console.log(`KPI取得完了: ${kpis.length}件のKPI（ページ ${page}/${pagination.totalPages}）`);

    return NextResponse.json(
      {
        success: true,
        data: kpis,
        pagination,
        message: `${kpis.length}件のKPIを取得しました`,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('KPI取得エラー:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'KPIの取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, unit } = body;

    // 必須フィールドの検証
    if (!id || !name || !unit) {
      return NextResponse.json(
        { 
          success: false,
          error: 'id, name, unitは必須フィールドです',
        },
        { status: 400 }
      );
    }

    // 新しいKPIを作成
    const newKpi = await prisma.kpi.create({
      data: {
        id,
        name,
        unit,
      },
    });

    console.log(`新しいKPI作成完了: ${newKpi.id} - ${newKpi.name}`);

    return NextResponse.json(
      {
        success: true,
        data: newKpi,
        message: 'KPIが正常に作成されました',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('KPI作成エラー:', error);
    
    // 重複キーエラーの処理
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { 
          success: false,
          error: '指定されたKPI IDは既に存在します',
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'KPIの作成に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 