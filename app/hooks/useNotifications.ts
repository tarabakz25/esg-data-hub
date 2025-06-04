'use client';

import useSWR, { mutate } from 'swr';
import { useState, useCallback } from 'react';
import type { 
  NotificationListResponse, 
  NotificationFilter, 
  NotificationStats,
  NotificationItem 
} from '@/types/services/notification';

const API_BASE = '/api';

// フェッチャー関数
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  return response.json();
};

/**
 * 通知管理用Hook
 */
export function useNotifications(filter?: NotificationFilter) {
  // クエリパラメータの構築
  const queryParams = new URLSearchParams();
  if (filter?.type?.length) queryParams.set('type', filter.type.join(','));
  if (filter?.priority?.length) queryParams.set('priority', filter.priority.join(','));
  if (filter?.isRead !== undefined) queryParams.set('isRead', filter.isRead.toString());
  if (filter?.limit) queryParams.set('limit', filter.limit.toString());
  if (filter?.offset) queryParams.set('offset', filter.offset.toString());

  const notificationsUrl = `${API_BASE}/notifications?${queryParams.toString()}`;
  const statsUrl = `${API_BASE}/notifications/stats`;

  // 通知一覧の取得
  const { 
    data: notificationsData, 
    error: notificationsError, 
    isLoading: notificationsLoading,
    mutate: mutateNotifications 
  } = useSWR<NotificationListResponse>(
    notificationsUrl, 
    fetcher,
    {
      refreshInterval: 30000, // 30秒ごとにポーリング
      dedupingInterval: 5000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // 通知統計の取得
  const { 
    data: statsData, 
    error: statsError, 
    isLoading: statsLoading,
    mutate: mutateStats 
  } = useSWR<NotificationStats>(
    statsUrl, 
    fetcher,
    {
      refreshInterval: 60000, // 1分ごとにポーリング
      dedupingInterval: 10000,
    }
  );

  // 通知を既読にする
  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      // 通知一覧と統計を再取得
      await Promise.all([
        mutateNotifications(),
        mutateStats()
      ]);
    } catch (error) {
      console.error('通知既読エラー:', error);
      throw error;
    }
  }, [mutateNotifications, mutateStats]);

  // 新しい通知を作成
  const createNotification = useCallback(async (data: {
    type: string;
    priority: string;
    title: string;
    message: string;
    severity?: string;
    actionUrl?: string;
  }): Promise<NotificationItem> => {
    try {
      const response = await fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const notification = await response.json();

      // 通知一覧と統計を再取得
      await Promise.all([
        mutateNotifications(),
        mutateStats()
      ]);

      return notification;
    } catch (error) {
      console.error('通知作成エラー:', error);
      throw error;
    }
  }, [mutateNotifications, mutateStats]);

  // 手動でリフレッシュ
  const refresh = useCallback(async () => {
    await Promise.all([
      mutateNotifications(),
      mutateStats()
    ]);
  }, [mutateNotifications, mutateStats]);

  return {
    // 通知一覧
    notifications: notificationsData?.notifications || [],
    totalCount: notificationsData?.totalCount || 0,
    unreadCount: notificationsData?.unreadCount || 0,
    hasMore: notificationsData?.hasMore || false,
    
    // 統計
    stats: statsData,
    
    // ローディング状態
    isLoading: notificationsLoading || statsLoading,
    
    // エラー
    error: notificationsError || statsError,
    
    // アクション
    markAsRead,
    createNotification,
    refresh,
  };
}

/**
 * 未読通知のみを取得するHook
 */
export function useUnreadNotifications() {
  return useNotifications({ isRead: false, limit: 10 });
}

/**
 * 通知統計のみを取得するHook
 */
export function useNotificationStats() {
  const { data, error, isLoading, mutate } = useSWR<NotificationStats>(
    `${API_BASE}/notifications/stats`,
    fetcher,
    {
      refreshInterval: 60000,
      dedupingInterval: 10000,
    }
  );

  return {
    stats: data,
    isLoading,
    error,
    refresh: mutate,
  };
} 