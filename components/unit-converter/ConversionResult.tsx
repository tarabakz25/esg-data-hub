import React from 'react';
import { AutoConversionResult } from '../../../../../packages/shared/src/types/kpi';

interface ConversionResultProps {
  result: AutoConversionResult | null;
}

export const ConversionResult: React.FC<ConversionResultProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-4">変換結果</h3>
        <p className="text-gray-500">変換を実行すると結果がここに表示されます</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">変換結果</h3>
      
      {result.isConverted ? (
        <div className="space-y-4">
          {/* 成功時の表示 */}
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-medium">変換成功</span>
            </div>
            <p className="text-green-700">{result.reason}</p>
          </div>

          {/* 変換詳細 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 変換前 */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">変換前</h4>
              <div className="text-2xl font-bold text-blue-900">
                {result.originalValue.toLocaleString()}
              </div>
              <div className="text-sm text-blue-700">{result.originalUnit}</div>
            </div>

            {/* 変換後 */}
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">変換後（標準単位）</h4>
              <div className="text-2xl font-bold text-green-900">
                {result.convertedValue.toLocaleString()}
              </div>
              <div className="text-sm text-green-700">{result.standardUnit}</div>
            </div>
          </div>

          {/* 変換情報 */}
          <div className="bg-gray-50 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-3">変換情報</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">KPI:</span>
                <div className="font-medium">{result.kpiId}</div>
              </div>
              <div>
                <span className="text-gray-600">変換係数:</span>
                <div className="font-medium">{result.conversionFactor}</div>
              </div>
              <div>
                <span className="text-gray-600">変換時刻:</span>
                <div className="font-medium">
                  {new Date(result.timestamp).toLocaleString('ja-JP')}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* エラー時の表示 */
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800 font-medium">変換失敗</span>
          </div>
          <p className="text-red-700 mb-4">{result.reason}</p>
          
          {/* 入力値の表示 */}
          <div className="bg-white rounded border p-3">
            <div className="text-sm text-gray-600">入力値:</div>
            <div className="font-medium">
              {result.originalValue} {result.originalUnit} (KPI: {result.kpiId})
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 