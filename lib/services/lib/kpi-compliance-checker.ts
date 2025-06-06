import { PrismaClient } from '@prisma/client';
import { 
  ComplianceCheckResult, 
  ComplianceCheckOptions, 
  MissingKpi, 
  ComplianceStandard,
  ComplianceSeverity 
} from '../../../types/services/compliance';
import { 
  getMandatoryKpis, 
  getKpiSeverity, 
  MANDATORY_KPI_CONFIGS 
} from './compliance-config';

export class KPIComplianceChecker {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * 指定期間・基準でのコンプライアンスチェックを実行
   */
  async checkComplianceForPeriod(options: ComplianceCheckOptions): Promise<ComplianceCheckResult> {
    const { period, standards = ['issb'], department, includeWarnings = true } = options;
    
    // デフォルトで最初の基準を使用
    const standard = standards[0];
    
    console.log(`🔍 コンプライアンスチェック開始: ${period}, 基準: ${standard}`);

    // 1. 必須KPIリストを取得
    const mandatoryKpis = this.getMandatoryKpiList(standard, includeWarnings);
    
    // 2. 既存データから期間内に存在するKPIを取得
    const existingKpis = await this.getExistingKpisForPeriod(period, department);
    
    // 3. 欠損KPIを特定
    const missingKpis = this.identifyMissingKpis(mandatoryKpis, existingKpis, standard);
    
    // 4. コンプライアンス結果を構築
    const result = this.buildComplianceResult({
      period,
      standard,
      totalKpis: mandatoryKpis.length,
      missingKpis
    });

    // 5. 結果をDBに保存
    await this.saveComplianceResult(result);

    console.log(`✅ チェック完了: ${missingKpis.length}件の欠損を検出`);
    return result;
  }

  /**
   * 基準に基づく必須KPIリストを取得
   */
  private getMandatoryKpiList(standard: ComplianceStandard, includeWarnings: boolean): string[] {
    const critical = getMandatoryKpis(standard, 'critical');
    const warning = includeWarnings ? getMandatoryKpis(standard, 'warning') : [];
    
    return [...critical, ...warning];
  }

  /**
   * 指定期間に存在するKPIを取得
   */
  private async getExistingKpisForPeriod(period: string, department?: string): Promise<Set<string>> {
    const periodDate = this.parsePeriod(period);
    
    // 期間範囲を計算（四半期 or 月単位）
    const { startDate, endDate } = this.calculatePeriodRange(periodDate, period);
    
    console.log(`📅 期間範囲: ${startDate.toISOString()} - ${endDate.toISOString()}`);

    // 該当期間のKPIValueを取得
    const existingData = await this.prisma.kPIValue.findMany({
      where: {
        period: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        kpiId: true
      },
      distinct: ['kpiId']
    });

    const kpiIds = new Set(existingData.map((data: any) => data.kpiId as string));
    console.log(`📊 既存KPI数: ${kpiIds.size}件`);
    
    return kpiIds;
  }

  /**
   * 欠損KPIを特定
   */
  private identifyMissingKpis(
    mandatoryKpis: string[], 
    existingKpis: Set<string>, 
    standard: ComplianceStandard
  ): MissingKpi[] {
    const missingKpis: MissingKpi[] = [];

    for (const kpiId of mandatoryKpis) {
      if (!existingKpis.has(kpiId)) {
        const severity = getKpiSeverity(kpiId, standard);

        if (severity) {
          missingKpis.push({
            kpiId,
            kpiName: `KPI ${kpiId}`, // 暫定的な名前
            category: 'ESG', // 暫定的なカテゴリ
            severity,
            standard,
            expectedUnit: 'unit', // 暫定的な単位
            lastUpdated: undefined
          });
        }
      }
    }

    return missingKpis;
  }

  /**
   * コンプライアンス結果を構築
   */
  private buildComplianceResult(params: {
    period: string;
    standard: ComplianceStandard;
    totalKpis: number;
    missingKpis: MissingKpi[];
  }): ComplianceCheckResult {
    const { period, standard, totalKpis, missingKpis } = params;
    
    const criticalMissing = missingKpis.filter(kpi => kpi.severity === 'critical').length;
    const warningMissing = missingKpis.filter(kpi => kpi.severity === 'warning').length;
    const complianceRate = ((totalKpis - missingKpis.length) / totalKpis) * 100;
    
    // ステータス判定
    let status: 'compliant' | 'warning' | 'critical';
    if (criticalMissing > 0) {
      status = 'critical';
    } else if (warningMissing > 0) {
      status = 'warning';
    } else {
      status = 'compliant';
    }

    return {
      id: `${period}-${standard}-${Date.now()}`,
      period,
      standard,
      checkedAt: new Date(),
      totalKpis,
      missingKpis,
      criticalMissing,
      warningMissing,
      complianceRate,
      status
    };
  }

  /**
   * コンプライアンス結果をDBに保存
   */
  private async saveComplianceResult(result: ComplianceCheckResult): Promise<void> {
    try {
      // 既存の同期間・同基準の結果があれば削除
      await this.prisma.complianceCheckResult.deleteMany({
        where: {
          period: result.period,
          standard: result.standard
        }
      });

      // 新しい結果を保存
      await this.prisma.complianceCheckResult.create({
        data: {
          id: result.id,
          period: result.period,
          standard: result.standard,
          checkedAt: result.checkedAt,
          totalKpis: result.totalKpis,
          criticalMissing: result.criticalMissing,
          warningMissing: result.warningMissing,
          complianceRate: result.complianceRate,
          status: result.status,
          missingKpis: {
            create: result.missingKpis.map(kpi => ({
              kpiId: kpi.kpiId,
              kpiName: kpi.kpiName,
              category: kpi.category,
              severity: kpi.severity,
              expectedUnit: kpi.expectedUnit,
              lastUpdated: kpi.lastUpdated
            }))
          }
        }
      });

      console.log(`💾 コンプライアンス結果を保存: ${result.id}`);

      // 通知の作成（手動実装）
      if (result.criticalMissing > 0 || result.warningMissing > 0) {
        try {
          await this.createNotificationsFromResult(result);
        } catch (notificationError) {
          console.error('通知作成に失敗しました:', notificationError);
          // 通知作成の失敗はコンプライアンスチェック自体は継続
        }
      }
    } catch (error) {
      console.error('❌ コンプライアンス結果保存エラー:', error);
      throw error;
    }
  }

  /**
   * コンプライアンス結果から通知を作成
   */
  private async createNotificationsFromResult(result: ComplianceCheckResult): Promise<void> {
    // クリティカルな問題がある場合
    if (result.criticalMissing > 0) {
      await this.prisma.notification.create({
        data: {
          type: 'compliance_missing',
          priority: 'high',
          title: `重要なKPIが不足しています - ${result.period}`,
          message: `${result.standard.toUpperCase()}基準で${result.criticalMissing}個のクリティカルなKPIが不足しています。`,
          severity: 'critical',
          complianceCheckResultId: result.id,
          actionUrl: `/compliance/check?period=${result.period}&standard=${result.standard}`
        }
      });
    }

    // 警告レベルの問題がある場合
    if (result.warningMissing > 0) {
      await this.prisma.notification.create({
        data: {
          type: 'compliance_warning',
          priority: 'medium',
          title: `KPIの確認が必要です - ${result.period}`,
          message: `${result.standard.toUpperCase()}基準で${result.warningMissing}個のKPIの確認が必要です。`,
          severity: 'warning',
          complianceCheckResultId: result.id,
          actionUrl: `/compliance/check?period=${result.period}&standard=${result.standard}`
        }
      });
    }
  }

  /**
   * 期間文字列をDateオブジェクトに変換
   */
  private parsePeriod(period: string): Date {
    // 2024Q3 → 2024-07-01
    if (period.includes('Q')) {
      const [year, quarter] = period.split('Q');
      const month = (parseInt(quarter) - 1) * 3 + 1; // Q1→1月, Q2→4月, Q3→7月, Q4→10月
      return new Date(parseInt(year), month - 1, 1);
    }
    
    // 2024-12 → 2024-12-01
    if (period.includes('-')) {
      const [year, month] = period.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    }
    
    throw new Error(`サポートされていない期間形式: ${period}`);
  }

  /**
   * 期間の開始日・終了日を計算
   */
  private calculatePeriodRange(startDate: Date, period: string): { startDate: Date; endDate: Date } {
    const endDate = new Date(startDate);
    
    if (period.includes('Q')) {
      // 四半期の場合は3ヶ月
      endDate.setMonth(endDate.getMonth() + 3);
    } else {
      // 月の場合は1ヶ月
      endDate.setMonth(endDate.getMonth() + 1);
    }
    
    endDate.setDate(endDate.getDate() - 1); // 最終日に調整
    
    return { startDate, endDate };
  }

  /**
   * 静的メソッド: コンプライアンスチェック実行
   */
  static async checkCompliance(period: string, standard: ComplianceStandard, createNotifications: boolean = true): Promise<ComplianceCheckResult> {
    const checker = new KPIComplianceChecker();
    try {
      const result = await checker.checkComplianceForPeriod({ 
        period, 
        standards: [standard],
        includeWarnings: true 
      });
      return result;
    } finally {
      await checker.dispose();
    }
  }

  /**
   * 静的メソッド: 過去の結果を取得
   */
  static async getCheckResult(period: string, standard: ComplianceStandard): Promise<ComplianceCheckResult | null> {
    const checker = new KPIComplianceChecker();
    try {
      const result = await checker.prisma.complianceCheckResult.findFirst({
        where: { period, standard },
        include: { missingKpis: true },
        orderBy: { checkedAt: 'desc' }
      });

      if (!result) return null;

      return {
        id: result.id,
        period: result.period,
        standard: result.standard as ComplianceStandard,
        checkedAt: result.checkedAt,
        totalKpis: result.totalKpis,
        missingKpis: result.missingKpis.map((kpi: any) => ({
          kpiId: kpi.kpiId,
          kpiName: kpi.kpiName,
          category: kpi.category,
          severity: kpi.severity as ComplianceSeverity,
          standard: result.standard as ComplianceStandard,
          expectedUnit: kpi.expectedUnit,
          lastUpdated: kpi.lastUpdated || undefined
        })),
        criticalMissing: result.criticalMissing,
        warningMissing: result.warningMissing,
        complianceRate: result.complianceRate,
        status: result.status as 'compliant' | 'warning' | 'critical'
      };
    } finally {
      await checker.dispose();
    }
  }

  /**
   * 過去の結果を取得
   */
  async getComplianceHistory(standard?: ComplianceStandard, limit: number = 10): Promise<ComplianceCheckResult[]> {
    const results = await this.prisma.complianceCheckResult.findMany({
      where: standard ? { standard } : {},
      include: {
        missingKpis: true
      },
      orderBy: {
        checkedAt: 'desc'
      },
      take: limit
    });

    return results.map(result => ({
      id: result.id,
      period: result.period,
      standard: result.standard as ComplianceStandard,
      checkedAt: result.checkedAt,
      totalKpis: result.totalKpis,
      missingKpis: result.missingKpis.map((kpi: any) => ({
        kpiId: kpi.kpiId,
        kpiName: kpi.kpiName,
        category: kpi.category,
        severity: kpi.severity as ComplianceSeverity,
        standard: result.standard as ComplianceStandard,
        expectedUnit: kpi.expectedUnit,
        lastUpdated: kpi.lastUpdated || undefined
      })),
      criticalMissing: result.criticalMissing,
      warningMissing: result.warningMissing,
      complianceRate: result.complianceRate,
      status: result.status as 'compliant' | 'warning' | 'critical'
    }));
  }

  /**
   * リソースクリーンアップ
   */
  async dispose(): Promise<void> {
    await this.prisma.$disconnect();
  }
}