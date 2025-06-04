'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type MappingResult, type ComplianceCheckResult } from '@/lib/compliance-checker';
import { ComplianceChecker } from '@/lib/compliance-checker';

export interface KPIMappingResultsProps {
  mappingResults: MappingResult[];
  onApprove: (kpiId: string, mappedKPI: any) => void;
  onReject: (kpiId: string) => void;
  onBulkApprove: () => void;
  isLoading?: boolean;
}

export interface KPIGroupSummary {
  kpiIdentifier: string;
  totalValue: number;
  unit: string;
  recordCount: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  issues: string[];
}

export default function KPIMappingResults({
  mappingResults,
  onApprove,
  onReject,
  onBulkApprove,
  isLoading = false
}: KPIMappingResultsProps) {
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
  const [complianceResult, setComplianceResult] = useState<ComplianceCheckResult | null>(null);
  const [complianceError, setComplianceError] = useState<string | null>(null);
  const [approvedMappings, setApprovedMappings] = useState<Set<string>>(new Set());

  // コンプライアンスチェック実行
  const handleComplianceCheck = async () => {
    setIsCheckingCompliance(true);
    setComplianceError(null);
    
    try {
      // ComplianceChecker を使用
      const result = ComplianceChecker.checkKPICompliance(mappingResults, {
        requiredCategories: ['Environment', 'Social', 'Governance'],
        minConfidenceThreshold: 0.6,
        includeDataQuality: true
      });
      
      setComplianceResult(result);
    } catch (error) {
      console.error('Compliance check failed:', error);
      setComplianceError(error instanceof Error ? error.message : 'コンプライアンスチェックに失敗しました');
    } finally {
      setIsCheckingCompliance(false);
    }
  };

  // 必須KPIの総数を計算する関数
  const calculateTotalRequiredKPIs = () => {
    const requiredKPIs = ComplianceChecker.getRequiredKPIsByCategory();
    const categories = ['Environment', 'Social', 'Governance'];
    
    return categories.reduce((total, category) => {
      const categoryKPIs = requiredKPIs[category] || [];
      return total + categoryKPIs.length;
    }, 0);
  };

  // 改良された一括承認処理
  const handleBulkApproveImproved = () => {
    const highConfidenceResults = mappingResults.filter(r => r.confidence >= 0.8);
    
    // 承認されたマッピングを記録
    const newApproved = new Set(approvedMappings);
    highConfidenceResults.forEach(result => {
      newApproved.add(result.kpiIdentifier);
      if (result.suggestedKPI) {
        onApprove(result.kpiIdentifier, result.suggestedKPI);
      }
    });
    
    setApprovedMappings(newApproved);
    
    // 元のコールバックも実行
    onBulkApprove();
  };

  // 個別承認処理の改良
  const handleApproveImproved = (kpiId: string, mappedKPI: any) => {
    const newApproved = new Set(approvedMappings);
    newApproved.add(kpiId);
    setApprovedMappings(newApproved);
    onApprove(kpiId, mappedKPI);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!mappingResults || mappingResults.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 text-lg">マッピング結果がありません</div>
        <div className="text-gray-400 text-sm mt-2">CSVファイルをアップロードしてKPIマッピングを実行してください</div>
      </div>
    );
  }

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-700 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  const getConfidenceIcon = (confidence: number): string => {
    if (confidence >= 0.8) return '✅';
    if (confidence >= 0.6) return '⚠️';
    return '❌';
  };

  const getDataQuality = (result: MappingResult): KPIGroupSummary['dataQuality'] => {
    if (result.recordCount >= 5 && result.confidence >= 0.8) return 'excellent';
    if (result.recordCount >= 3 && result.confidence >= 0.6) return 'good';
    if (result.recordCount >= 2 && result.confidence >= 0.4) return 'fair';
    return 'poor';
  };

  const getDataQualityIssues = (result: MappingResult): string[] => {
    const issues: string[] = [];
    
    if (result.recordCount < 3) {
      issues.push('データポイント数が不足しています');
    }
    
    if (result.confidence < 0.6) {
      issues.push('マッピング信頼度が低くなっています');
    }
    
    if (result.suggestedKPI && result.unit !== result.suggestedKPI.unit && result.unit && result.suggestedKPI.unit) {
      issues.push(`単位の不一致 (データ: ${result.unit}, 期待: ${result.suggestedKPI.unit})`);
    }
    
    return issues;
  };

  const highConfidenceResults = mappingResults.filter(r => r.confidence >= 0.8);
  const mediumConfidenceResults = mappingResults.filter(r => r.confidence >= 0.6 && r.confidence < 0.8);
  const lowConfidenceResults = mappingResults.filter(r => r.confidence < 0.6);

  return (
    <div className="space-y-6">
      {/* マッピング結果サマリー */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">マッピング結果サマリー</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{mappingResults.length}</div>
            <div className="text-sm text-gray-600">総KPI数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{highConfidenceResults.length}</div>
            <div className="text-sm text-gray-600">高信頼度 (≥80%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{mediumConfidenceResults.length}</div>
            <div className="text-sm text-gray-600">中信頼度 (60-80%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{lowConfidenceResults.length}</div>
            <div className="text-sm text-gray-600">低信頼度 (&lt;60%)</div>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 一括承認ボタン */}
        {highConfidenceResults.length > 0 && (
          <Button 
            onClick={handleBulkApproveImproved}
            className="bg-green-600 hover:bg-green-700 text-white flex-1"
          >
            高信頼度マッピングを一括承認 ({highConfidenceResults.length}件)
          </Button>
        )}
        
        {/* コンプライアンスチェックボタン */}
        <Button 
          onClick={handleComplianceCheck}
          disabled={isCheckingCompliance}
          className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
        >
          {isCheckingCompliance ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              コンプライアンスチェック中...
            </>
          ) : (
            '🏆 ESG コンプライアンスチェック実行'
          )}
        </Button>
      </div>

      {/* コンプライアンスチェック結果 */}
      {complianceResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
            🏆 ESG コンプライアンス評価結果
          </h3>
          
          {/* 総合スコア */}
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {complianceResult.overallScore.toFixed(1)}%
            </div>
            <div className="text-lg text-gray-700">総合適合率</div>
          </div>

          {/* カテゴリ別スコア */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">
                {complianceResult.categoryScores.Environment.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">環境 (Environment)</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">
                {complianceResult.categoryScores.Social.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">社会 (Social)</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">
                {complianceResult.categoryScores.Governance.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">ガバナンス (Governance)</div>
            </div>
          </div>

          {/* マッピング品質 */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-3">マッピング品質</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-600">{complianceResult.mappingQuality.highConfidence}</div>
                <div className="text-gray-600">高信頼度</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-600">{complianceResult.mappingQuality.mediumConfidence}</div>
                <div className="text-gray-600">中信頼度</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-red-600">{complianceResult.mappingQuality.lowConfidence}</div>
                <div className="text-gray-600">低信頼度</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-600">{complianceResult.mappingQuality.totalMapped}</div>
                <div className="text-gray-600">総マッピング数</div>
              </div>
            </div>
          </div>

          {/* 欠損KPI */}
          {complianceResult.missingKPIs.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">
                ⚠️ 欠損KPI ({complianceResult.missingKPIs.length}/{calculateTotalRequiredKPIs()})
              </h4>
              <div className="space-y-2">
                {complianceResult.missingKPIs.slice(0, 5).map((missing, index) => (
                  <div key={index} className="text-sm text-yellow-700 bg-yellow-100 rounded px-3 py-2">
                    <div className="font-medium">{missing.requiredKPI}</div>
                    <div className="text-xs">
                      カテゴリ: {missing.category} | 重要度: {missing.importance} | {missing.suggestion}
                    </div>
                  </div>
                ))}
                {complianceResult.missingKPIs.length > 5 && (
                  <div className="text-sm text-yellow-600">
                    ...他 {complianceResult.missingKPIs.length - 5}件
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* コンプライアンスチェックエラー */}
      {complianceError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            <strong>コンプライアンスチェックエラー:</strong> {complianceError}
          </AlertDescription>
        </Alert>
      )}

      {/* マッピング結果リスト */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">詳細マッピング結果</h3>
        
        {mappingResults.map((result) => {
          const dataQuality = getDataQuality(result);
          const issues = getDataQualityIssues(result);
          const isApproved = approvedMappings.has(result.kpiIdentifier);
          
          return (
            <div key={result.kpiIdentifier} className={`border rounded-lg p-4 ${
              isApproved ? 'border-green-300 bg-green-50' : 'border-gray-200'
            }`}>
              {/* KPI識別子とマッピング結果 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {isApproved && <span className="text-lg">✅</span>}
                    <span className="text-lg">{getConfidenceIcon(result.confidence)}</span>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {result.kpiIdentifier}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getConfidenceColor(result.confidence)}`}>
                      {Math.round(result.confidence * 100)}% 信頼度
                    </span>
                    {isApproved && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        承認済み
                      </span>
                    )}
                  </div>
                  
                  {result.suggestedKPI ? (
                    <div className="text-gray-700">
                      <span className="font-medium">→ {result.suggestedKPI.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({result.suggestedKPI.category})
                      </span>
                    </div>
                  ) : (
                    <div className="text-red-600 font-medium">マッピング候補が見つかりませんでした</div>
                  )}
                </div>
                
                {/* 承認/拒否ボタン */}
                {!isApproved && (
                  <div className="flex space-x-2 ml-4">
                    {result.suggestedKPI && (
                      <Button
                        onClick={() => handleApproveImproved(result.kpiIdentifier, result.suggestedKPI)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        承認
                      </Button>
                    )}
                    <Button
                      onClick={() => onReject(result.kpiIdentifier)}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      {result.suggestedKPI ? '修正' : '削除'}
                    </Button>
                  </div>
                )}
              </div>

              {/* データ集約情報 */}
              <div className="bg-gray-50 rounded p-3 mb-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">合計値:</span>
                    <span className="font-medium ml-1">
                      {result.aggregatedValue.toLocaleString()} {result.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">レコード数:</span>
                    <span className="font-medium ml-1">{result.recordCount}件</span>
                  </div>
                  <div>
                    <span className="text-gray-600">データ品質:</span>
                    <span className={`font-medium ml-1 ${
                      dataQuality === 'excellent' ? 'text-green-600' :
                      dataQuality === 'good' ? 'text-blue-600' :
                      dataQuality === 'fair' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {dataQuality === 'excellent' ? '優秀' :
                       dataQuality === 'good' ? '良好' :
                       dataQuality === 'fair' ? '普通' : '要改善'}
                    </span>
                  </div>
                  {result.originalConfidence && (
                    <div>
                      <span className="text-gray-600">元の信頼度:</span>
                      <span className="font-medium ml-1">{Math.round(result.originalConfidence * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 信頼度調整詳細 */}
              {result.confidenceBoosts && (
                <div className="mb-3">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                      信頼度調整詳細を表示
                    </summary>
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs space-y-1">
                      <div>単位一致ボーナス: +{Math.round((result.confidenceBoosts.unitMatch || 0) * 100)}%</div>
                      <div>データ品質ボーナス: +{Math.round((result.confidenceBoosts.dataQuality || 0) * 100)}%</div>
                      <div>サンプルサイズボーナス: +{Math.round((result.confidenceBoosts.sampleSize || 0) * 100)}%</div>
                      <div>値範囲妥当性ボーナス: +{Math.round((result.confidenceBoosts.valueRange || 0) * 100)}%</div>
                    </div>
                  </details>
                </div>
              )}

              {/* データ品質の問題 */}
              {issues.length > 0 && (
                <div className="border-t border-gray-200 pt-3">
                  <div className="text-sm text-gray-600 mb-1">データ品質の問題:</div>
                  <ul className="text-sm text-red-600 space-y-1">
                    {issues.map((issue, index) => (
                      <li key={index} className="flex items-center space-x-1">
                        <span>•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 代替候補 */}
              {result.alternativeSuggestions && result.alternativeSuggestions.length > 0 && (
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                      代替候補を表示 ({result.alternativeSuggestions.length}件)
                    </summary>
                    <div className="mt-2 space-y-2">
                      {result.alternativeSuggestions.map((alt, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{alt.kpi.name}</span>
                            <span className="text-gray-500 text-xs ml-2">({alt.kpi.category})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600">
                              {Math.round(alt.confidence * 100)}%
                            </span>
                            <Button
                              onClick={() => handleApproveImproved(result.kpiIdentifier, alt.kpi)}
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              選択
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 