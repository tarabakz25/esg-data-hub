import { PrismaClient } from '@prisma/client';

/**
 * 簡単なコンプライアンス機能のテスト
 * DB接続とテーブル作成の確認
 */
async function testBasicCompliance() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔗 DB接続テスト...');
    
    // 1. 基本的なDB接続確認
    await prisma.$connect();
    console.log('✅ DB接続成功');
    
    // 2. テーブル存在確認
    console.log('📋 テーブル存在確認...');
    
    // ComplianceCheckResultテーブルの確認
    const complianceCount = await prisma.complianceCheckResult.count();
    console.log(`✅ ComplianceCheckResult テーブル: ${complianceCount}件`);
    
    // MissingKpiテーブルの確認  
    const missingKpiCount = await prisma.missingKpi.count();
    console.log(`✅ MissingKpi テーブル: ${missingKpiCount}件`);
    
    // 3. 簡単なデータ挿入テスト
    console.log('💾 データ挿入テスト...');
    
    const testResult = await prisma.complianceCheckResult.create({
      data: {
        id: 'test-basic-' + Date.now(),
        period: '2024Q4',
        standard: 'issb',
        totalKpis: 10,
        criticalMissing: 2,
        warningMissing: 3,
        complianceRate: 50.0,
        status: 'warning'
      }
    });
    
    console.log(`✅ データ挿入成功: ${testResult.id}`);
    
    // 4. データ取得テスト
    const retrievedResult = await prisma.complianceCheckResult.findUnique({
      where: { id: testResult.id }
    });
    
    console.log(`✅ データ取得成功: ${retrievedResult?.period}`);
    
    // 5. クリーンアップ
    await prisma.complianceCheckResult.delete({
      where: { id: testResult.id }
    });
    
    console.log('✅ テストデータクリーンアップ完了');
    console.log('🎉 全ての基本テストが成功しました！');
    
  } catch (error) {
    console.error('❌ テストエラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
if (require.main === module) {
  testBasicCompliance()
    .then(() => {
      console.log('✨ テスト完了');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 テスト失敗:', error);
      process.exit(1);
    });
}

export { testBasicCompliance }; 