import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // csv_file_historyからマッピングデータを取得
    const whereClause = search ? {
      filename: {
        contains: search,
        mode: 'insensitive' as const
      }
    } : {};

    const [mappings, totalCount] = await Promise.all([
      prisma.csv_file_history.findMany({
        where: whereClause,
        include: {
          Upload: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          kpi_contributions: {
            include: {
              cumulative_kpis: {
                include: {
                  standard_kpi_definitions: true
                }
              }
            }
          }
        },
        orderBy: {
          uploadedAt: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.csv_file_history.count({
        where: whereClause
      })
    ]);

    // データを変換してフロントエンドの期待する形式に合わせる
    const transformedMappings = mappings.map(mapping => {
      const analysisResults = mapping.analysisResults as any;
      const sourceColumns = analysisResults?.detectedColumns || [];
      const targetKPIs = mapping.kpi_contributions.map(contrib => 
        contrib.cumulative_kpis.standard_kpi_definitions.name
      );

      // AI信頼度を計算（kpi_contributionsの平均confidence）
      const avgConfidence = mapping.kpi_contributions.length > 0
        ? Math.round(mapping.kpi_contributions.reduce((sum, contrib) => sum + contrib.confidence, 0) / mapping.kpi_contributions.length * 100)
        : 0;

      // ステータスを決定
      let status = 'completed';
      let mappingType = 'ai';
      
      if (mapping.processingStatus === 'ERROR') {
        status = 'error';
      } else if (mapping.processingStatus === 'PENDING' || mapping.processingStatus === 'PROCESSING') {
        status = 'pending_review';
      } else if (avgConfidence < 60) {
        status = 'manual_required';
        mappingType = 'manual';
      }

      return {
        id: mapping.id,
        dataSource: mapping.filename,
        status,
        mappingType,
        confidence: avgConfidence,
        sourceColumns: sourceColumns.slice(0, 5), // 最初の5列のみ表示
        targetKPIs: targetKPIs.slice(0, 3), // 最初の3つのKPIのみ表示
        mappedBy: mappingType === 'ai' ? 'AI Auto-Mapper' : mapping.Upload.user?.name || 'Unknown User',
        createdAt: mapping.uploadedAt.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        approvedBy: status === 'completed' ? mapping.Upload.user?.name || 'System' : null,
        approvedAt: status === 'completed' ? mapping.uploadedAt.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : null,
        uploadId: mapping.uploadId,
        detectedKpis: mapping.detectedKpis,
        processedRecords: mapping.processedRecords,
        processingTimeMs: mapping.processingTimeMs,
        errorDetails: mapping.errorDetails
      };
    });

    // 統計情報を計算
    const stats = {
      totalMappings: totalCount,
      completed: mappings.filter(m => m.processingStatus === 'COMPLETED').length,
      aiMappingPercentage: Math.round((mappings.filter(m => {
        const avgConfidence = m.kpi_contributions.length > 0
          ? m.kpi_contributions.reduce((sum, contrib) => sum + contrib.confidence, 0) / m.kpi_contributions.length
          : 0;
        return avgConfidence >= 0.6;
      }).length / Math.max(mappings.length, 1)) * 100),
      pendingApproval: mappings.filter(m => 
        m.processingStatus === 'PENDING' || m.processingStatus === 'PROCESSING'
      ).length
    };

    return NextResponse.json({
      success: true,
      mappings: transformedMappings,
      stats,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('マッピングデータ取得エラー:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'マッピングデータの取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 