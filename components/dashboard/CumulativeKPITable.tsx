"use client";

import { useMemo } from 'react';
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useCumulativeKPIs } from '@/app/hooks/useOptimizedQuery';
import { SimpleErrorBoundary } from '../ui/error-boundary';

interface CumulativeKPI {
  id: number;
  standardKpiId: string;
  standardKpiName: string;
  cumulativeValue: number;
  unit: string;
  lastUpdated: string;
  recordCount: number;
  contributingFiles: string[];
}

export default function CumulativeKPITable() {
  const { 
    data: apiResponse, 
    isLoading, 
    isError, 
    errorMessage, 
    isFetching, 
    refresh 
  } = useCumulativeKPIs();

  // データ正規化をメモ化
  const kpis = useMemo(() => {
    if (!apiResponse) return [];
    
    // APIレスポンスの構造に応じてデータを抽出
    if (Array.isArray(apiResponse)) {
      return apiResponse;
    }
    
    // 型安全なプロパティアクセス
    const response = apiResponse as any;
    if (response.cumulativeKpis && Array.isArray(response.cumulativeKpis)) {
      return response.cumulativeKpis;
    }
    
    if (response.kpis && Array.isArray(response.kpis)) {
      return response.kpis;
    }
    
    return [];
  }, [apiResponse]);

  const formatValue = useMemo(() => (value: number, unit: string) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${unit}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K ${unit}`;
    } else {
      return `${value.toFixed(1)} ${unit}`;
    }
  }, []);

  const formatDate = useMemo(() => (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">累積KPIデータを読み込み中...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-2">
          <ExclamationTriangleIcon className="h-8 w-8 mx-auto" />
        </div>
        <p className="text-red-600 mb-4">{errorMessage}</p>
        <div className="space-y-2">
          <button
            onClick={refresh}
            disabled={isFetching}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? '再読み込み中...' : '再読み込み'}
          </button>
          <div className="text-sm text-gray-500">
            データの取得に失敗しました。ネットワーク接続を確認してください。
          </div>
        </div>
      </div>
    );
  }

  if (kpis.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-400 mb-2">📊</div>
        <p className="text-gray-600 mb-4">まだKPIデータがありません</p>
        <p className="text-sm text-gray-500">
          CSVファイルをアップロードすると、累積KPIデータがここに表示されます
        </p>
        <button
          onClick={refresh}
          disabled={isFetching}
          className="mt-4 inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          更新を確認
        </button>
      </div>
    );
  }

  return (
    <SimpleErrorBoundary fallback="KPIテーブルの表示でエラーが発生しました">
      <div className="overflow-x-auto">
        {/* ヘッダー情報 */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            累積KPIデータ（{kpis.length}項目）
            {isFetching && <span className="ml-2 text-blue-600">🔄 更新中...</span>}
          </div>
          <button
            onClick={refresh}
            disabled={isFetching}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            手動更新
          </button>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                標準KPI項目名
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                累積値
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                レコード数
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                最終更新日
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                貢献ファイル数
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {kpis.map((kpi: CumulativeKPI) => (
              <tr key={kpi.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {kpi.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {kpi.standardKpiName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {kpi.standardKpiId}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-bold text-blue-600">
                    {formatValue(kpi.cumulativeValue, kpi.unit)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {kpi.recordCount}件
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                  {formatDate(kpi.lastUpdated)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {kpi.contributingFiles?.length || 0}ファイル
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* フッター情報 */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>合計 {kpis.length} 個のKPI項目</span>
            <div className="flex items-center space-x-4">
              <span className="text-xs">
                自動更新: 1分間隔
              </span>
              <button
                onClick={refresh}
                disabled={isFetching}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
                更新
              </button>
            </div>
          </div>
        </div>
      </div>
    </SimpleErrorBoundary>
  );
} 