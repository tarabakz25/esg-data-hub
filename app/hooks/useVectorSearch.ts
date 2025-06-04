import useSWR from 'swr';
import { useState } from 'react';

interface VectorSearchRequest {
  queryVector: number[];
  limit?: number;
  threshold?: number;
  searchType?: 'cosine' | 'l2' | 'inner_product';
}

interface VectorSearchResult {
  id: number;
  raw: any;
  embedding: string;
  similarity?: number;
  distance?: number;
  negative_inner_product?: number;
}

interface VectorSearchResponse {
  success: boolean;
  results: VectorSearchResult[];
  searchType: string;
  queryVector: number[];
  limit: number;
  threshold?: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useVectorSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<VectorSearchResponse | null>(null);

  const searchSimilar = async (request: VectorSearchRequest) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch('/api/embedding/generate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queryVector: request.queryVector,
          limit: request.limit || 10,
          threshold: request.threshold || 0.7,
          searchType: request.searchType || 'cosine',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to perform vector search');
      }

      const result: VectorSearchResponse = await response.json();
      setLastResult(result);

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSearchError(errorMessage);
      throw error;
    } finally {
      setIsSearching(false);
    }
  };

  const findSimilarColumns = async (columnName: string, limit: number = 5) => {
    // まず列名の埋め込みを生成
    const embeddingResponse = await fetch('/api/embedding/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        columnNames: [columnName],
        dataRowIds: [-1], // ダミーID（実際には保存しない）
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate embedding for column name');
    }

    const embeddingData = await embeddingResponse.json();
    const queryVector = embeddingData.embeddings[0];

    // 類似度検索を実行
    return await searchSimilar({
      queryVector,
      limit,
      threshold: 0.5,
      searchType: 'cosine',
    });
  };

  return {
    searchSimilar,
    findSimilarColumns,
    isSearching,
    searchError,
    lastResult,
    clearError: () => setSearchError(null),
  };
}

// KPIマッピング用のヘルパーフック
export function useKpiMapping() {
  const { searchSimilar } = useVectorSearch();
  const [mappingResults, setMappingResults] = useState<any[]>([]);

  const mapColumnsToKpis = async (columnNames: string[]) => {
    const results = [];

    for (const columnName of columnNames) {
      try {
        // 列名の埋め込みを生成
        const embeddingResponse = await fetch('/api/embedding/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            columnNames: [columnName],
            dataRowIds: [-1],
          }),
        });

        if (embeddingResponse.ok) {
          const embeddingData = await embeddingResponse.json();
          const queryVector = embeddingData.embeddings[0];

          // 類似KPIを検索
          const searchResult = await searchSimilar({
            queryVector,
            limit: 3,
            threshold: 0.6,
            searchType: 'cosine',
          });

          results.push({
            columnName,
            embedding: queryVector,
            similarKpis: searchResult.results,
            confidence: searchResult.results[0]?.similarity || 0,
          });
        }
      } catch (error) {
        console.error(`Failed to map column: ${columnName}`, error);
        results.push({
          columnName,
          embedding: null,
          similarKpis: [],
          confidence: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    setMappingResults(results);
    return results;
  };

  return {
    mapColumnsToKpis,
    mappingResults,
    clearResults: () => setMappingResults([]),
  };
} 