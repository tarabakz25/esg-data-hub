import { useState, useCallback } from 'react';
import { AutoConversionRequest, AutoConversionResult, ConversionLog, KpiUnitConfig } from '../../../../packages/shared/src/types/kpi';

interface UseAutoConverterReturn {
  // 状態
  isLoading: boolean;
  error: string | null;
  
  // KPI設定関連
  getKpiConfigs: () => Promise<KpiUnitConfig[]>;
  getStandardUnit: (kpiId: string) => Promise<string | null>;
  canConvert: (kpiId: string, sourceUnit: string) => Promise<boolean>;
  
  // 変換関連
  convertToStandard: (request: AutoConversionRequest) => Promise<AutoConversionResult | null>;
  convertBatch: (requests: AutoConversionRequest[]) => Promise<AutoConversionResult[]>;
  
  // ログ・統計関連
  getConversionLogs: (kpiId?: string) => Promise<ConversionLog[]>;
  getConversionStats: () => Promise<{
    totalConversions: number;
    successfulConversions: number;
    failedConversions: number;
    conversionsByKpi: Record<string, number>;
  } | null>;
  
  // ユーティリティ
  clearLogs: () => Promise<boolean>;
}

export function useAutoConverter(): UseAutoConverterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async (endpoint: string, options?: RequestInit) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/kpi/auto-convert${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'APIエラーが発生しました');
      }
      
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getKpiConfigs = useCallback(async (): Promise<KpiUnitConfig[]> => {
    return await apiCall('?action=configs');
  }, [apiCall]);

  const getStandardUnit = useCallback(async (kpiId: string): Promise<string | null> => {
    try {
      const result = await apiCall(`?action=standard-unit&kpiId=${encodeURIComponent(kpiId)}`);
      return result.standardUnit;
    } catch {
      return null;
    }
  }, [apiCall]);

  const canConvert = useCallback(async (kpiId: string, sourceUnit: string): Promise<boolean> => {
    try {
      const result = await apiCall(`?action=can-convert&kpiId=${encodeURIComponent(kpiId)}&sourceUnit=${encodeURIComponent(sourceUnit)}`);
      return result.canConvert;
    } catch {
      return false;
    }
  }, [apiCall]);

  const convertToStandard = useCallback(async (request: AutoConversionRequest): Promise<AutoConversionResult | null> => {
    try {
      return await apiCall('', {
        method: 'POST',
        body: JSON.stringify({
          action: 'convert',
          data: request,
        }),
      });
    } catch {
      return null;
    }
  }, [apiCall]);

  const convertBatch = useCallback(async (requests: AutoConversionRequest[]): Promise<AutoConversionResult[]> => {
    try {
      return await apiCall('', {
        method: 'POST',
        body: JSON.stringify({
          action: 'batch-convert',
          data: requests,
        }),
      });
    } catch {
      return [];
    }
  }, [apiCall]);

  const getConversionLogs = useCallback(async (kpiId?: string): Promise<ConversionLog[]> => {
    const endpoint = kpiId ? `?action=logs&kpiId=${encodeURIComponent(kpiId)}` : '?action=logs';
    try {
      return await apiCall(endpoint);
    } catch {
      return [];
    }
  }, [apiCall]);

  const getConversionStats = useCallback(async () => {
    try {
      return await apiCall('?action=stats');
    } catch {
      return null;
    }
  }, [apiCall]);

  const clearLogs = useCallback(async (): Promise<boolean> => {
    try {
      await apiCall('', {
        method: 'POST',
        body: JSON.stringify({
          action: 'clear-logs',
        }),
      });
      return true;
    } catch {
      return false;
    }
  }, [apiCall]);

  return {
    isLoading,
    error,
    getKpiConfigs,
    getStandardUnit,
    canConvert,
    convertToStandard,
    convertBatch,
    getConversionLogs,
    getConversionStats,
    clearLogs,
  };
}

// シンプルな変換専用フック
export function useSimpleConverter() {
  const { convertToStandard, isLoading, error } = useAutoConverter();
  
  const convert = useCallback(async (
    kpiId: string,
    value: number,
    sourceUnit: string,
    metadata?: Record<string, any>
  ): Promise<AutoConversionResult | null> => {
    return await convertToStandard({
      kpiId,
      value,
      sourceUnit,
      metadata,
    });
  }, [convertToStandard]);

  return {
    convert,
    isLoading,
    error,
  };
} 