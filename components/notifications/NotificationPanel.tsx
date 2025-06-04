'use client';

import React, { useState } from 'react';
import { X, Settings, RotateCcw, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useUnreadNotifications } from '../../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import type { NotificationStats } from '@/lib/services/notification';

interface NotificationPanelProps {
  onClose: () => void;
  stats?: NotificationStats;
}

/**
 * 通知パネルコンポーネント
 */
export function NotificationPanel({ onClose, stats }: NotificationPanelProps) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const { notifications, isLoading, error, refresh, markAsRead } = useUnreadNotifications();

  // フィルタリングされた通知
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return notification.severity === filter;
  });

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('既読処理に失敗しました:', error);
    }
  };

  return (
    <div className="w-96 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">通知</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={refresh}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="更新"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 統計表示 */}
      {stats && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              未読: {stats.unreadNotifications}件
            </span>
            {stats.criticalUnread > 0 && (
              <span className="flex items-center text-red-600 font-medium">
                <AlertCircle className="w-4 h-4 mr-1" />
                緊急: {stats.criticalUnread}件
              </span>
            )}
          </div>
        </div>
      )}

      {/* フィルター */}
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === 'critical'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <AlertCircle className="w-3 h-3 inline mr-1" />
            緊急
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === 'warning'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            警告
          </button>
        </div>
      </div>

      {/* 通知一覧 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm">読み込み中...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">通知の読み込みに失敗しました</p>
            <button
              onClick={refresh}
              className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
            >
              再試行
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Info className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">
              {filter === 'all' 
                ? '新しい通知はありません' 
                : `${filter === 'critical' ? '緊急' : '警告'}通知はありません`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {/* フッター */}
      {filteredNotifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              // 全通知ページへのリンク（後で実装）
              onClose();
            }}
            className="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            すべての通知を表示
          </button>
        </div>
      )}
    </div>
  );
} 