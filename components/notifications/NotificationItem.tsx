'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, Info, ExternalLink, Clock } from 'lucide-react';
import type { NotificationItem as NotificationItemType } from '@/lib/services/notification';

interface NotificationItemProps {
  notification: NotificationItemType;
  onMarkAsRead: (notificationId: string) => void;
  onClose: () => void;
}

/**
 * 通知アイテムコンポーネント
 */
export function NotificationItem({ notification, onMarkAsRead, onClose }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      // 外部リンクの場合は新しいタブで開く
      if (notification.actionUrl.startsWith('http')) {
        window.open(notification.actionUrl, '_blank');
      } else {
        // 内部リンクの場合はルーターで遷移（後で実装）
        window.location.href = notification.actionUrl;
      }
      onClose();
    }
  };

  const getSeverityIcon = () => {
    switch (notification.severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" size={20} />;
      default:
        return <Info className="w-5 h-5 text-blue-500" size={20} />;
    }
  };

  const getSeverityColor = () => {
    switch (notification.severity) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'たった今';
    if (diffInMinutes < 60) return `${diffInMinutes}分前`;
    if (diffInHours < 24) return `${diffInHours}時間前`;
    if (diffInDays < 7) return `${diffInDays}日前`;
    
    return new Date(date).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${getSeverityColor()} ${
        !notification.isRead ? 'font-medium' : 'opacity-75'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* 重要度アイコン */}
        <div className="flex-shrink-0 mt-0.5">
          {getSeverityIcon()}
        </div>

        {/* 通知内容 */}
        <div className="flex-1 min-w-0">
          {/* タイトル */}
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {notification.title}
          </h4>

          {/* メッセージ */}
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {notification.message}
          </p>

          {/* コンプライアンス詳細 */}
          {notification.complianceDetails && (
            <div className="mt-2 text-xs text-gray-500">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                {notification.complianceDetails.standard.toUpperCase()} • {notification.complianceDetails.period}
              </span>
              <span className="ml-2">
                適合率: {notification.complianceDetails.complianceRate.toFixed(1)}%
              </span>
            </div>
          )}

          {/* フッター */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" size={12} />
              {formatTimeAgo(notification.createdAt)}
            </div>

            {notification.actionUrl && (
              <div className="flex items-center text-xs text-blue-600">
                <span className="mr-1">詳細</span>
                <ExternalLink className="w-3 h-3" size={12} />
              </div>
            )}
          </div>
        </div>

        {/* 未読インジケーター */}
        {!notification.isRead && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
} 