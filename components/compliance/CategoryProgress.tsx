'use client';

import React from 'react';

export interface CategoryProgressProps {
  category: string;
  score: number; // 0-100
  requiredKPIs: string[];
  mappedKPIs: string[];
  missingKPIs: string[];
  isLoading?: boolean;
}

export default function CategoryProgress({
  category,
  score,
  requiredKPIs,
  mappedKPIs,
  missingKPIs,
  isLoading = false
}: CategoryProgressProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  // カテゴリアイコンの取得
  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'Environment':
        return '🌱';
      case 'Social':
        return '👥';
      case 'Governance':
        return '⚖️';
      case 'Financial':
        return '💰';
      default:
        return '📊';
    }
  };

  // カテゴリ名の日本語化
  const getCategoryName = (category: string): string => {
    switch (category) {
      case 'Environment':
        return '環境';
      case 'Social':
        return '社会';
      case 'Governance':
        return 'ガバナンス';
      case 'Financial':
        return '財務';
      default:
        return category;
    }
  };

  // スコアに基づく色の取得
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // プログレスバーの色の取得
  const getProgressColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // ステータスメッセージの取得
  const getStatusMessage = (score: number): string => {
    if (score >= 80) return '優秀なコンプライアンス状況です';
    if (score >= 60) return '良好ですが改善の余地があります';
    return '重要な改善が必要です';
  };

  const completionRate = requiredKPIs.length > 0 ? 
    (mappedKPIs.length / requiredKPIs.length) * 100 : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* カテゴリヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getCategoryIcon(category)}</span>
          <h3 className="text-lg font-semibold text-gray-900">
            {getCategoryName(category)}
          </h3>
        </div>
        <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
          {score.toFixed(1)}%
        </div>
      </div>

      {/* プログレスバー */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>充足率</span>
          <span>{mappedKPIs.length}/{requiredKPIs.length} KPI</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(score)}`}
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-500">
          {getStatusMessage(score)}
        </div>
      </div>

      {/* KPI詳細 */}
      <div className="space-y-3">
        {/* マッピング済みKPI */}
        {mappedKPIs.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-green-700 mb-2">
              ✅ マッピング済み ({mappedKPIs.length}件)
            </h4>
            <div className="space-y-1">
              {mappedKPIs.slice(0, 3).map((kpi, index) => (
                <div key={index} className="text-sm text-gray-600 bg-green-50 rounded px-2 py-1">
                  {kpi}
                </div>
              ))}
              {mappedKPIs.length > 3 && (
                <div className="text-xs text-gray-500">
                  ...他 {mappedKPIs.length - 3}件
                </div>
              )}
            </div>
          </div>
        )}

        {/* 欠損KPI */}
        {missingKPIs.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-700 mb-2">
              ❌ 欠損KPI ({missingKPIs.length}件)
            </h4>
            <div className="space-y-1">
              {missingKPIs.slice(0, 3).map((kpi, index) => (
                <div key={index} className="text-sm text-gray-600 bg-red-50 rounded px-2 py-1">
                  {kpi}
                </div>
              ))}
              {missingKPIs.length > 3 && (
                <div className="text-xs text-gray-500">
                  ...他 {missingKPIs.length - 3}件
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* アクションヒント */}
      {missingKPIs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <div className="text-sm text-blue-800">
            <span className="font-medium">推奨アクション:</span>
            <div className="mt-1">
              {missingKPIs.length <= 2 ? 
                `${missingKPIs.join('、')}のデータ収集を優先してください` :
                `${missingKPIs.slice(0, 2).join('、')}など${missingKPIs.length}件のKPIデータ収集が必要です`
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 