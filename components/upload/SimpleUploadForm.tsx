"use client";

import { useCallback, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CloudArrowUpIcon, DocumentIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { SimpleErrorBoundary } from '../ui/error-boundary';

interface UploadProgress {
  phase: 'uploading' | 'analyzing' | 'mapping' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  details?: string;
}

export default function SimpleUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ファイル検証をメモ化
  const validateFile = useCallback((file: File): string | null => {
    const maxSize = 50 * 1024 * 1024; // 50MB (本番環境に合わせて更新)
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    
    if (file.size > maxSize) {
      return 'ファイルサイズは50MB以下にしてください';
    }
    
    if (file.size === 0) {
      return '空のファイルはアップロードできません';
    }
    
    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExtension = allowedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    if (!hasValidType && !hasValidExtension) {
      return 'CSV、Excel（.xlsx、.xls）ファイルを選択してください';
    }
    
    return null;
  }, []);

  // ファイル選択ボタンのクリックハンドラー
  const handleFileSelectClick = useCallback(() => {
    if (uploadProgress) return; // アップロード中は無効
    fileInputRef.current?.click();
  }, [uploadProgress]);

  // ドラッグ&ドロップハンドラー
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploadProgress) return; // アップロード中は無効
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, [uploadProgress]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (uploadProgress) return; // アップロード中は無効

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const selectedFile = files[0];
      const validationError = validateFile(selectedFile);
      
      if (validationError) {
        setError(validationError);
        return;
      }
      
      setFile(selectedFile);
    }
  }, [validateFile, uploadProgress]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      
      if (validationError) {
        setError(validationError);
        return;
      }
      
      setFile(selectedFile);
    }
  }, [validateFile]);

  // 進捗状況の表示内容をメモ化
  const progressDisplay = useMemo(() => {
    if (!uploadProgress) return null;

    const getProgressColor = () => {
      if (uploadProgress.phase === 'error') return 'bg-red-500';
      if (uploadProgress.phase === 'completed') return 'bg-green-500';
      return 'bg-blue-500';
    };

    const getPhaseIcon = () => {
      switch (uploadProgress.phase) {
        case 'uploading': return '📤';
        case 'analyzing': return '🔍';
        case 'mapping': return '🤖';
        case 'processing': return '⚙️';
        case 'completed': return '✅';
        case 'error': return '❌';
        default: return '⏳';
      }
    };

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center mb-2">
          <span className="text-lg mr-2">{getPhaseIcon()}</span>
          <span className="font-medium text-gray-900">{uploadProgress.message}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${uploadProgress.progress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>{uploadProgress.details}</span>
          <span>{uploadProgress.progress}%</span>
        </div>
      </div>
    );
  }, [uploadProgress]);

  const uploadFile = useCallback(async () => {
    if (!file) return;

    try {
      setUploadProgress({
        phase: 'uploading',
        progress: 0,
        message: 'ファイルをアップロード中...',
        details: 'サーバーにファイルを送信しています'
      });

      const formData = new FormData();
      formData.append('file', file);

      // シミュレートされた進捗更新
      const updateProgress = (phase: UploadProgress['phase'], progress: number, message: string, details?: string) => {
        setUploadProgress({ phase, progress, message, details });
      };

      // アップロード開始
      updateProgress('uploading', 25, 'ファイルをアップロード中...', 'データを送信中...');

      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'アップロードに失敗しました';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // 分析フェーズ
      updateProgress('analyzing', 50, 'CSVデータを分析中...', 'データ構造を解析しています');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // マッピングフェーズ
      updateProgress('mapping', 75, 'KPIマッピングを実行中...', 'AI が標準KPIに自動マッピング中');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 処理完了
      updateProgress('processing', 90, 'データを処理中...', '累積データを更新しています');
      await new Promise(resolve => setTimeout(resolve, 800));

      updateProgress('completed', 100, '処理が完了しました！', 'ダッシュボードに移動します...');

      // 完了後、ダッシュボードにリダイレクト
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress({
        phase: 'error',
        progress: 0,
        message: 'アップロードエラー',
        details: error instanceof Error ? error.message : '不明なエラーが発生しました'
      });
    }
  }, [file, router]);

  const resetForm = useCallback(() => {
    setFile(null);
    setUploadProgress(null);
    setError(null);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <SimpleErrorBoundary fallback="アップロードフォームでエラーが発生しました">
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ESGデータファイルアップロード
          </h1>
          <p className="text-gray-600">
            CSV、Excelファイルをアップロードして、自動的にKPIマッピングを実行します
          </p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* ファイル選択エリア */}
        <div className="mb-6">
          {/* 隠されたファイル入力 */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            disabled={!!uploadProgress}
          />

          {/* ドラッグ&ドロップエリア */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : uploadProgress
                ? 'border-gray-200 bg-gray-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="space-y-4">
                <DocumentIcon className="mx-auto h-12 w-12 text-green-500" />
                <div>
                  <p className="text-lg font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    サイズ: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                {!uploadProgress && (
                  <div className="flex space-x-3 justify-center">
                    <button
                      onClick={uploadFile}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                    >
                      📤 アップロード開始
                    </button>
                    <button
                      onClick={handleFileSelectClick}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                      📁 別のファイルを選択
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                    >
                      🗑️ クリア
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    ファイルをここにドラッグ&ドロップ
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    またはボタンをクリックしてファイルを選択
                  </p>
                  <button
                    onClick={handleFileSelectClick}
                    disabled={!!uploadProgress}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      uploadProgress
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    📁 ファイルを選択
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  サポート形式: CSV, Excel (.xlsx, .xls)（最大50MB）
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 進捗表示 */}
        {progressDisplay}

        {/* 完了時のアクション */}
        {uploadProgress?.phase === 'completed' && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="text-center">
              <p className="text-green-800 mb-4">
                ✅ アップロードと処理が正常に完了しました！
              </p>
              <div className="space-x-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  📊 ダッシュボードを表示
                </button>
                <button
                  onClick={() => router.push('/data-management')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  📋 データ管理画面へ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* エラー時のアクション */}
        {uploadProgress?.phase === 'error' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="text-center">
              <p className="text-red-800 mb-4">
                ❌ {uploadProgress.details}
              </p>
              <div className="space-x-3">
                <button
                  onClick={uploadFile}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  🔄 再試行
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  🗑️ リセット
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ヘルプセクション */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 使用方法</h3>
          <div className="space-y-3 text-blue-700">
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
              <div>
                <p className="font-medium">ファイルを選択</p>
                <p className="text-sm">ドラッグ&ドロップまたは「ファイルを選択」ボタンをクリック</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
              <div>
                <p className="font-medium">アップロード開始</p>
                <p className="text-sm">「アップロード開始」ボタンをクリックして処理を開始</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
              <div>
                <p className="font-medium">自動処理</p>
                <p className="text-sm">AI による自動KPIマッピングと累積データの更新</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">📋 サポートするファイル形式</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>CSV</strong>: カンマ区切りファイル (.csv)</li>
              <li>• <strong>Excel</strong>: Microsoft Excel ファイル (.xlsx, .xls)</li>
              <li>• <strong>ファイルサイズ</strong>: 最大 50MB</li>
              <li>• <strong>推奨列</strong>: kpiId, value, unit, period, dataRowId</li>
            </ul>
          </div>
        </div>
      </div>
    </SimpleErrorBoundary>
  );
} 