import { PrismaClient } from '@prisma/client';
import { 
  type CreateNotificationData, 
  type NotificationItem,
  type NotificationType,
  type NotificationPriority 
} from '../../../types/services/notification';
import { type ComplianceCheckResult, type ComplianceSeverity } from '../../../types/services/compliance';

// Prismaクライアントの初期化
const prisma = new PrismaClient();

/**
 * 通知作成サービス
 */
export class NotificationService {
  /**
   * 通知を作成
   */
  static async createNotification(data: CreateNotificationData): Promise<NotificationItem> {
    const notification = await prisma.notification.create({
      data: {
        type: data.type,
        priority: data.priority,
        title: data.title,
        message: data.message,
        severity: data.severity,
        actionUrl: data.actionUrl,
      },
      include: {
        complianceCheckResult: {
          include: {
            missingKpis: true
          }
        }
      }
    });

    return this.mapToNotificationItem(notification);
  }

  /**
   * コンプライアンスチェック結果から通知を作成
   */
  static async createComplianceNotifications(
    checkResult: ComplianceCheckResult
  ): Promise<NotificationItem[]> {
    const notifications: NotificationItem[] = [];

    // クリティカルな問題がある場合
    if (checkResult.criticalMissing > 0) {
      const criticalNotification = await this.createNotification({
        type: 'compliance_missing',
        priority: 'high',
        title: `重要なKPIが不足しています - ${checkResult.period}`,
        message: `${checkResult.standard.toUpperCase()}基準で${checkResult.criticalMissing}個のクリティカルなKPIが不足しています。`,
        severity: 'critical',
        complianceDetails: {
          period: checkResult.period,
          standard: checkResult.standard,
          missingKpis: [], // これは後で設定
          complianceRate: checkResult.complianceRate
        },
        actionUrl: `/compliance/check?period=${checkResult.period}&standard=${checkResult.standard}`
      });
      notifications.push(criticalNotification);
    }

    // 警告レベルの問題がある場合
    if (checkResult.warningMissing > 0) {
      const warningNotification = await this.createNotification({
        type: 'compliance_warning',
        priority: 'medium',
        title: `KPIの確認が必要です - ${checkResult.period}`,
        message: `${checkResult.standard.toUpperCase()}基準で${checkResult.warningMissing}個のKPIの確認が必要です。`,
        severity: 'warning',
        complianceDetails: {
          period: checkResult.period,
          standard: checkResult.standard,
          missingKpis: [], // これは後で設定
          complianceRate: checkResult.complianceRate
        },
        actionUrl: `/compliance/check?period=${checkResult.period}&standard=${checkResult.standard}`
      });
      notifications.push(warningNotification);
    }

    return notifications;
  }

  /**
   * コンプライアンスチェック完了後に通知を作成（データベースの結果を使用）
   */
  static async createNotificationsFromCheckResult(checkResultId: string): Promise<NotificationItem[]> {
    const checkResult = await prisma.complianceCheckResult.findUnique({
      where: { id: checkResultId },
      include: { missingKpis: true }
    });

    if (!checkResult) {
      throw new Error('コンプライアンスチェック結果が見つかりません');
    }

    const notifications: NotificationItem[] = [];

    // クリティカルな問題がある場合
    if (checkResult.criticalMissing > 0) {
      const criticalKpis = checkResult.missingKpis.filter((kpi: any) => kpi.severity === 'critical');
      const notification = await prisma.notification.create({
        data: {
          type: 'compliance_missing',
          priority: 'high',
          title: `重要なKPIが不足しています - ${checkResult.period}`,
          message: `${checkResult.standard.toUpperCase()}基準で${checkResult.criticalMissing}個のクリティカルなKPIが不足しています。`,
          severity: 'critical',
          complianceCheckResultId: checkResult.id,
          actionUrl: `/compliance/check?period=${checkResult.period}&standard=${checkResult.standard}`
        },
        include: {
          complianceCheckResult: {
            include: {
              missingKpis: true
            }
          }
        }
      });
      notifications.push(this.mapToNotificationItem(notification));
    }

    // 警告レベルの問題がある場合
    if (checkResult.warningMissing > 0) {
      const warningKpis = checkResult.missingKpis.filter((kpi: any) => kpi.severity === 'warning');
      const notification = await prisma.notification.create({
        data: {
          type: 'compliance_warning',
          priority: 'medium',
          title: `KPIの確認が必要です - ${checkResult.period}`,
          message: `${checkResult.standard.toUpperCase()}基準で${checkResult.warningMissing}個のKPIの確認が必要です。`,
          severity: 'warning',
          complianceCheckResultId: checkResult.id,
          actionUrl: `/compliance/check?period=${checkResult.period}&standard=${checkResult.standard}`
        },
        include: {
          complianceCheckResult: {
            include: {
              missingKpis: true
            }
          }
        }
      });
      notifications.push(this.mapToNotificationItem(notification));
    }

    return notifications;
  }

  /**
   * 通知の既読処理
   */
  static async markAsRead(notificationId: string): Promise<NotificationItem> {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, updatedAt: new Date() },
      include: {
        complianceCheckResult: {
          include: {
            missingKpis: true
          }
        }
      }
    });

    return this.mapToNotificationItem(notification);
  }

  /**
   * 一括既読処理
   */
  static async markAllAsRead(): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true, updatedAt: new Date() }
    });

    return result.count;
  }

  /**
   * Prismaの結果をNotificationItem型にマップ
   */
  private static mapToNotificationItem(notification: any): NotificationItem {
    return {
      id: notification.id,
      type: notification.type,
      priority: notification.priority,
      title: notification.title,
      message: notification.message,
      severity: notification.severity || undefined,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      actionUrl: notification.actionUrl || undefined,
      complianceDetails: notification.complianceCheckResult ? {
        period: notification.complianceCheckResult.period,
        standard: notification.complianceCheckResult.standard,
        missingKpis: notification.complianceCheckResult.missingKpis.map((mk: any) => ({
          kpiId: mk.kpiId,
          kpiName: mk.kpiName,
          category: mk.category
        })),
        complianceRate: notification.complianceCheckResult.complianceRate
      } : undefined
    };
  }
} 