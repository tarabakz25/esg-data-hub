import { useState } from 'react';
import { ColumnMapping, SimilarityResult } from '@/lib/kpi-embedding-manager';

interface KPIStats {
  totalCount: number;
  categoryCount: number;
  categoryStats: Array<{ category: string; count: number }>;
  embeddingsGenerated: number;
}

interface KPISimilarityResponse {
  success: boolean;
  mapping: ColumnMapping;
  processingTimeMs: number;
  dictionaryStats: KPIStats;
}

interface HybridSearchResponse {
  success: boolean;
  query: string;
  results: SimilarityResult[];
  processingTimeMs: number;
  searchParams: {
    vectorWeight: number;
    textWeight: number;
  };
}

export function useKpiSimilarity() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMapping, setLastMapping] = useState<ColumnMapping | null>(null);

  const suggestKPIMapping = async (
    columnName: string,
    sampleValues?: string[],
    limit: number = 3
  ) => {
    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch('/api/kpi/similarity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          columnName,
          sampleValues,
          limit,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to suggest KPI mapping');
      }

      const result: KPISimilarityResponse = await response.json();
      setLastMapping(result.mapping);

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setIsSearching(false);
    }
  };

  const hybridKPISearch = async (
    query: string,
    vectorWeight: number = 0.7,
    textWeight: number = 0.3
  ) => {
    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch('/api/kpi/similarity', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          vectorWeight,
          textWeight,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to perform hybrid search');
      }

      const result: HybridSearchResponse = await response.json();
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setIsSearching(false);
    }
  };

  return {
    suggestKPIMapping,
    hybridKPISearch,
    isSearching,
    error,
    lastMapping,
    clearError: () => setError(null),
  };
}

// バッチ処理用（複数列を一括でマッピング）
export function useBatchKPIMapping() {
  const { suggestKPIMapping } = useKpiSimilarity();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [results, setResults] = useState<ColumnMapping[]>([]);

  const processBatchMapping = async (
    columns: Array<{ columnName: string; sampleValues?: string[] }>,
    limit: number = 3
  ) => {
    setIsProcessing(true);
    setProcessedCount(0);
    setResults([]);

    const batchResults: ColumnMapping[] = [];

    try {
      for (let i = 0; i < columns.length; i++) {
        const { columnName, sampleValues } = columns[i];
        
        try {
          const response = await suggestKPIMapping(columnName, sampleValues, limit);
          batchResults.push(response.mapping);
        } catch (error) {
          console.error(`Failed to process column ${columnName}:`, error);
          // エラーの場合も結果に含める
          batchResults.push({
            columnName,
            sampleValues,
            topMatches: [],
            confidence: 0,
          });
        }

        setProcessedCount(i + 1);
        setResults([...batchResults]);
      }

      return batchResults;

    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processBatchMapping,
    isProcessing,
    processedCount,
    results,
  };
}

// KPI統計情報の管理
export function useKpiStats() {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<KPIStats | null>(null);
  const [categoryDistribution, setCategoryDistribution] = useState<Record<string, number>>({});

  const fetchStats = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/kpi/similarity');

      if (!response.ok) {
        throw new Error('Failed to fetch KPI stats');
      }

      const result = await response.json();
      setStats(result.stats);
      setCategoryDistribution(result.categoryDistribution);

      return result;

    } catch (error) {
      console.error('Failed to fetch KPI stats:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateEmbeddings = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/kpi/similarity?action=generate-embeddings');

      if (!response.ok) {
        throw new Error('Failed to generate embeddings');
      }

      const result = await response.json();
      
      // 統計情報を再取得
      await fetchStats();

      return result;

    } catch (error) {
      console.error('Failed to generate embeddings:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchStats,
    generateEmbeddings,
    isLoading,
    stats,
    categoryDistribution,
  };
} 