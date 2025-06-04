import { useState } from 'react';
import { SampleAnalysis } from '@/lib/sample-analyzer';

interface SampleEmbeddingRequest {
  dataRowId: number;
  columnName: string;
  sampleValues: string[];
}

interface SampleEmbeddingResponse {
  success: boolean;
  dataRowId: number;
  columnName: string;
  analysis: SampleAnalysis;
  embedding: number[];
  hybridText: string;
  processingTimeMs: number;
}

export function useSampleEmbedding() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SampleEmbeddingResponse | null>(null);

  const generateSampleEmbedding = async (request: SampleEmbeddingRequest) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/embedding/sample', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate sample embedding');
      }

      const result: SampleEmbeddingResponse = await response.json();
      setLastResult(result);

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeSamplesOnly = async (sampleValues: string[], columnName: string = 'unknown') => {
    try {
      const samplesParam = sampleValues.join(',');
      const response = await fetch(`/api/embedding/sample?samples=${encodeURIComponent(samplesParam)}&columnName=${encodeURIComponent(columnName)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze samples');
      }

      return await response.json();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      throw error;
    }
  };

  return {
    generateSampleEmbedding,
    analyzeSamplesOnly,
    isGenerating,
    error,
    lastResult,
    clearError: () => setError(null),
  };
}

// CSVデータから自動でサンプル値埋め込みを生成するヘルパー
export function useAutoSampleEmbedding() {
  const { generateSampleEmbedding } = useSampleEmbedding();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  const processCSVData = async (csvData: Array<Record<string, any>>, maxSamples: number = 5) => {
    setIsProcessing(true);
    setProcessedCount(0);

    try {
      if (csvData.length === 0) {
        throw new Error('No CSV data provided');
      }

      const columnNames = Object.keys(csvData[0]);
      const results = [];

      for (let i = 0; i < columnNames.length; i++) {
        const columnName = columnNames[i];
        
        // サンプル値を収集（最大maxSamples個）
        const sampleValues = csvData
          .slice(0, maxSamples)
          .map(row => row[columnName])
          .filter(val => val != null && val.toString().trim() !== '')
          .map(val => val.toString());

        if (sampleValues.length > 0) {
          try {
            const result = await generateSampleEmbedding({
              dataRowId: i + 1, // 仮のID
              columnName,
              sampleValues,
            });
            results.push(result);
          } catch (error) {
            console.error(`Failed to process column ${columnName}:`, error);
            results.push({
              success: false,
              columnName,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        setProcessedCount(i + 1);
      }

      return results;

    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processCSVData,
    isProcessing,
    processedCount,
  };
} 