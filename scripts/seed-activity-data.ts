import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedActivityData() {
  console.log('🌱 アクティビティテストデータの作成を開始...');

  try {
    // テストユーザーの作成
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'テストユーザー',
        role: 'admin',
        department: 'ESG推進室'
      }
    });

    // サンプルアップロードデータの作成
    const uploads = await Promise.all([
      prisma.upload.create({
        data: {
          filename: 'esg-data-2024-q1.csv',
          s3Key: 'uploads/esg-data-2024-q1.csv',
          status: 'parsed',
          userId: testUser.id,
          createdAt: new Date(Date.now() - 1000 * 60 * 5) // 5分前
        }
      }),
      prisma.upload.create({
        data: {
          filename: 'environmental-data.csv',
          s3Key: 'uploads/environmental-data.csv',
          status: 'parsed',
          userId: testUser.id,
          createdAt: new Date(Date.now() - 1000 * 60 * 15) // 15分前
        }
      }),
      prisma.upload.create({
        data: {
          filename: 'social-metrics.csv',
          s3Key: 'uploads/social-metrics.csv',
          status: 'errored',
          userId: testUser.id,
          createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30分前
        }
      })
    ]);

    // サンプルコンプライアンスチェック結果の作成
    const complianceCheck = await prisma.complianceCheckResult.create({
      data: {
        period: '2024-Q1',
        standard: 'TCFD',
        totalKpis: 25,
        criticalMissing: 2,
        warningMissing: 3,
        complianceRate: 88.0,
        status: 'warning',
        createdAt: new Date(Date.now() - 1000 * 60 * 10) // 10分前
      }
    });

    // サンプル通知の作成
    const notifications = await Promise.all([
      prisma.notification.create({
        data: {
          type: 'compliance_missing',
          priority: 'high',
          title: 'KPI欠損アラート',
          message: 'TCFD基準でScope1排出量データが不足しています',
          severity: 'critical',
          complianceCheckResultId: complianceCheck.id,
          userId: testUser.id,
          isRead: false,
          actionUrl: '/compliance',
          createdAt: new Date(Date.now() - 1000 * 60 * 2) // 2分前
        }
      }),
      prisma.notification.create({
        data: {
          type: 'system_alert',
          priority: 'medium',
          title: 'システムメンテナンス通知',
          message: '本日午前2時よりシステムメンテナンスを実施予定です',
          userId: testUser.id,
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60) // 1時間前
        }
      })
    ]);

    // サンプル監査ログの作成
    const auditLogs = await Promise.all([
      prisma.auditTrail.create({
        data: {
          tableName: 'Upload',
          recordId: BigInt(uploads[0].id),
          action: 'INSERT',
          payloadHash: 'hash123abc',
          userId: testUser.id.toString(),
          ipAddress: '192.168.1.100',
          createdAt: new Date(Date.now() - 1000 * 60 * 7) // 7分前
        }
      }),
      prisma.auditTrail.create({
        data: {
          tableName: 'ComplianceCheckResult',
          recordId: BigInt(1),
          action: 'UPDATE',
          payloadHash: 'hash456def',
          userId: testUser.id.toString(),
          ipAddress: '192.168.1.100',
          createdAt: new Date(Date.now() - 1000 * 60 * 20) // 20分前
        }
      })
    ]);

    console.log('✅ アクティビティテストデータの作成が完了しました');
    console.log(`👤 テストユーザー: ${testUser.name} (${testUser.email})`);
    console.log(`📁 作成されたアップロード: ${uploads.length}件`);
    console.log(`🔍 作成されたコンプライアンスチェック: 1件`);
    console.log(`🔔 作成された通知: ${notifications.length}件`);
    console.log(`📋 作成された監査ログ: ${auditLogs.length}件`);

  } catch (error) {
    console.error('❌ テストデータ作成エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  seedActivityData();
}

export default seedActivityData; 