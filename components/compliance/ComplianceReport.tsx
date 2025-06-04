'use client';

import React from 'react';
import CategoryProgress from './CategoryProgress';
import { type ComplianceCheckResult } from '@/types/services/compliance';

export interface ComplianceDashboardProps {
  overallScore: number;
  categoryScores: Record<string, number>;
  recommendations: string[];
  criticalIssues: Array<{
    kpiIdentifier: string;
    issue: string;
    severity: 'error' | 'warning' | 'info';
    recommendation: string;
  }>;
}

interface ComplianceReportProps {
  complianceResult: ComplianceCheckResult;
  detailedReport?: {
    summary: string;
    recommendations: string[];
    nextSteps: string[];
  };
  isLoading?: boolean;
}

export default function ComplianceReport({
  complianceResult,
  detailedReport,
  isLoading = false
}: ComplianceReportProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 総合スコアに基づく色とメッセージ（コンプライアンス率を使用）
  const getOverallScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOverallScoreIcon = (score: number): string => {
    if (score >= 80) return '🏆';
    if (score >= 60) return '📈';
    return '⚠️';
  };

  // ステータスに基づくメッセージ
  const getStatusMessage = (status: string): string => {
    switch (status) {
      case 'compliant':
        return 'コンプライアンス基準を満たしています';
      case 'warning':
        return '一部の基準で警告があります';
      case 'critical':
        return '重要な基準で問題があります';
      default:
        return '未確認';
    }
  };

  // カテゴリ別のKPI分類（実際のデータから推定）
  const getCategoryKpis = () => {
    const categories = {
      environment: { required: [] as string[], mapped: [] as string[], missing: [] as string[] },
      social: { required: [] as string[], mapped: [] as string[], missing: [] as string[] },
      governance: { required: [] as string[], mapped: [] as string[], missing: [] as string[] }
    };

    // 欠損KPIの分類
    complianceResult.missingKpis.forEach(missing => {
      const category = missing.category as keyof typeof categories;
      if (categories[category]) {
        categories[category].missing.push(missing.kpiId);
      }
    });

    return categories;
  };

  const categoryKpis = getCategoryKpis();

  // カテゴリ別スコア計算（欠損KPIの数に基づく）
  const calculateCategoryScores = () => {
    const scores: Record<string, number> = {};
    const totalKpisPerCategory = 10; // 仮の値、実際は設定から取得

    Object.keys(categoryKpis).forEach(category => {
      const missingCount = categoryKpis[category as keyof typeof categoryKpis].missing.length;
      scores[category] = Math.max(0, ((totalKpisPerCategory - missingCount) / totalKpisPerCategory) * 100);
    });

    return scores;
  };

  const categoryScores = calculateCategoryScores();

  return (
    <div className="space-y-6">
      {/* 総合ダッシュボード */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            コンプライアンスレポート
          </h2>
          <div className="text-sm text-gray-500">
            チェック日時: {complianceResult.checkedAt.toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>

        {/* 総合スコア */}
        <div className="flex items-center space-x-4 mb-6">
          <span className="text-4xl">{getOverallScoreIcon(complianceResult.complianceRate)}</span>
          <div>
            <div className={`text-4xl font-bold ${getOverallScoreColor(complianceResult.complianceRate)}`}>
              {complianceResult.complianceRate.toFixed(1)}%
            </div>
            <div className="text-lg text-gray-600">総合コンプライアンススコア</div>
            <div className="text-sm text-gray-500">{getStatusMessage(complianceResult.status)}</div>
          </div>
        </div>

        {/* サマリー指標 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {complianceResult.totalKpis - complianceResult.missingKpis.length}
            </div>
            <div className="text-sm text-gray-600">マッピング済みKPI</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {complianceResult.warningMissing}
            </div>
            <div className="text-sm text-gray-600">警告レベル欠損</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {complianceResult.criticalMissing}
            </div>
            <div className="text-sm text-gray-600">重要欠損KPI</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {complianceResult.totalKpis}
            </div>
            <div className="text-sm text-gray-600">総KPI数</div>
          </div>
        </div>
      </div>

      {/* カテゴリ別進捗 */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">カテゴリ別進捗</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(categoryScores).map(([category, score]) => {
            const categoryData = categoryKpis[category as keyof typeof categoryKpis];
            return (
              <CategoryProgress
                key={category}
                category={category}
                score={score}
                requiredKPIs={[...categoryData.mapped, ...categoryData.missing]}
                mappedKPIs={categoryData.mapped}
                missingKPIs={categoryData.missing}
              />
            );
          })}
        </div>
      </div>

      {/* 詳細レポート */}
      {detailedReport && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* サマリーと推奨事項 */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">サマリー</h4>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {detailedReport.summary}
              </pre>
            </div>

            {detailedReport.recommendations.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">推奨事項</h4>
                <ul className="space-y-2">
                  {detailedReport.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-sm text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 次のステップと欠損KPI一覧 */}
          <div className="space-y-4">
            {detailedReport.nextSteps.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">次のステップ</h4>
                <ol className="space-y-2">
                  {detailedReport.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-indigo-500 font-semibold mt-1">{index + 1}.</span>
                      <span className="text-sm text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {complianceResult.missingKpis.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">欠損KPI</h4>
                <div className="space-y-3">
                  {complianceResult.criticalMissing > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-red-700 mb-2">
                        ❌ 重要 ({complianceResult.criticalMissing}件)
                      </h5>
                      <div className="space-y-1">
                        {complianceResult.missingKpis
                          .filter(kpi => kpi.severity === 'critical')
                          .map((kpi, index) => (
                          <div key={index} className="text-sm bg-red-50 rounded p-2">
                            <div className="font-medium text-red-800">{kpi.kpiName}</div>
                            <div className="text-red-700">KPI ID: {kpi.kpiId}</div>
                            <div className="text-red-600 text-xs mt-1">カテゴリ: {kpi.category}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {complianceResult.warningMissing > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-yellow-700 mb-2">
                        ⚠️ 警告 ({complianceResult.warningMissing}件)
                      </h5>
                      <div className="space-y-1">
                        {complianceResult.missingKpis
                          .filter(kpi => kpi.severity === 'warning')
                          .slice(0, 3)
                          .map((kpi, index) => (
                          <div key={index} className="text-sm bg-yellow-50 rounded p-2">
                            <div className="font-medium text-yellow-800">{kpi.kpiName}</div>
                            <div className="text-yellow-700">KPI ID: {kpi.kpiId}</div>
                          </div>
                        ))}
                        {complianceResult.missingKpis.filter(kpi => kpi.severity === 'warning').length > 3 && (
                          <div className="text-xs text-gray-500">
                            ...他 {complianceResult.missingKpis.filter(kpi => kpi.severity === 'warning').length - 3}件の警告があります
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 期間と基準情報 */}
      <div className="text-center text-sm text-gray-500">
        期間: {complianceResult.period} | 基準: {complianceResult.standard.toUpperCase()}
      </div>
    </div>
  );
} 