"use client";

import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

// APIレスポンスの型定義
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// 最適化されたクエリオプション（カスタムプロパティを除外）
interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<ApiResponse<T>>, 'queryKey' | 'queryFn'> {
  enablePolling?: boolean;
  pollingInterval?: number;
}

/**
 * パフォーマンス最適化されたクエリフック
 * - 自動リトライ機能
 * - エラーハンドリング強化
 * - キャッシュ最適化
 * - ポーリング機能
 */
export function useOptimizedQuery<T>(
  queryKey: string[],
  url: string,
  options: OptimizedQueryOptions<T> = {}
) {
  const queryClient = useQueryClient();

  // メモ化されたfetch関数
  const fetchData = useCallback(async (): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        // HTTPエラーレスポンスの詳細を取得
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      // ネットワークエラーの場合の詳細処理
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('ネットワークエラー: インターネット接続を確認してください');
      }
      throw error;
    }
  }, [url]);

  // クエリオプションの最適化
  const optimizedOptions = useMemo(() => {
    const baseOptions = {
      staleTime: 2 * 60 * 1000, // デフォルト2分
      retry: (failureCount: number, error: any) => {
        // カスタムリトライロジック
        if (error?.message?.includes('ネットワークエラー')) {
          return failureCount < 2; // ネットワークエラーは2回まで
        }
        if (error?.message?.includes('HTTP 4')) {
          return false; // 4xxエラーはリトライしない
        }
        return failureCount < 3; // その他は3回まで
      },
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
    };

    // refetchIntervalの設定
    if (options.enablePolling) {
      return {
        ...baseOptions,
        refetchInterval: options.pollingInterval || 30000,
      };
    } else {
      return baseOptions;
    }
  }, [options]);

  const query = useQuery({
    queryKey,
    queryFn: fetchData,
    ...optimizedOptions,
  });

  // 手動更新関数
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  // キャッシュクリア関数
  const clearCache = useCallback(() => {
    queryClient.removeQueries({ queryKey });
  }, [queryClient, queryKey]);

  // 最適化されたデータ抽出
  const data = useMemo(() => {
    if (query.data?.data) {
      return query.data.data;
    }
    return query.data;
  }, [query.data]);

  // エラーメッセージの最適化
  const errorMessage = useMemo(() => {
    if (query.error) {
      const error = query.error as Error;
      return error.message || '不明なエラーが発生しました';
    }
    return null;
  }, [query.error]);

  return {
    data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage,
    isFetching: query.isFetching,
    isStale: query.isStale,
    refresh,
    clearCache,
    // 生のqueryオブジェクトも公開（高度な用途向け）
    query,
  };
}

/**
 * 累積KPI専用の最適化クエリ
 */
export function useCumulativeKPIs() {
  return useOptimizedQuery(
    ['cumulative-kpis'],
    '/api/dashboard/cumulative-kpis',
    {
      enablePolling: true,
      pollingInterval: 60000, // 1分間隔で自動更新
    }
  );
}

/**
 * ファイル履歴専用の最適化クエリ
 */
export function useFileHistory() {
  return useOptimizedQuery(
    ['file-history'],
    '/api/dashboard/file-history',
    {
      enablePolling: false, // 手動更新のみ
    }
  );
}

/**
 * ファイル詳細専用の最適化クエリ
 */
export function useFileDetails(fileId: string) {
  return useOptimizedQuery(
    ['file-details', fileId],
    `/api/dashboard/file-details/${fileId}`,
    {
      enabled: !!fileId, // fileIdがある場合のみクエリを実行
    }
  );
} 