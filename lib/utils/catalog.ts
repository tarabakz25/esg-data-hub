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
      const { q, regulation, category, unit, page, limit, sortBy, sortOrder } = query;
      const skip = (page - 1) * limit;

      // WHERE条件を構築
      const where: any = {};
      
      if (q) {
        where.OR = [
          { displayName: { contains: q, mode: 'insensitive' } },
          { code: { contains: q, mode: 'insensitive' } },
        ];
      }

      if (unit) {
        where.baseUnit = { contains: unit, mode: 'insensitive' };
      }

      // 並び順を構築
      let orderBy: any = {};
      switch (sortBy) {
        case 'name':
          orderBy = { displayName: sortOrder };
          break;
        case 'code':
          orderBy = { code: sortOrder };
          break;
        case 'createdAt':
          orderBy = { id: sortOrder }; // KPIテーブルにcreatedAtがないためidで代用
          break;
        case 'relevance':
        default:
          orderBy = { displayName: 'asc' };
          break;
      }

      // KPIを取得
      const [kpis, total] = await Promise.all([
        prisma.kPI.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        prisma.kPI.count({ where }),
      ]);

      // 詳細情報を追加
      const kpiDetails: KPIDetail[] = await Promise.all(
        kpis.map(async (kpi) => {
          const requirements = regulation 
            ? await prisma.kPIRequirement.findMany({
                where: { 
                  kpiId: kpi.id,
                  regulation: regulation 
                },
              })
            : await prisma.kPIRequirement.findMany({
                where: { kpiId: kpi.id },
              });

          return {
            id: kpi.id,
            code: kpi.code,
            displayName: kpi.displayName,
            baseUnit: kpi.baseUnit,
            requirements: requirements.map(req => ({
              regulation: req.regulation,
              isRequired: req.isRequired,
              dueDate: req.dueDate || undefined,
              department: req.department || undefined,
            })),
          };
        })
      );

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
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ];
      }

      // 並び順を構築
      let orderBy: any = {};
      switch (sortBy) {
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

      // データソースを取得
      const [dataSources, total] = await Promise.all([
        prisma.dataSource.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        prisma.dataSource.count({ where }),
      ]);

      const dataSourceDetails: DataSourceDetail[] = dataSources.map(ds => ({
        id: ds.id,
        name: ds.name,
        description: ds.description || undefined,
        createdAt: ds.createdAt,
        updatedAt: ds.updatedAt,
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
        prisma.kPI.count(),
        prisma.dataSource.count(),
        prisma.dataRecord.count(),
        prisma.kPIRequirement.count({
          where: { 
            isRequired: true,
            // 関連するKPIにデータがない場合を計算（簡略化）
          },
        }),
        prisma.alertLog.count({
          where: {
            sentAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 過去7日
            },
          },
        }),
      ]);

      // コンプライアンス率を計算（簡略化）
      const requiredKPIs = await prisma.kPIRequirement.count({
        where: { isRequired: true },
      });
      const complianceRate = requiredKPIs > 0 
        ? Math.max(0, ((requiredKPIs - missingKPIs) / requiredKPIs) * 100)
        : 100;

      const stats: CatalogStats = {
        totalKPIs,
        totalDataSources,
        totalRecords: Number(totalRecords),
        missingKPIs,
        recentAlerts,
        complianceRate: Math.round(complianceRate),
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
  static async getKPIDetail(id: number): Promise<ApiResponse<KPIDetail>> {
    try {
      const kpi = await prisma.kPI.findUnique({
        where: { id },
      });

      if (!kpi) {
        return {
          success: false,
          error: 'KPIが見つかりません',
        };
      }

      const requirements = await prisma.kPIRequirement.findMany({
        where: { kpiId: id },
      });

      const kpiDetail: KPIDetail = {
        id: kpi.id,
        code: kpi.code,
        displayName: kpi.displayName,
        baseUnit: kpi.baseUnit,
        requirements: requirements.map(req => ({
          regulation: req.regulation,
          isRequired: req.isRequired,
          dueDate: req.dueDate || undefined,
          department: req.department || undefined,
        })),
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
      const dataSource = await prisma.dataSource.findUnique({
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
        name: dataSource.name,
        description: dataSource.description || undefined,
        createdAt: dataSource.createdAt,
        updatedAt: dataSource.updatedAt,
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