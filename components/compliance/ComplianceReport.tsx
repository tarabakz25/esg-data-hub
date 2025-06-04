'use client';

import React from 'react';
import CategoryProgress from './CategoryProgress';
import { type ComplianceCheckResult } from '@/lib/compliance-checker';

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

  // 総合スコアに基づく色とメッセージ
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

  // カテゴリ別のKPI分類
  const getCategoryKPIs = () => {
    const categories = {
      Environment: { required: [] as string[], mapped: [] as string[], missing: [] as string[] },
      Social: { required: [] as string[], mapped: [] as string[], missing: [] as string[] },
      Governance: { required: [] as string[], mapped: [] as string[], missing: [] as string[] }
    };

    // 欠損KPIの分類
    complianceResult.missingKPIs.forEach(missing => {
      const category = missing.category as keyof typeof categories;
      if (categories[category]) {
        categories[category].missing.push(missing.requiredKPI);
      }
    });

    // TODO: マッピング済みKPIの情報が必要（現在の実装では取得方法がない）
    // この部分は実際のマッピング結果データから取得する必要がある

    return categories;
  };

  const categoryKPIs = getCategoryKPIs();

  // データ品質問題の分類
  const criticalIssues = complianceResult.dataQualityIssues.filter(issue => issue.severity === 'error');
  const warningIssues = complianceResult.dataQualityIssues.filter(issue => issue.severity === 'warning');

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
          <span className="text-4xl">{getOverallScoreIcon(complianceResult.overallScore)}</span>
          <div>
            <div className={`text-4xl font-bold ${getOverallScoreColor(complianceResult.overallScore)}`}>
              {complianceResult.overallScore.toFixed(1)}%
            </div>
            <div className="text-lg text-gray-600">総合コンプライアンススコア</div>
          </div>
        </div>

        {/* サマリー指標 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {complianceResult.mappingQuality.highConfidence}
            </div>
            <div className="text-sm text-gray-600">高信頼度マッピング</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {complianceResult.mappingQuality.mediumConfidence}
            </div>
            <div className="text-sm text-gray-600">中信頼度マッピング</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {complianceResult.missingKPIs.length}
            </div>
            <div className="text-sm text-gray-600">欠損KPI</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {complianceResult.dataQualityIssues.length}
            </div>
            <div className="text-sm text-gray-600">品質問題</div>
          </div>
        </div>
      </div>

      {/* カテゴリ別進捗 */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">カテゴリ別進捗</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(complianceResult.categoryScores).map(([category, score]) => {
            if (category === 'Financial') return null; // Financialは除外
            const categoryData = categoryKPIs[category as keyof typeof categoryKPIs];
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

          {/* 次のステップと問題一覧 */}
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

            {complianceResult.dataQualityIssues.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">データ品質問題</h4>
                <div className="space-y-3">
                  {criticalIssues.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-red-700 mb-2">
                        ❌ エラー ({criticalIssues.length}件)
                      </h5>
                      <div className="space-y-1">
                        {criticalIssues.map((issue, index) => (
                          <div key={index} className="text-sm bg-red-50 rounded p-2">
                            <div className="font-medium text-red-800">{issue.kpiIdentifier}</div>
                            <div className="text-red-700">{issue.issue}</div>
                            <div className="text-red-600 text-xs mt-1">{issue.recommendation}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {warningIssues.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-yellow-700 mb-2">
                        ⚠️ 警告 ({warningIssues.length}件)
                      </h5>
                      <div className="space-y-1">
                        {warningIssues.slice(0, 3).map((issue, index) => (
                          <div key={index} className="text-sm bg-yellow-50 rounded p-2">
                            <div className="font-medium text-yellow-800">{issue.kpiIdentifier}</div>
                            <div className="text-yellow-700">{issue.issue}</div>
                          </div>
                        ))}
                        {warningIssues.length > 3 && (
                          <div className="text-xs text-gray-500">
                            ...他 {warningIssues.length - 3}件の警告があります
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

      {/* 処理時間情報 */}
      <div className="text-center text-sm text-gray-500">
        処理時間: {complianceResult.processingTimeMs}ms
      </div>
    </div>
  );
} 