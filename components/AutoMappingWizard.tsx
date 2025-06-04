'use client';

import React, { useState, useCallback } from 'react';
import { useCSVAnalysis } from '@/app/hooks/useCSVAnalysis';
import { useBatchKPIMapping } from '@/app/hooks/useKpiSimilarity';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ColumnMapping } from '@/lib/kpi-embedding-manager';
import { CSVColumnInfo } from '@/app/api/csv/analyze/route';
import { CheckCircle, XCircle, AlertTriangle, Clock, Eye, Save, RotateCcw, Upload, Search, Bot, FileCheck } from 'lucide-react';

type WizardStep = 'upload' | 'analyze' | 'mapping' | 'review';

interface MappingDecision {
  columnName: string;
  accepted: boolean;
  selectedKPIId?: string;
  confidence: number;
  manuallyAdjusted: boolean;
  timestamp: Date;
  approver?: string;
}

interface MappingHistory {
  id: string;
  columnName: string;
  previousKPIId?: string;
  newKPIId?: string;
  action: 'approved' | 'rejected' | 'modified';
  timestamp: Date;
  approver: string;
  reason?: string;
}

export function AutoMappingWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mappingDecisions, setMappingDecisions] = useState<MappingDecision[]>([]);
  const [mappingHistory, setMappingHistory] = useState<MappingHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());

  const { analyzeCSV, isAnalyzing, analysisResult, error: analysisError, errorDetails } = useCSVAnalysis();
  const { processBatchMapping, isProcessing, processedCount, results } = useBatchKPIMapping();

  // 信頼度に基づく色分け
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.7) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (confidence >= 0.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // アイコン機能の修正
  const getConfidenceIcon = (confidence: number) => {
    const iconProps = { className: "w-4 h-4" };
    
    if (confidence >= 0.9) return <CheckCircle {...iconProps} className="w-4 h-4 text-green-600" />;
    if (confidence >= 0.7) return <CheckCircle {...iconProps} className="w-4 h-4 text-blue-600" />;
    if (confidence >= 0.5) return <AlertTriangle {...iconProps} className="w-4 h-4 text-yellow-600" />;
    return <XCircle {...iconProps} className="w-4 h-4 text-red-600" />;
  };

  // ステップ1: ファイルアップロード
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAnalyzeFile = async () => {
    if (!selectedFile) return;

    try {
      await analyzeCSV(selectedFile);
      setCurrentStep('analyze');
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  // ステップ2: 列分析からマッピング実行
  const handleStartMapping = async () => {
    if (!analysisResult) return;

    setCurrentStep('mapping');

    const columns = analysisResult.columns.map(col => ({
      columnName: col.columnName,
      sampleValues: col.sampleValues,
    }));

    try {
      await processBatchMapping(columns);
      
      // 初期決定状態を設定（信頼度≥0.8は自動承認）
      const initialDecisions = results.map(result => ({
        columnName: result.columnName,
        accepted: result.confidence >= 0.8,
        selectedKPIId: result.bestMatch?.kpi.id,
        confidence: result.confidence,
        manuallyAdjusted: false,
        timestamp: new Date(),
      }));
      
      setMappingDecisions(initialDecisions);
      setCurrentStep('review');
    } catch (error) {
      console.error('Mapping failed:', error);
    }
  };

  // マッピング決定の処理
  const handleMappingDecision = useCallback((
    columnName: string, 
    accepted: boolean, 
    kpiId?: string,
    isManual: boolean = false
  ) => {
    setMappingDecisions(prev => 
      prev.map(decision => {
        if (decision.columnName === columnName) {
          const newDecision = {
            ...decision,
            accepted,
            selectedKPIId: kpiId,
            manuallyAdjusted: isManual || decision.manuallyAdjusted,
            timestamp: new Date(),
          };

          // 履歴に記録
          if (decision.accepted !== accepted || decision.selectedKPIId !== kpiId) {
            const historyEntry: MappingHistory = {
              id: `${columnName}-${Date.now()}`,
              columnName,
              previousKPIId: decision.selectedKPIId,
              newKPIId: kpiId,
              action: accepted ? 'approved' : 'rejected',
              timestamp: new Date(),
              approver: 'current-user', // TODO: 実際のユーザー情報を取得
              reason: isManual ? '手動調整' : '自動判定',
            };
            setMappingHistory(prev => [...prev, historyEntry]);
          }

          return newDecision;
        }
        return decision;
      })
    );
  }, []);

  // 一括承認機能
  const handleBulkApproval = useCallback((threshold: number = 0.9) => {
    const highConfidenceColumns = results
      .filter(result => result.confidence >= threshold)
      .map(result => result.columnName);

    highConfidenceColumns.forEach(columnName => {
      const result = results.find(r => r.columnName === columnName);
      if (result?.bestMatch) {
        handleMappingDecision(columnName, true, result.bestMatch.kpi.id);
      }
    });

    // 一括承認の履歴記録
    const bulkHistoryEntry: MappingHistory = {
      id: `bulk-${Date.now()}`,
      columnName: `一括承認 (${highConfidenceColumns.length}件)`,
      action: 'approved',
      timestamp: new Date(),
      approver: 'current-user',
      reason: `信頼度${threshold * 100}%以上の項目を一括承認`,
    };
    setMappingHistory(prev => [...prev, bulkHistoryEntry]);
  }, [results, handleMappingDecision]);

  // 列選択の管理
  const handleColumnSelect = (columnName: string, selected: boolean) => {
    setSelectedColumns(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(columnName);
      } else {
        newSet.delete(columnName);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedColumns(new Set(results.map(r => r.columnName)));
    } else {
      setSelectedColumns(new Set());
    }
  };

  // 選択された列の一括操作
  const handleBulkAction = (action: 'approve' | 'reject') => {
    selectedColumns.forEach(columnName => {
      const result = results.find(r => r.columnName === columnName);
      if (result) {
        handleMappingDecision(
          columnName, 
          action === 'approve', 
          action === 'approve' ? result.bestMatch?.kpi.id : undefined
        );
      }
    });
    setSelectedColumns(new Set());
    setBulkSelectMode(false);
  };

  // 最終保存
  const handleSaveMapping = async () => {
    const acceptedMappings = mappingDecisions.filter(d => d.accepted);
    
    try {
      // TODO: 実際のAPI呼び出しでマッピング結果を保存
      console.log('Saving mappings:', acceptedMappings);
      console.log('Mapping history:', mappingHistory);
      
      // 保存成功の履歴記録
      const saveHistoryEntry: MappingHistory = {
        id: `save-${Date.now()}`,
        columnName: `保存完了 (${acceptedMappings.length}件)`,
        action: 'approved',
        timestamp: new Date(),
        approver: 'current-user',
        reason: 'マッピング結果を保存',
      };
      setMappingHistory(prev => [...prev, saveHistoryEntry]);

      alert(`${acceptedMappings.length}個のマッピングを保存しました`);
    } catch (error) {
      console.error('Save failed:', error);
      alert('保存に失敗しました');
    }
  };

  const resetWizard = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setMappingDecisions([]);
    setMappingHistory([]);
    setSelectedColumns(new Set());
    setBulkSelectMode(false);
  };

  // 統計情報の計算
  const getStatistics = () => {
    const total = mappingDecisions.length;
    const approved = mappingDecisions.filter(d => d.accepted).length;
    const highConfidence = mappingDecisions.filter(d => d.confidence >= 0.8).length;
    const manualAdjusted = mappingDecisions.filter(d => d.manuallyAdjusted).length;

    return { total, approved, highConfidence, manualAdjusted };
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">KPI自動マッピングウィザード</h1>
        <p className="text-gray-600">CSVファイルの列を自動的にKPIにマッピングします</p>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            🚧 現在、一部機能を調整中です。基本的な表示のみ利用可能です。
          </p>
        </div>
      </div>

      {/* ステップインジケーター */}
      <div className="flex justify-center space-x-4 mb-8">
        {[
          { key: 'upload', label: 'ファイル選択', icon: Upload },
          { key: 'analyze', label: '列分析', icon: Search },
          { key: 'mapping', label: 'マッピング実行', icon: Bot },
          { key: 'review', label: '結果確認', icon: FileCheck },
        ].map((step, index) => {
          const IconComponent = step.icon;
          const stepIndex = ['upload', 'analyze', 'mapping', 'review'].indexOf(currentStep);
          const isActive = currentStep === step.key;
          const isCompleted = stepIndex > index;
          
          return (
          <div key={step.key} className="flex items-center">
            <div className={`
                w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors
                ${isActive ? 'bg-blue-500 text-white border-blue-500' : 
                  isCompleted ? 'bg-green-500 text-white border-green-500' : 
                  'bg-gray-100 text-gray-600 border-gray-300'}
              `}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                  {step.label}
                </div>
                <div className="text-xs text-gray-500">Step {index + 1}</div>
              </div>
              {index < 3 && (
                <div className={`w-8 h-0.5 mx-4 transition-colors ${stepIndex > index ? 'bg-green-400' : 'bg-gray-300'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ステップ1: ファイルアップロード */}
      {currentStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>CSVファイルの選択</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-file"
              />
              <label
                htmlFor="csv-file"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="w-12 h-12 text-gray-400" />
                <span className="text-lg font-medium text-gray-700">
                  CSVファイルを選択してください
                </span>
                <span className="text-sm text-gray-500">
                  またはファイルをここにドラッグ&ドロップ
                </span>
              </label>
            </div>

            {selectedFile && (
              <Alert>
                <FileCheck className="h-4 w-4" />
                <AlertDescription>
                  選択されたファイル: {selectedFile.name}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleAnalyzeFile}
              disabled={!selectedFile || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  ファイルを分析
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ステップ2: 列分析結果 */}
      {currentStep === 'analyze' && analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>列分析結果</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysisResult.columns.map((column, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">{column.columnName}</h4>
                    <Badge variant="outline">{column.dataType}</Badge>
                    <div className="text-xs text-gray-600">
                      サンプル: {column.sampleValues.slice(0, 3).join(', ')}
                    </div>
          </div>
                </Card>
        ))}
      </div>

            <Button 
              onClick={handleStartMapping}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Bot className="w-4 h-4 mr-2 animate-pulse" />
                  マッピング実行中...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 mr-2" />
                  自動マッピングを開始
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ステップ3: マッピング進行状況 */}
      {currentStep === 'mapping' && (
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span>自動マッピング実行中</span>
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>進行状況</span>
                <span>{processedCount} / {analysisResult?.columns.length || 0}</span>
              </div>
              <Progress 
                value={analysisResult ? (processedCount / analysisResult.columns.length) * 100 : 0} 
                className="w-full"
              />
            </div>
            
            <Alert>
              <Bot className="h-4 w-4" />
              <AlertDescription>
                AIがCSVの各列に最適なKPIマッピングを実行しています...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* ステップ4: 結果確認 */}
      {currentStep === 'review' && results.length > 0 && (
        <div className="space-y-6">
          {/* 統計情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5" />
                <span>マッピング結果</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(() => {
                  const stats = getStatistics();
                  return (
                    <>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                        <div className="text-sm text-blue-600">総列数</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                        <div className="text-sm text-green-600">承認済み</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{stats.highConfidence}</div>
                        <div className="text-sm text-yellow-600">高信頼度</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{stats.manualAdjusted}</div>
                        <div className="text-sm text-purple-600">手動調整</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* 一括操作 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => handleBulkApproval(0.9)}
                  variant="outline"
                  size="sm"
                >
                  高信頼度を一括承認 (90%+)
                </Button>
                <Button 
                  onClick={() => handleBulkApproval(0.7)}
                  variant="outline" 
                  size="sm"
                >
                  中信頼度を一括承認 (70%+)
                </Button>
                <Button 
                  onClick={() => setBulkSelectMode(!bulkSelectMode)}
                  variant="outline"
                  size="sm"
                >
                  {bulkSelectMode ? '選択モード終了' : '一括選択モード'}
                </Button>
                {bulkSelectMode && selectedColumns.size > 0 && (
                  <>
                    <Button 
                      onClick={() => handleBulkAction('approve')}
                      size="sm"
                    >
                      選択項目を承認 ({selectedColumns.size})
                    </Button>
                    <Button 
                      onClick={() => handleBulkAction('reject')}
                      variant="destructive"
                      size="sm"
                    >
                      選択項目を拒否
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* マッピング結果一覧 */}
          <div className="space-y-4">
            {results.map((result, index) => {
              const decision = mappingDecisions.find(d => d.columnName === result.columnName);
              const isSelected = selectedColumns.has(result.columnName);
              
              return (
                <Card key={index} className={`transition-colors ${decision?.accepted ? 'border-green-200 bg-green-50' : ''}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      {bulkSelectMode && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            handleColumnSelect(result.columnName, checked as boolean)
                          }
                        />
                      )}
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-lg">{result.columnName}</h4>
                          <div className="flex items-center space-x-2">
                            {getConfidenceIcon(result.confidence)}
                            <Badge className={getConfidenceColor(result.confidence)}>
                              {Math.round(result.confidence * 100)}% 信頼度
                            </Badge>
                          </div>
                        </div>

                        {result.bestMatch && (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">推奨マッピング:</span>
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => handleMappingDecision(result.columnName, true, result.bestMatch?.kpi.id)}
                                  size="sm"
                                  variant={decision?.accepted ? "default" : "outline"}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  承認
                                </Button>
                                <Button
                                  onClick={() => handleMappingDecision(result.columnName, false)}
                                  size="sm"
                                  variant={decision?.accepted === false ? "destructive" : "outline"}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  拒否
                                </Button>
                              </div>
                            </div>
                            <div className="text-sm text-gray-700">
                              <div><strong>KPI名:</strong> {result.bestMatch.kpi.name}</div>
                              <div><strong>カテゴリ:</strong> {result.bestMatch.kpi.category}</div>
                              <div><strong>単位:</strong> {result.bestMatch.kpi.unit}</div>
                            </div>
                          </div>
                        )}

                        {/* 代替候補 - topMatchesを使用 */}
                        {result.topMatches && result.topMatches.length > 1 && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-gray-700">代替候補:</span>
                            <Select
                              onValueChange={(value) => 
                                handleMappingDecision(result.columnName, true, value, true)
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="代替KPIを選択..." />
                              </SelectTrigger>
                              <SelectContent>
                                {result.topMatches.slice(1).map((match, matchIndex) => (
                                  <SelectItem key={matchIndex} value={match.kpi.id}>
                                    {match.kpi.name} (信頼度: {Math.round(match.similarity * 100)}%)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {decision?.manuallyAdjusted && (
                          <Badge variant="outline" className="text-purple-600 bg-purple-50">
                            手動調整済み
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 保存ボタン */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex space-x-4">
                <Button 
                  onClick={handleSaveMapping}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  マッピング結果を保存
                </Button>
                <Button 
                  onClick={resetWizard}
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  最初からやり直し
                </Button>
          <Button
                  onClick={() => setShowHistory(!showHistory)}
                  variant="outline"
          >
                  <Eye className="w-4 h-4 mr-2" />
                  履歴表示
          </Button>
              </div>
            </CardContent>
          </Card>

          {/* 履歴表示 */}
          {showHistory && (
            <Card>
              <CardHeader>
                <CardTitle>マッピング履歴</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mappingHistory.map((history, index) => (
                    <div key={history.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{history.columnName}</div>
                          <div className="text-gray-600">{history.reason}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant={history.action === 'approved' ? 'default' : 'destructive'}>
                            {history.action}
                          </Badge>
                          <div className="text-gray-500 text-xs mt-1">
                            {history.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {mappingHistory.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      履歴がありません
                    </div>
                  )}
                </div>
        </CardContent>
      </Card>
          )}
        </div>
      )}

      {/* エラー表示 */}
      {analysisError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div>
                <strong>エラーが発生しました:</strong> {analysisError}
              </div>
              {errorDetails && (
                <div className="text-sm bg-red-50 p-2 rounded border border-red-200">
                  <strong>詳細:</strong> {errorDetails}
                </div>
              )}
              <div className="text-sm text-red-600">
                <strong>対処方法:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>CSVファイルが正しい形式（カンマ区切り）であることを確認してください</li>
                  <li>ファイルの最初の行がヘッダー（列名）になっていることを確認してください</li>
                  <li>ファイルサイズが大きすぎないことを確認してください</li>
                  <li>文字エンコーディングがUTF-8であることを確認してください</li>
                </ul>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                問題が解決しない場合は、開発者ツールのコンソールで詳細なエラー情報を確認してください。
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 