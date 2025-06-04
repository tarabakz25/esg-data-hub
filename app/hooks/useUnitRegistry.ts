import { useState, useEffect, useCallback } from 'react';
import { 
  Unit, 
  UnitCategory, 
  ConversionResult, 
  UnitCompatibilityCheck,
  UnitCategoryType 
} from '@/lib/services/unit';

interface UnitRegistryStats {
  totalUnits: number;
  totalCategories: number;
  categoriesBreakdown: Array<{
    category: string;
    unitCount: number;
  }>;
}

interface BatchConversionRequest {
  value: number;
  fromUnit: string;
  toUnit: string;
  id?: string;
}

interface BatchConversionResult {
  results: Array<BatchConversionRequest & { result: ConversionResult }>;
  summary: {
    total: number;
    success: number;
    failure: number;
  };
}

export function useUnitRegistry() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UnitRegistryStats | null>(null);
  const [categories, setCategories] = useState<UnitCategory[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // レジストリ統計情報を取得
  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/unit/registry');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'レジストリ統計の取得に失敗しました');
      }

      setStats(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // カテゴリ一覧を取得
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/unit/registry?action=categories');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'カテゴリの取得に失敗しました');
      }

      setCategories(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 単位一覧を取得
  const fetchUnits = useCallback(async (categoryId?: UnitCategoryType) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = categoryId 
        ? `/api/unit/registry?action=units&category=${categoryId}`
        : '/api/unit/registry?action=units';
      
      const response = await fetch(url);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '単位の取得に失敗しました');
      }

      setUnits(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 単位検索
  const searchUnits = useCallback(async (query: string): Promise<Unit[]> => {
    if (!query.trim()) {
      return [];
    }

    try {
      const response = await fetch(`/api/unit/registry?action=search&query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '単位検索に失敗しました');
      }

      return data.data;
    } catch (err) {
      console.error('Unit search error:', err);
      return [];
    }
  }, []);

  // 単位互換性チェック
  const checkCompatibility = useCallback(async (
    fromUnit: string, 
    toUnit: string
  ): Promise<UnitCompatibilityCheck | null> => {
    try {
      const response = await fetch(
        `/api/unit/registry?action=compatibility&fromUnit=${fromUnit}&toUnit=${toUnit}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '互換性チェックに失敗しました');
      }

      return data.data;
    } catch (err) {
      console.error('Compatibility check error:', err);
      return null;
    }
  }, []);

  // 単位変換
  const convertUnit = useCallback(async (
    value: number,
    fromUnit: string,
    toUnit: string
  ): Promise<ConversionResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/unit/registry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'convert',
          value,
          fromUnit,
          toUnit,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '単位変換に失敗しました');
      }

      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 一括変換
  const batchConvert = useCallback(async (
    conversions: BatchConversionRequest[]
  ): Promise<BatchConversionResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/unit/registry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'batch-convert',
          units: conversions,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '一括変換に失敗しました');
      }

      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // レジストリ初期化
  const initializeRegistry = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/unit/registry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'initialize',
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'レジストリの初期化に失敗しました');
      }

      // 初期化後に統計情報を再取得
      await fetchStats();
      
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchStats]);

  // 初期化時に統計情報を取得
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    // 状態
    isLoading,
    error,
    stats,
    categories,
    units,

    // アクション
    fetchStats,
    fetchCategories,
    fetchUnits,
    searchUnits,
    checkCompatibility,
    convertUnit,
    batchConvert,
    initializeRegistry,

    // ユーティリティ
    clearError: () => setError(null),
  };
}

// 単位変換専用のシンプルなフック
export function useUnitConversion() {
  const [isConverting, setIsConverting] = useState(false);
  const [lastResult, setLastResult] = useState<ConversionResult | null>(null);

  const convert = useCallback(async (
    value: number,
    fromUnit: string,
    toUnit: string
  ): Promise<ConversionResult | null> => {
    setIsConverting(true);

    try {
      const response = await fetch('/api/unit/registry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'convert',
          value,
          fromUnit,
          toUnit,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '変換に失敗しました');
      }

      setLastResult(data.data);
      return data.data;
    } catch (err) {
      console.error('Conversion error:', err);
      return null;
    } finally {
      setIsConverting(false);
    }
  }, []);

  return {
    convert,
    isConverting,
    lastResult,
  };
} 