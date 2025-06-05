import { PrismaClient } from "@prisma/client"
import type {
  KPISearchQuery,
  DataSourceSearchQuery,
  ApiResponse,
  KPIDetail,
  DataSourceDetail,
  CatalogStats
} from '@/types/catalog'

const prisma = new PrismaClient()

export class CatalogService {
  /**
   * KPIを検索する
   */
  static async searchKPIs(query: KPISearchQuery): Promise<ApiResponse<KPIDetail[]>> {
    try {
      const { q, category, regulation, page, limit, sortBy, sortOrder } = query;
      const skip = (page - 1) * limit;

      // WHERE条件を構築
      const where: any = {};
      
      if (q) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { id: { contains: q, mode: 'insensitive' } },
        ];
      }

      // 並び順を構築
      let orderBy: any = {};
      switch (sortBy) {
        case 'code':
          orderBy = { id: sortOrder };
          break;
        case 'name':
          orderBy = { name: sortOrder };
          break;
        case 'createdAt':
          orderBy = { createdAt: sortOrder };
          break;
        default:
          orderBy = { name: 'asc' };
          break;
      }

      // KPIを取得
      const [kpis, total] = await Promise.all([
        prisma.kpi.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        prisma.kpi.count({ where }),
      ]);

      // 詳細情報を追加
      const kpiDetails: KPIDetail[] = kpis.map((kpi) => ({
        id: kpi.id,
        code: kpi.id,
        displayName: kpi.name,
        baseUnit: kpi.unit,
        requirements: [], // 現在のスキーマでは要件情報が別途管理されていない
      }));

      return {
        success: true,
        data: kpiDetails,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('KPI検索エラー:', error);
      return {
        success: false,
        error: 'KPIの検索中にエラーが発生しました',
      };
    }
  }

  /**
   * データソースを検索する
   */
  static async searchDataSources(query: DataSourceSearchQuery): Promise<ApiResponse<DataSourceDetail[]>> {
    try {
      const { q, type, page, limit, sortBy, sortOrder } = query;
      const skip = (page - 1) * limit;

      // WHERE条件を構築
      const where: any = {};
      
      if (q) {
        where.OR = [
          { uri: { contains: q, mode: 'insensitive' } },
        ];
      }

      // 並び順を構築
      let orderBy: any = {};
      switch (sortBy) {
        case 'name':
          orderBy = { uri: sortOrder };
          break;
        case 'createdAt':
          orderBy = { uploadedAt: sortOrder };
          break;
        default:
          orderBy = { uri: 'asc' };
          break;
      }

      // データソースを取得
      const [dataSources, total] = await Promise.all([
        prisma.source.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        prisma.source.count({ where }),
      ]);

      const dataSourceDetails: DataSourceDetail[] = dataSources.map(ds => ({
        id: ds.id,
        name: ds.uri,
        description: undefined,
        createdAt: ds.uploadedAt,
        updatedAt: ds.uploadedAt,
      }));

      return {
        success: true,
        data: dataSourceDetails,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('データソース検索エラー:', error);
      return {
        success: false,
        error: 'データソースの検索中にエラーが発生しました',
      };
    }
  }

  /**
   * カタログ統計情報を取得する
   */
  static async getCatalogStats(): Promise<ApiResponse<CatalogStats>> {
    try {
      const [
        totalKPIs,
        totalDataSources,
        totalRecords,
        missingKPIs,
        recentAlerts,
      ] = await Promise.all([
        prisma.kpi.count(),
        prisma.source.count(),
        prisma.dataRow.count(),
        prisma.missingKpi.count(),
        prisma.notification.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 過去7日
            },
          },
        }),
      ]);

      // コンプライアンス率を計算（簡略化）
      const totalChecks = await prisma.complianceCheckResult.count();
      const passedChecks = await prisma.complianceCheckResult.count({
        where: { status: 'compliant' },
      });
      const complianceRate = totalChecks > 0 
        ? Math.round((passedChecks / totalChecks) * 100)
        : 100;

      const stats: CatalogStats = {
        totalKPIs,
        totalDataSources,
        totalRecords: Number(totalRecords),
        missingKPIs,
        recentAlerts,
        complianceRate,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error('統計情報取得エラー:', error);
      return {
        success: false,
        error: '統計情報の取得中にエラーが発生しました',
      };
    }
  }

  /**
   * 特定のKPIの詳細情報を取得する
   */
  static async getKPIDetail(id: string): Promise<ApiResponse<KPIDetail>> {
    try {
      const kpi = await prisma.kpi.findUnique({
        where: { id },
      });

      if (!kpi) {
        return {
          success: false,
          error: 'KPIが見つかりません',
        };
      }

      // KPI要件の情報を取得（現在のスキーマに合わせて調整）
      const kpiDetail: KPIDetail = {
        id: kpi.id,
        code: kpi.id, // id をコードとして使用
        displayName: kpi.name,
        baseUnit: kpi.unit,
        requirements: [], // 現在のスキーマでは要件情報が別途管理されていない
      };

      return {
        success: true,
        data: kpiDetail,
      };
    } catch (error) {
      console.error('KPI詳細取得エラー:', error);
      return {
        success: false,
        error: 'KPI詳細の取得中にエラーが発生しました',
      };
    }
  }

  /**
   * 特定のデータソースの詳細情報を取得する
   */
  static async getDataSourceDetail(id: number): Promise<ApiResponse<DataSourceDetail>> {
    try {
      const dataSource = await prisma.source.findUnique({
        where: { id },
      });

      if (!dataSource) {
        return {
          success: false,
          error: 'データソースが見つかりません',
        };
      }

      const dataSourceDetail: DataSourceDetail = {
        id: dataSource.id,
        name: dataSource.uri, // uriをnameとして使用
        description: undefined, // 現在のスキーマにdescriptionフィールドがない
        createdAt: dataSource.uploadedAt,
        updatedAt: dataSource.uploadedAt, // updatedAtフィールドがないのでuploadedAtを使用
      };

      return {
        success: true,
        data: dataSourceDetail,
      };
    } catch (error) {
      console.error('データソース詳細取得エラー:', error);
      return {
        success: false,
        error: 'データソース詳細の取得中にエラーが発生しました',
      };
    }
  }
} 