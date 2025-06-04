'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';

interface EmbeddingProgressProps {
  isGenerating: boolean;
  totalColumns: number;
  processedColumns: number;
  avgTimePerColumn?: number;
  error?: string | null;
  onComplete?: () => void;
}

export function EmbeddingProgress({
  isGenerating,
  totalColumns,
  processedColumns,
  avgTimePerColumn,
  error,
  onComplete,
}: EmbeddingProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isGenerating && !startTime) {
      setStartTime(Date.now());
      setElapsedTime(0);
    } else if (!isGenerating && startTime) {
      setStartTime(null);
      if (processedColumns === totalColumns && onComplete) {
        onComplete();
      }
    }
  }, [isGenerating, startTime, processedColumns, totalColumns, onComplete]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating, startTime]);

  const progressPercentage = totalColumns > 0 ? (processedColumns / totalColumns) * 100 : 0;
  const estimatedTimeRemaining = avgTimePerColumn && processedColumns > 0 
    ? ((totalColumns - processedColumns) * avgTimePerColumn) / 1000 
    : null;

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (!isGenerating && processedColumns === totalColumns) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (isGenerating) return <Zap className="h-4 w-4 text-blue-500 animate-pulse" />;
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  const getStatusText = () => {
    if (error) return 'エラーが発生しました';
    if (!isGenerating && processedColumns === totalColumns) return '完了';
    if (isGenerating) return '埋め込み生成中...';
    return '待機中';
  };

  const getPerformanceBadge = () => {
    if (!avgTimePerColumn) return null;
    
    const isGood = avgTimePerColumn <= 300;
    const isWarning = avgTimePerColumn > 300 && avgTimePerColumn <= 500;
    const isError = avgTimePerColumn > 500;

    return (
      <Badge 
        variant={isGood ? 'default' : isWarning ? 'secondary' : 'destructive'}
        className="ml-2"
      >
        {avgTimePerColumn.toFixed(0)}ms/列
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          {getStatusIcon()}
          <span className="ml-2">{getStatusText()}</span>
          {getPerformanceBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 進捗バー */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{processedColumns} / {totalColumns} 列</span>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* 時間情報 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">経過時間:</span>
            <span className="ml-2 font-mono">
              {(elapsedTime / 1000).toFixed(1)}s
            </span>
          </div>
          {estimatedTimeRemaining !== null && (
            <div>
              <span className="text-gray-500">残り時間:</span>
              <span className="ml-2 font-mono">
                {estimatedTimeRemaining.toFixed(1)}s
              </span>
            </div>
          )}
        </div>

        {/* パフォーマンス情報 */}
        {avgTimePerColumn && (
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">平均処理時間:</span>
              <span className="font-mono">{avgTimePerColumn.toFixed(0)}ms/列</span>
            </div>
            {avgTimePerColumn > 500 && (
              <div className="text-amber-600 text-xs">
                ⚠️ 性能要件（500ms/列）を超過しています
              </div>
            )}
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-red-700 text-sm font-medium">エラー</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* 成功メッセージ */}
        {!isGenerating && processedColumns === totalColumns && !error && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-green-700 text-sm font-medium">
                埋め込み生成が完了しました
              </span>
            </div>
            <p className="text-green-600 text-sm mt-1">
              {totalColumns}列の埋め込みベクトルを生成しました
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 