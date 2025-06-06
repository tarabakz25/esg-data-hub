"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline';
import MappingResults from '@/components/file-details/MappingResults';
import KPIContributions from '@/components/file-details/KPIContributions';

interface FileDetails {
  id: number;
  filename: string;
  uploadedAt: string;
  processingStatus: string;
  detectedKpis: number;
  processedRecords: number;
  processingTimeMs: number;
  mappingResults: any;
  kpiContributions: any[];
}

export default function FileDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'mapping' | 'contributions'>('mapping');

  // paramsの型安全性を確保
  const fileId = params?.id as string | undefined;

  useEffect(() => {
    const fetchFileDetails = async () => {
      if (!fileId) {
        setError('ファイルIDが指定されていません');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard/file-details/${fileId}`);
        if (response.ok) {
          const data = await response.json();
          setFileDetails(data);
          setError(null);
        } else {
          throw new Error('ファイル詳細の取得に失敗しました');
        }
      } catch (error) {
        console.error('ファイル詳細取得エラー:', error);
        setError(error instanceof Error ? error.message : 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchFileDetails();
  }, [fileId]);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'processing':
        return { icon: '⚡', text: '処理中', color: 'text-blue-600 bg-blue-50' };
      case 'completed':
        return { icon: '✅', text: '処理完了', color: 'text-green-600 bg-green-50' };
      case 'error':
        return { icon: '❌', text: 'エラー', color: 'text-red-600 bg-red-50' };
      default:
        return { icon: '❓', text: '不明', color: 'text-gray-600 bg-gray-50' };
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">ファイル詳細を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">エラーが発生しました</h1>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              ダッシュボードに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!fileDetails) {
    return null;
  }

  const status = getStatusDisplay(fileDetails.processingStatus);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            ダッシュボードに戻る
          </button>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <DocumentTextIcon className="h-8 w-8 text-gray-400 mt-1" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {fileDetails.filename}
                  </h1>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatDateTime(fileDetails.uploadedAt)}
                    </span>
                    <span>処理時間: {fileDetails.processingTimeMs}ms</span>
                  </div>
                </div>
              </div>
              
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                <span className="mr-2">{status.icon}</span>
                {status.text}
              </div>
            </div>
            
            {/* 統計情報 */}
            <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{fileDetails.detectedKpis}</div>
                <div className="text-sm text-gray-600">検出されたKPI</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{fileDetails.processedRecords}</div>
                <div className="text-sm text-gray-600">処理レコード数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{fileDetails.processingTimeMs}ms</div>
                <div className="text-sm text-gray-600">処理時間</div>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('mapping')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'mapping'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🎯 KPIマッピング分析結果
              </button>
              <button
                onClick={() => setActiveTab('contributions')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'contributions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 累積KPIへの貢献度
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'mapping' ? (
              <MappingResults mappingResults={fileDetails.mappingResults} />
            ) : (
              <KPIContributions contributions={fileDetails.kpiContributions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 