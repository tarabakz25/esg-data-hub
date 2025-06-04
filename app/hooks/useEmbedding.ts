import useSWR from 'swr';
import { useState } from 'react';

interface EmbeddingGenerationRequest {
  columnNames: string[];
  dataRowIds: number[];
}

interface EmbeddingGenerationResponse {
  success: boolean;
  embeddings: number[][];
  processingTimeMs: number;
  avgTimePerColumn: number;
  columnsProcessed: number;
}

interface EmbeddingData {
  embedding: number[] | null;
  hasEmbedding: boolean;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useEmbedding(dataRowId?: number) {
  const { data, error, isLoading } = useSWR<EmbeddingData>(
    dataRowId ? `/api/embedding/generate?dataRowId=${dataRowId}` : null,
    fetcher
  );

  return {
    embedding: data?.embedding,
    hasEmbedding: data?.hasEmbedding ?? false,
    isLoading,
    error,
  };
}

export function useEmbeddingGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<EmbeddingGenerationResponse | null>(null);

  const generateEmbeddings = async (request: EmbeddingGenerationRequest) => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch('/api/embedding/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate embeddings');
      }

      const result: EmbeddingGenerationResponse = await response.json();
      setLastResult(result);

      // 性能警告の表示
      if (result.avgTimePerColumn > 500) {
        console.warn(`Performance warning: Average time per column (${result.avgTimePerColumn}ms) exceeded 500ms threshold`);
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setGenerationError(errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateEmbeddings,
    isGenerating,
    generationError,
    lastResult,
    clearError: () => setGenerationError(null),
  };
}

// バッチ処理用のヘルパー関数
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function generateEmbeddingsInBatches(
  columnNames: string[],
  dataRowIds: number[],
  batchSize: number = 10
): Promise<EmbeddingGenerationResponse[]> {
  const nameChunks = chunkArray(columnNames, batchSize);
  const idChunks = chunkArray(dataRowIds, batchSize);
  
  const results: EmbeddingGenerationResponse[] = [];
  
  for (let i = 0; i < nameChunks.length; i++) {
    const response = await fetch('/api/embedding/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        columnNames: nameChunks[i],
        dataRowIds: idChunks[i],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Batch ${i + 1} failed: ${errorData.error}`);
    }

    const result = await response.json();
    results.push(result);
  }

  return results;
} 