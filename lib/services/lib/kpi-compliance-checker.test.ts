import { KPIComplianceChecker } from './kpi-compliance-checker';
import { ComplianceCheckOptions } from '../../../types/services/compliance';

// モックデータ
const mockKpiValues = [
  { kpiId: 'CO2_SCOPE1', period: new Date('2024-07-01') },
  { kpiId: 'REVENUE', period: new Date('2024-07-15') },
  { kpiId: 'EMPLOYEE_COUNT', period: new Date('2024-08-01') }
];

// Prismaクライアントのモック
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    kPIValue: {
      findMany: jest.fn().mockResolvedValue(mockKpiValues)
    },
    complianceCheckResult: {
      deleteMany: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({
        id: 'test-id',
        period: '2024Q3',
        standard: 'issb'
      }),
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null)
    },
    notification: {
      create: jest.fn().mockResolvedValue({})
    },
    $disconnect: jest.fn().mockResolvedValue(undefined)
  }))
}));

describe('KPIComplianceChecker', () => {
  let checker: KPIComplianceChecker;

  beforeEach(() => {
    checker = new KPIComplianceChecker();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await checker.dispose();
  });

  describe('checkComplianceForPeriod', () => {
    it('必須KPI欠損を正しく検出する', async () => {
      const options: ComplianceCheckOptions = {
        period: '2024Q3',
        standards: ['issb'],
        includeWarnings: true
      };

      const result = await checker.checkComplianceForPeriod(options);

      // 検証
      expect(result.period).toBe('2024Q3');
      expect(result.standard).toBe('issb');
      expect(result.missingKpis.length).toBeGreaterThan(0);
      
      // CO2_SCOPE2が欠損していることを確認（mockデータにはない）
      const missingCO2Scope2 = result.missingKpis.find(kpi => kpi.kpiId === 'CO2_SCOPE2');
      expect(missingCO2Scope2).toBeDefined();
      expect(missingCO2Scope2?.severity).toBe('critical');

      // コンプライアンス率の計算確認
      expect(result.complianceRate).toBeLessThan(100);
      expect(result.status).toBe('critical'); // criticalな欠損があるため
    });

    it('全てのKPIが存在する場合はcompliantステータスになる', async () => {
      // 全ての必須KPIが存在するモックデータを設定
      const completeKpiValues = [
        'CO2_SCOPE1', 'CO2_SCOPE2', 'ENERGY_USE', 'EMPLOYEE_COUNT', 'REVENUE', 'BOARD_INDEPENDENCE',
        'RENEWABLE_ENERGY', 'WATER_USE', 'WASTE_TOTAL', 'FEMALE_RATIO', 'TRAINING_HOURS'
      ].map(kpiId => ({ kpiId, period: new Date('2024-07-01') }));

      const mockPrisma = (checker as any).prisma;
      mockPrisma.kPIValue.findMany.mockResolvedValueOnce(completeKpiValues);

      const options: ComplianceCheckOptions = {
        period: '2024Q3',
        standards: ['issb'],
        includeWarnings: true
      };

      const result = await checker.checkComplianceForPeriod(options);

      expect(result.missingKpis.length).toBe(0);
      expect(result.complianceRate).toBe(100);
      expect(result.status).toBe('compliant');
    });

    it('warning レベルのみ欠損の場合は warning ステータスになる', async () => {
      // critical KPIは全て存在、warning KPI のみ欠損
      const partialKpiValues = [
        'CO2_SCOPE1', 'CO2_SCOPE2', 'ENERGY_USE', 'EMPLOYEE_COUNT', 'REVENUE', 'BOARD_INDEPENDENCE'
      ].map(kpiId => ({ kpiId, period: new Date('2024-07-01') }));

      const mockPrisma = (checker as any).prisma;
      mockPrisma.kPIValue.findMany.mockResolvedValueOnce(partialKpiValues);

      const options: ComplianceCheckOptions = {
        period: '2024Q3',
        standards: ['issb'],
        includeWarnings: true
      };

      const result = await checker.checkComplianceForPeriod(options);

      expect(result.criticalMissing).toBe(0);
      expect(result.warningMissing).toBeGreaterThan(0);
      expect(result.status).toBe('warning');
    });

    it('期間形式を正しく解析する', async () => {
      // 四半期形式のテスト
      const options: ComplianceCheckOptions = {
        period: '2024Q2',
        standards: ['issb']
      };

      await checker.checkComplianceForPeriod(options);

      // Prismaクエリが正しい期間で呼ばれているか確認
      const mockPrisma = (checker as any).prisma;
      const findManyCall = mockPrisma.kPIValue.findMany.mock.calls[0][0];
      
      expect(findManyCall.where.period.gte).toEqual(new Date('2024-04-01'));
      expect(findManyCall.where.period.lte.getMonth()).toBe(5); // 6月（0ベース）
    });

    it('無効な期間形式でエラーを投げる', async () => {
      const options: ComplianceCheckOptions = {
        period: 'invalid-period',
        standards: ['issb']
      };

      await expect(checker.checkComplianceForPeriod(options)).rejects.toThrow(
        'サポートされていない期間形式: invalid-period'
      );
    });
  });

  describe('静的メソッドのテスト', () => {
    it('getCheckResult - 過去の結果を取得する', async () => {
      const mockHistoryData = {
        id: 'test-history-id',
        period: '2024Q2',
        standard: 'issb',
        checkedAt: new Date(),
        totalKpis: 10,
        criticalMissing: 1,
        warningMissing: 2,
        complianceRate: 70.0,
        status: 'warning',
        missingKpis: [{
          id: 1,
          kpiId: 'CO2_SCOPE2',
          kpiName: 'Scope2 排出量',
          category: 'Environment',
          severity: 'critical',
          expectedUnit: 't-CO2',
          lastUpdated: null,
          complianceCheckResultId: 'test-history-id',
          createdAt: new Date()
        }]
      };

      // 静的メソッド内で使用されるPrismaクライアントをモック
      const mockPrisma = new (require('@prisma/client').PrismaClient)();
      mockPrisma.complianceCheckResult.findFirst.mockResolvedValueOnce(mockHistoryData);

      const result = await KPIComplianceChecker.getCheckResult('2024Q2', 'issb');

      expect(result).toBeDefined();
      expect(result?.period).toBe('2024Q2');
      expect(result?.standard).toBe('issb');
    });
  });
}); 