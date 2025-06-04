import React, { useState, useEffect } from 'react';
import { useAutoConverter } from '../../hooks/useAutoConverter';
import { ConversionLog } from '../../../../../packages/shared/src/types/kpi';

export const ConversionHistory: React.FC = () => {
  const [logs, setLogs] = useState<ConversionLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ConversionLog[]>([]);
  const [filterKpiId, setFilterKpiId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const { getConversionLogs, clearLogs } = useAutoConverter();

  // ログを取得
  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const allLogs = await getConversionLogs();
      setLogs(allLogs);
      setFilteredLogs(allLogs);
    } catch (error) {
      console.error('ログの取得に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // フィルタリング処理
  useEffect(() => {
    if (!filterKpiId) {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(logs.filter(log => log.kpiId === filterKpiId));
    }
  }, [logs, filterKpiId]);

  // ログクリア
  const handleClearLogs = async () => {
    if (window.confirm('変換ログを全て削除しますか？')) {
      const success = await clearLogs();
      if (success) {
        setLogs([]);
        setFilteredLogs([]);
      }
    }
  };

  // ユニークなKPI IDを取得
  const uniqueKpiIds = Array.from(new Set(logs.map(log => log.kpiId)));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">変換履歴</h3>
        <div className="flex space-x-3">
          <button
            onClick={loadLogs}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isLoading ? '読込中...' : '更新'}
          </button>
          <button
            onClick={handleClearLogs}
            disabled={logs.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300"
          >
            クリア
          </button>
        </div>
      </div>

      {/* フィルター */}
      <div className="mb-4">
        <label htmlFor="kpi-filter" className="block text-sm font-medium text-gray-700 mb-2">
          KPIでフィルター
        </label>
        <select
          id="kpi-filter"
          value={filterKpiId}
          onChange={(e) => setFilterKpiId(e.target.value)}
          className="w-64 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- 全て表示 --</option>
          {uniqueKpiIds.map((kpiId) => (
            <option key={kpiId} value={kpiId}>
              {kpiId}
            </option>
          ))}
        </select>
      </div>

      {/* ログ件数表示 */}
      <div className="mb-4 text-sm text-gray-600">
        {filteredLogs.length > 0 ? (
          <span>
            {filteredLogs.length}件の変換ログ
            {filterKpiId && ` (${filterKpiId}でフィルター中)`}
          </span>
        ) : (
          <span>変換ログがありません</span>
        )}
      </div>

      {/* ログ一覧 */}
      {filteredLogs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">時刻</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">KPI</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">変換前</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">変換後</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">係数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {new Date(log.timestamp).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {log.kpiId}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                    {log.originalValue.toLocaleString()} {log.originalUnit}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                    <span className="font-medium text-green-600">
                      {log.convertedValue.toLocaleString()} {log.standardUnit}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500 text-center">
                    {log.conversionFactor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {filterKpiId ? 
            `${filterKpiId}の変換ログがありません` : 
            '変換ログがありません。変換を実行すると履歴が表示されます。'
          }
        </div>
      )}
    </div>
  );
}; 