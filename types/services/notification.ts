import { ComplianceCheckResult, ComplianceSeverity } from './compliance';

/**
 * 通知の種類
 */
export type NotificationType = 'compliance_missing' | 'compliance_warning' | 'system_alert';

/**
 * 通知の優先度レベル
 */
export type NotificationPriority = 'high' | 'medium' | 'low';

/**
 * 通知アイテム
 */
export interface NotificationItem {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  severity?: ComplianceSeverity;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  // コンプライアンス関連の詳細情報
  complianceDetails?: {
    period: string;
    standard: string;
    missingKpis: Array<{
      kpiId: string;
      kpiName: string;
      category: string;
    }>;
    complianceRate: number;
  };
  // アクション可能な場合のリンク
  actionUrl?: string;
}

/**
 * 通知一覧の応答
 */
export interface NotificationListResponse {
  notifications: NotificationItem[];
  totalCount: number;
  unreadCount: number;
  hasMore: boolean;
}

/**
 * 通知フィルター
 */
export interface NotificationFilter {
  type?: NotificationType[];
  priority?: NotificationPriority[];
  isRead?: boolean;
  limit?: number;
  offset?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * 通知作成データ
 */
export interface CreateNotificationData {
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  severity?: ComplianceSeverity;
  complianceDetails?: NotificationItem['complianceDetails'];
  actionUrl?: string;
}

/**
 * 通知設定
 */
export interface NotificationSettings {
  enableSound: boolean;
  enableDesktop: boolean;
  criticalOnly: boolean;
  pollingInterval: number; // milliseconds
}

/**
 * 通知統計
 */
export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  criticalUnread: number;
  warningUnread: number;
  todayNotifications: number;
} 