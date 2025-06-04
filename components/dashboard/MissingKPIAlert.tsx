"use client";

import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface MissingKPIData {
  totalKpis: number;
  missingKpis: string[];
  missingCount: number;
  completionRate: number;
}

export default function MissingKPIAlert() {
  const [missingData, setMissingData] = useState<MissingKPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchMissingKPIs = async () => {
      try {
        const response = await fetch('/api/dashboard/missing-kpis');
        if (response.ok) {
          const data = await response.json();
          setMissingData(data);
        }
      } catch (error) {
        console.error('欠損KPI取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMissingKPIs();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="animate-pulse flex items-center space-x-2">
          <div className="h-4 w-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded flex-1 max-w-xs"></div>
        </div>
      </div>
    );
  }

  if (!missingData) {
    return null;
  }

  const { totalKpis, missingKpis, missingCount, completionRate } = missingData;

  if (missingCount === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          <span className="text-green-800 font-medium">
            🎉 すべての標準KPI ({totalKpis}個) にデータが入力されています！
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div>
            <h3 className="text-yellow-800 font-medium">
              欠損KPI ({missingCount}/{totalKpis})
            </h3>
            <p className="text-yellow-700 text-sm mt-1">
              まだデータが入力されていない標準KPIがあります
              <span className="ml-2 text-xs">
                完了率: {Math.round(completionRate)}%
              </span>
            </p>
            
            {showDetails && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {missingKpis.map((kpi, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                    >
                      {kpi}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 進捗バー */}
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-yellow-700 hover:text-yellow-900 text-sm underline"
          >
            {showDetails ? '非表示' : '詳細'}
          </button>
        </div>
      </div>
    </div>
  );
} 