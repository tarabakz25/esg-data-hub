import { useState } from 'react';
import { CSVAnalysisResult } from '@/app/api/csv/analyze/route';

interface CSVAnalysisResponse {
  success: boolean;
  analysis: CSVAnalysisResult;
  error?: string;
  details?: string;
  suggestion?: string;
}

export function useCSVAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CSVAnalysisResult | null>(null);

  const analyzeCSV = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setErrorDetails(null);
    setAnalysisResult(null);

    console.log(`Starting CSV analysis for file: ${file.name}`);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/csv/analyze', {
        method: 'POST',
        body: formData,
      });

      console.log(`API response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        
        const errorMessage = errorData.error || 'Failed to analyze CSV';
        const details = errorData.details || '';
        const suggestion = errorData.suggestion || '';
        
        setError(errorMessage);
        setErrorDetails(details + (suggestion ? ` | ${suggestion}` : ''));
        
        throw new Error(`${errorMessage}${details ? `: ${details}` : ''}`);
      }

      const result: CSVAnalysisResponse = await response.json();
      console.log('Analysis result received:', result);
      
      setAnalysisResult(result.analysis);
      return result.analysis;

    } catch (error) {
      console.error('CSV analysis error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (!error) {
        setError(errorMessage);
      }
      
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
    setErrorDetails(null);
  };

  return {
    analyzeCSV,
    clearAnalysis,
    isAnalyzing,
    error,
    errorDetails,
    analysisResult,
  };
} 