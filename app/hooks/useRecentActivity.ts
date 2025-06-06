import { useState, useEffect, useCallback, useRef } from 'react';

export interface ActivityItem {
  id: string;
  type: 'upload' | 'compliance' | 'notification' | 'audit';
  title: string;
  description: string;
  status: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
  user: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface ActivityResponse {
  activities: ActivityItem[];
  total: number;
  lastUpdated: string;
  error?: string;
}

interface UseRecentActivityOptions {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // ミリ秒
}

export function useRecentActivity(options: UseRecentActivityOptions = {}) {
  const {
    limit = 10,
    autoRefresh = true,
    refreshInterval = 30000 // 30秒
  } = options;

  const [data, setData] = useState<ActivityResponse>({
    activities: [],
    total: 0,
    lastUpdated: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch(`/api/dashboard/activity?limit=${limit}`);
      const result: ActivityResponse = await response.json();

      if (!isMountedRef.current) return;

      if (response.ok) {
        setData(result);
        setError(null);
      } else {
        setError(result.error || 'アクティビティの取得に失敗しました');
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'ネットワークエラーが発生しました';
      setError(errorMessage);
      console.error('アクティビティ取得エラー:', err);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [limit]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchActivities();
  }, [fetchActivities]);

  // 初期データロード
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // 自動リフレッシュ設定
  useEffect(() => {
    if (!autoRefresh) return;

    intervalRef.current = setInterval(() => {
      fetchActivities();
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchActivities]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 相対時間フォーマット関数
  const formatRelativeTime = useCallback((timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return '今すぐ';
    } else if (minutes < 60) {
      return `${minutes}分前`;
    } else if (hours < 24) {
      return `${hours}時間前`;
    } else if (days < 7) {
      return `${days}日前`;
    } else {
      return time.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }, []);

  // ステータスアイコンとカラーの取得
  const getStatusConfig = useCallback((status: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return {
          icon: '✅',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'warning':
        return {
          icon: '⚠️',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'error':
        return {
          icon: '❌',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'info':
      default:
        return {
          icon: 'ℹ️',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
    }
  }, []);

  return {
    activities: data.activities,
    total: data.total,
    lastUpdated: data.lastUpdated,
    isLoading,
    error,
    refresh,
    formatRelativeTime,
    getStatusConfig,
    // 統計情報
    stats: {
      successCount: data.activities.filter(a => a.status === 'success').length,
      warningCount: data.activities.filter(a => a.status === 'warning').length,
      errorCount: data.activities.filter(a => a.status === 'error').length,
      infoCount: data.activities.filter(a => a.status === 'info').length,
    }
  };
} 