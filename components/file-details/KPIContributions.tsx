"use client";

import { ArrowUpIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface KPIContribution {
  standardKpiId: string;
  standardKpiName: string;
  previousValue: number;
  addedValue: number;
  newValue: number;
  unit: string;
  contributionPercentage: number;
  recordCount: number;
}

interface KPIContributionsProps {
  contributions: KPIContribution[];
}

export default function KPIContributions({ contributions }: KPIContributionsProps) {
  if (!contributions || contributions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">📊</div>
        <p className="text-gray-600">KPI貢献度データがありません</p>
      </div>
    );
  }

  const formatValue = (value: number | undefined, unit: string) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return `0 ${unit}`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${unit}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K ${unit}`;
    } else {
      return `${value.toFixed(1)} ${unit}`;
    }
  };

  const getContributionColor = (percentage: number | undefined) => {
    if (typeof percentage !== 'number' || isNaN(percentage)) {
      return 'text-gray-600 bg-gray-50';
    }
    if (percentage >= 20) return 'text-green-600 bg-green-50';
    if (percentage >= 10) return 'text-blue-600 bg-blue-50';
    if (percentage >= 5) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  // 安全なデータアクセス
  const safeContributions = contributions.map(contrib => ({
    ...contrib,
    previousValue: contrib.previousValue ?? 0,
    addedValue: contrib.addedValue ?? 0,
    newValue: contrib.newValue ?? 0,
    contributionPercentage: contrib.contributionPercentage ?? 0,
    recordCount: contrib.recordCount ?? 0,
    unit: contrib.unit ?? ''
  }));

  const totalAddedValue = safeContributions.reduce((sum, contrib) => sum + contrib.addedValue, 0);
  const totalRecords = safeContributions.reduce((sum, contrib) => sum + contrib.recordCount, 0);
  const maxContribution = Math.max(...safeContributions.map(c => c.contributionPercentage));

  return (
    <div>
      {/* 概要統計 */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">累積KPIへの貢献度</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{safeContributions.length}</div>
            <div className="text-sm text-gray-600">更新されたKPI数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalRecords}</div>
            <div className="text-sm text-gray-600">総レコード数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {maxContribution.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">最大貢献率</div>
          </div>
        </div>
      </div>

      {/* KPI貢献度一覧 */}
      <div className="space-y-4">
        {safeContributions.map((contribution, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {contribution.standardKpiName || 'Unknown KPI'}
                </h4>
                <p className="text-sm text-gray-600">{contribution.standardKpiId || 'N/A'}</p>
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getContributionColor(contribution.contributionPercentage)}`}>
                +{contribution.contributionPercentage.toFixed(1)}% 増加
              </div>
            </div>

            {/* 値の変化可視化 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center space-x-6">
                {/* 以前の値 */}
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">以前の累積値</div>
                  <div className="text-xl font-bold text-gray-700">
                    {formatValue(contribution.previousValue, contribution.unit)}
                  </div>
                </div>

                {/* 矢印 */}
                <div className="flex items-center space-x-2">
                  <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                  <div className="text-center">
                    <div className="text-sm text-green-600 font-medium">
                      +{formatValue(contribution.addedValue, contribution.unit)}
                    </div>
                    <div className="text-xs text-gray-500">
                      ({contribution.recordCount}レコード)
                    </div>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                </div>

                {/* 新しい値 */}
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">更新後の累積値</div>
                  <div className="text-xl font-bold text-blue-600 flex items-center">
                    {formatValue(contribution.newValue, contribution.unit)}
                    <ArrowUpIcon className="h-4 w-4 text-green-500 ml-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* 詳細メトリクス */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">追加値</div>
                <div className="font-semibold text-green-600">
                  {formatValue(contribution.addedValue, contribution.unit)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">レコード数</div>
                <div className="font-semibold text-blue-600">{contribution.recordCount}件</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">増加率</div>
                <div className="font-semibold text-purple-600">
                  +{contribution.contributionPercentage.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">平均値/レコード</div>
                <div className="font-semibold text-gray-700">
                  {contribution.recordCount > 0 
                    ? formatValue(contribution.addedValue / contribution.recordCount, contribution.unit)
                    : formatValue(0, contribution.unit)
                  }
                </div>
              </div>
            </div>

            {/* 貢献度バー */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>貢献度</span>
                <span>{contribution.contributionPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(contribution.contributionPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* フッター情報 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-blue-900 mb-2">💡 貢献度について</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>貢献度</strong>: このファイルの追加により、該当KPIがどの程度増加したかを示します</li>
          <li>• <strong>累積値</strong>: これまでにアップロードされた全ファイルからの合計値です</li>
          <li>• <strong>増加率</strong>: (追加値 ÷ 以前の累積値) × 100 で算出されます</li>
          <li>• 新しいKPIの場合、増加率は100%と表示されます</li>
        </ul>
      </div>
    </div>
  );
} 