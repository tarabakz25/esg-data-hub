import { PrismaClient } from '../../../../generated/prisma';
import { KPIComplianceChecker } from './kpi-compliance-checker';
import { ComplianceCheckOptions } from '../../../types/services/compliance';

// 実際のDBを使った統合テスト
describe('KPI Compliance Checker Integration', () => {
  let prisma: PrismaClient;
  let checker: KPIComplianceChecker;

  beforeAll(async () => {
    prisma = new PrismaClient();
    checker = new KPIComplianceChecker();
  });

  afterAll(async () => {
    // テスト後のクリーンアップ
    await prisma.complianceCheckResult.deleteMany();
    await prisma.missingKpi.deleteMany();
    await prisma.$disconnect();
    await checker.dispose();
  });

  beforeEach(async () => {
    // 各テスト前にコンプライアンス結果をクリア
    await prisma.complianceCheckResult.deleteMany();
  });

  it('実際のDBでコンプライアンスチェックを実行できる', async () => {
    const options: ComplianceCheckOptions = {
      period: '2024Q4',
      standards: ['issb'],
      includeWarnings: true
    };

    console.log('🧪 統合テスト開始: 2024Q4期間でISSB基準チェック');

    const result = await checker.checkComplianceForPeriod(options);

    // 結果の基本検証
    expect(result.period).toBe('2024Q4');
    expect(result.standard).toBe('issb');
    expect(result.totalKpis).toBeGreaterThan(0);
    expect(result.missingKpis).toBeDefined();
    expect(result.complianceRate).toBeGreaterThanOrEqual(0);
    expect(result.complianceRate).toBeLessThanOrEqual(100);
    expect(['compliant', 'warning', 'critical']).toContain(result.status);

    console.log(`📊 結果: ${result.missingKpis.length}件の欠損KPI検出`);
    console.log(`📈 コンプライアンス率: ${result.complianceRate.toFixed(1)}%`);
    console.log(`🚨 ステータス: ${result.status}`);

    // DBに保存されているか確認
    const savedResult = await prisma.complianceCheckResult.findFirst({
      where: {
        period: '2024Q4',
        standard: 'issb'
      },
      include: {
        missingKpis: true
      }
    });

    expect(savedResult).toBeTruthy();
    expect(savedResult?.missingKpis.length).toBe(result.missingKpis.length);
  });

  it('複数の基準でテストできる', async () => {
    const standards = ['issb', 'csrd'] as const;
    
    for (const standard of standards) {
      console.log(`🔍 ${standard.toUpperCase()}基準でテスト中...`);
      
      const options: ComplianceCheckOptions = {
        period: '2024Q4',
        standards: [standard],
        includeWarnings: false // critical のみ
      };

      const result = await checker.checkComplianceForPeriod(options);
      
      expect(result.standard).toBe(standard);
      expect(result.warningMissing).toBe(0); // warningは含まない設定
      
      console.log(`  → ${standard}: ${result.criticalMissing}件のcritical欠損`);
    }
  });

  it('履歴取得機能が動作する', async () => {
    // まず2つの結果を作成
    await checker.checkComplianceForPeriod({
      period: '2024Q3',
      standards: ['issb']
    });

    await checker.checkComplianceForPeriod({
      period: '2024Q4', 
      standards: ['issb']
    });

    // 履歴を取得
    const history = await checker.getComplianceHistory('issb', 5);
    
    expect(history.length).toBeGreaterThanOrEqual(2);
    expect(history[0].checkedAt.getTime()).toBeGreaterThanOrEqual(history[1].checkedAt.getTime());
    
    console.log(`📋 履歴取得: ${history.length}件の結果を確認`);
  });

  it('期間形式の解析が正しく動作する', async () => {
    const periods = ['2024Q1', '2024Q2', '2024-11', '2024-12'];
    
    for (const period of periods) {
      console.log(`📅 期間形式テスト: ${period}`);
      
      const result = await checker.checkComplianceForPeriod({
        period,
        standards: ['custom'] // 少ないKPIで高速テスト
      });
      
      expect(result.period).toBe(period);
      console.log(`  → ${period}: 正常処理完了`);
    }
  });
}); 