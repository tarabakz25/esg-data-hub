"use client";

import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface MappingResult {
  kpiId: string;
  standardKpiName: string;
  confidence: number;
  recordCount: number;
  totalValue: number;
  unit: string;
  sampleValues: string[];
}

interface MappingResultsProps {
  mappingResults: {
    highConfidence: MappingResult[];
    mediumConfidence: MappingResult[];
    lowConfidence: MappingResult[];
    detectedKpis: number;
    totalRecords: number;
    autoApprovalRate: number;
  };
}

export default function MappingResults({ mappingResults }: MappingResultsProps) {
  if (!mappingResults) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">🎯</div>
        <p className="text-gray-600">マッピング結果データがありません</p>
      </div>
    );
  }

  const { highConfidence, mediumConfidence, lowConfidence, detectedKpis, totalRecords, autoApprovalRate } = mappingResults;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    if (confidence >= 60) return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
  };

  const formatValue = (value: number, unit: string) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${unit}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K ${unit}`;
    } else {
      return `${value.toFixed(1)} ${unit}`;
    }
  };

  const renderMappingSection = (title: string, results: MappingResult[], bgColor: string) => {
    if (results.length === 0) return null;

    return (
      <div className={`${bgColor} rounded-lg p-4 mb-6`}>
        <h3 className="font-semibold text-gray-900 mb-4">{title} ({results.length}個)</h3>
        <div className="space-y-3">
          {results.map((result, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getConfidenceIcon(result.confidence)}
                    <div>
                      <h4 className="font-medium text-gray-900">{result.standardKpiName}</h4>
                      <p className="text-sm text-gray-600">{result.kpiId}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div>
                      <div className="text-sm text-gray-600">追加値</div>
                      <div className="font-semibold text-blue-600">
                        {formatValue(result.totalValue, result.unit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">レコード数</div>
                      <div className="font-semibold text-green-600">{result.recordCount}件</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">信頼度</div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(result.confidence)}`}>
                        {result.confidence}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">サンプル値</div>
                      <div className="text-xs text-gray-500">
                        {result.sampleValues.slice(0, 2).join(', ')}
                        {result.sampleValues.length > 2 && '...'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* 概要統計 */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">KPIマッピング分析結果</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{detectedKpis}</div>
            <div className="text-sm text-gray-600">検出されたKPI識別子</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{highConfidence.length}</div>
            <div className="text-sm text-gray-600">高信頼度マッピング (≥80%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{mediumConfidence.length}</div>
            <div className="text-sm text-gray-600">中信頼度マッピング (60-80%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{Math.round(autoApprovalRate)}%</div>
            <div className="text-sm text-gray-600">自動承認率</div>
          </div>
        </div>
      </div>

      {/* 高信頼度マッピング */}
      {renderMappingSection(
        '✅ 高信頼度マッピング (≥80%)',
        highConfidence,
        'bg-green-50 border border-green-200'
      )}

      {/* 中信頼度マッピング */}
      {renderMappingSection(
        '⚠️ 中信頼度マッピング (60-80%)',
        mediumConfidence,
        'bg-yellow-50 border border-yellow-200'
      )}

      {/* 低信頼度マッピング */}
      {renderMappingSection(
        '❌ 低信頼度マッピング (<60%)',
        lowConfidence,
        'bg-red-50 border border-red-200'
      )}

      {/* フッター情報 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 マッピング結果について</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>高信頼度 (≥80%)</strong>: 自動承認され、累積KPIに加算されました</li>
          <li>• <strong>中信頼度 (60-80%)</strong>: 条件付きで承認され、累積KPIに加算されました</li>
          <li>• <strong>低信頼度 (&lt;60%)</strong>: 手動確認が必要な項目です</li>
          <li>• 信頼度は機械学習による意味的類似度スコアに基づいて算出されます</li>
        </ul>
      </div>
    </div>
  );
} 