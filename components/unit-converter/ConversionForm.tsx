import React, { useState, useEffect } from 'react';
import { useAutoConverter } from '../../hooks/useAutoConverter';
import { AutoConversionRequest, AutoConversionResult, KpiUnitConfig } from '../../../../../packages/shared/src/types/kpi';

interface ConversionFormProps {
  onConversionResult: (result: AutoConversionResult) => void;
  onError: (error: string) => void;
}

export const ConversionForm: React.FC<ConversionFormProps> = ({
  onConversionResult,
  onError,
}) => {
  const [kpiId, setKpiId] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [sourceUnit, setSourceUnit] = useState<string>('');
  const [kpiConfigs, setKpiConfigs] = useState<KpiUnitConfig[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const { getKpiConfigs, convertToStandard, isLoading, error } = useAutoConverter();

  // KPI設定を取得
  useEffect(() => {
    const loadKpiConfigs = async () => {
      try {
        const configs = await getKpiConfigs();
        setKpiConfigs(configs);
        if (configs.length > 0) {
          setKpiId(configs[0].kpiId);
        }
      } catch (err) {
        onError('KPI設定の取得に失敗しました');
      }
    };

    loadKpiConfigs();
  }, [getKpiConfigs, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!kpiId || !value || !sourceUnit) {
      onError('全ての項目を入力してください');
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      onError('有効な数値を入力してください');
      return;
    }

    setIsConverting(true);
    try {
      const request: AutoConversionRequest = {
        kpiId,
        value: numValue,
        sourceUnit,
        metadata: {
          userInput: true,
          timestamp: new Date().toISOString(),
        },
      };

      const result = await convertToStandard(request);
      if (result) {
        onConversionResult(result);
      } else {
        onError('変換に失敗しました');
      }
    } catch (err) {
      onError('変換処理でエラーが発生しました');
    } finally {
      setIsConverting(false);
    }
  };

  const selectedKpi = kpiConfigs.find(config => config.kpiId === kpiId);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">単位変換</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* KPI選択 */}
        <div>
          <label htmlFor="kpi-select" className="block text-sm font-medium text-gray-700 mb-2">
            KPI（指標）
          </label>
          <select
            id="kpi-select"
            value={kpiId}
            onChange={(e) => setKpiId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">-- KPIを選択 --</option>
            {kpiConfigs.map((config) => (
              <option key={config.kpiId} value={config.kpiId}>
                {config.kpiName} (標準単位: {config.standardUnit})
              </option>
            ))}
          </select>
          {selectedKpi && (
            <p className="text-sm text-gray-600 mt-1">
              {selectedKpi.description}
            </p>
          )}
        </div>

        {/* 値入力 */}
        <div>
          <label htmlFor="value-input" className="block text-sm font-medium text-gray-700 mb-2">
            値
          </label>
          <input
            id="value-input"
            type="number"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="例: 1500"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading || isConverting}
          />
        </div>

        {/* 単位入力 */}
        <div>
          <label htmlFor="unit-input" className="block text-sm font-medium text-gray-700 mb-2">
            現在の単位
          </label>
          <input
            id="unit-input"
            type="text"
            value={sourceUnit}
            onChange={(e) => setSourceUnit(e.target.value)}
            placeholder="例: kg, L, kJ"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading || isConverting}
          />
          <p className="text-sm text-gray-600 mt-1">
            対応単位: kg, g, t, L, m3, kJ, MJ, h, min, s など
          </p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isLoading || isConverting || !kpiId || !value || !sourceUnit}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isLoading || isConverting || !kpiId || !value || !sourceUnit
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {isConverting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              変換中...
            </span>
          ) : (
            '変換実行'
          )}
        </button>
      </form>
    </div>
  );
}; 