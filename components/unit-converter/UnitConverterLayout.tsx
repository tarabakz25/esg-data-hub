import React, { useState } from 'react';
import { ConversionForm } from './ConversionForm';
import { ConversionResult } from './ConversionResult';
import { ConversionHistory } from './ConversionHistory';
import { AutoConversionResult } from '@/types/services/kpi';

export const UnitConverterLayout: React.FC = () => {
  const [currentResult, setCurrentResult] = useState<AutoConversionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handleConversionResult = (result: AutoConversionResult) => {
    setCurrentResult(result);
    setErrorMessage('');
    // 履歴を更新するためのトリガー
    setRefreshHistory(prev => prev + 1);
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    // エラー時は結果をクリアしない（前回の結果を保持）
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            単位統一エンジン
          </h1>
          <p className="text-gray-600">
            ESG KPIデータの単位を標準単位に自動変換します
          </p>
        </div>

        {/* エラーメッセージ */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 font-medium">エラー</span>
            </div>
            <p className="text-red-700 mt-1">{errorMessage}</p>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側: フォームと結果 */}
          <div className="space-y-6">
            <ConversionForm
              onConversionResult={handleConversionResult}
              onError={handleError}
            />
            <ConversionResult result={currentResult} />
          </div>

          {/* 右側: 履歴 */}
          <div>
            <ConversionHistory key={refreshHistory} />
          </div>
        </div>

        {/* 使用方法 */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">使用方法</h2>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start">
              <span className="inline-block w-6 h-6 bg-blue-600 text-white text-sm rounded-full text-center mr-3 mt-0.5">1</span>
              <div>
                <strong>KPIを選択:</strong> CO2排出量、エネルギー消費量などのESG指標を選択
              </div>
            </div>
            <div className="flex items-start">
              <span className="inline-block w-6 h-6 bg-blue-600 text-white text-sm rounded-full text-center mr-3 mt-0.5">2</span>
              <div>
                <strong>値と単位を入力:</strong> 変換したい数値と現在の単位を入力
              </div>
            </div>
            <div className="flex items-start">
              <span className="inline-block w-6 h-6 bg-blue-600 text-white text-sm rounded-full text-center mr-3 mt-0.5">3</span>
              <div>
                <strong>変換実行:</strong> システムが自動的に標準単位に変換し、結果を表示
              </div>
            </div>
            <div className="flex items-start">
              <span className="inline-block w-6 h-6 bg-blue-600 text-white text-sm rounded-full text-center mr-3 mt-0.5">4</span>
              <div>
                <strong>履歴確認:</strong> 過去の変換履歴を確認し、データの整合性をチェック
              </div>
            </div>
          </div>
        </div>

        {/* 対応KPI一覧 */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">対応KPI一覧</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-md p-3">
              <h3 className="font-medium text-gray-900">CO2排出量</h3>
              <p className="text-sm text-gray-600">標準単位: t (トン)</p>
              <p className="text-xs text-gray-500">対応: kg, g → t</p>
            </div>
            <div className="border border-gray-200 rounded-md p-3">
              <h3 className="font-medium text-gray-900">エネルギー消費量</h3>
              <p className="text-sm text-gray-600">標準単位: MJ (メガジュール)</p>
              <p className="text-xs text-gray-500">対応: J, kJ → MJ</p>
            </div>
            <div className="border border-gray-200 rounded-md p-3">
              <h3 className="font-medium text-gray-900">水使用量</h3>
              <p className="text-sm text-gray-600">標準単位: m³ (立方メートル)</p>
              <p className="text-xs text-gray-500">対応: L → m³</p>
            </div>
            <div className="border border-gray-200 rounded-md p-3">
              <h3 className="font-medium text-gray-900">廃棄物発生量</h3>
              <p className="text-sm text-gray-600">標準単位: t (トン)</p>
              <p className="text-xs text-gray-500">対応: kg, g → t</p>
            </div>
            <div className="border border-gray-200 rounded-md p-3">
              <h3 className="font-medium text-gray-900">従業員研修時間</h3>
              <p className="text-sm text-gray-600">標準単位: h (時間)</p>
              <p className="text-xs text-gray-500">対応: min, s → h</p>
            </div>
            <div className="border border-gray-200 rounded-md p-3">
              <h3 className="font-medium text-gray-900">施設面積</h3>
              <p className="text-sm text-gray-600">標準単位: m² (平方メートル)</p>
              <p className="text-xs text-gray-500">面積系単位対応</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 