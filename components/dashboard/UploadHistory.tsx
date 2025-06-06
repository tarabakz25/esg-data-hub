"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline';

interface FileHistory {
  id: number;
  filename: string;
  uploadedAt: string;
  processingStatus: 'processing' | 'completed' | 'error';
  detectedKpis: number;
  processedRecords: number;
  processingTimeMs?: number;
}

export default function UploadHistory() {
  const [files, setFiles] = useState<FileHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/file-history');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
        setError(null);
      } else {
        throw new Error('履歴データの取得に失敗しました');
      }
    } catch (error) {
      console.error('履歴取得エラー:', error);
      setError(error instanceof Error ? error.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'processing':
        return { icon: '⚡', text: '処理中', color: 'text-blue-600 bg-blue-50' };
      case 'completed':
        return { icon: '✅', text: '完了', color: 'text-green-600 bg-green-50' };
      case 'error':
        return { icon: '❌', text: 'エラー', color: 'text-red-600 bg-red-50' };
      default:
        return { icon: '❓', text: '不明', color: 'text-gray-600 bg-gray-50' };
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFileClick = (fileId: number) => {
            router.push(`/file-details/${fileId}`);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">履歴を読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-2">❌</div>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="p-6 text-center">
        <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 text-sm">アップロード履歴がありません</p>
        <p className="text-gray-500 text-xs mt-1">
          ファイルをアップロードすると、ここに履歴が表示されます
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {files.slice(0, 10).map((file) => {
        const status = getStatusDisplay(file.processingStatus);
        return (
          <div
            key={file.id}
            onClick={() => handleFileClick(file.id)}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <DocumentTextIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate hover:text-blue-600">
                    {file.filename}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500 flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {formatDateTime(file.uploadedAt)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {file.detectedKpis}個のKPI
                    </span>
                    <span className="text-xs text-gray-500">
                      {file.processedRecords}レコード
                    </span>
                    {file.processingTimeMs && (
                      <span className="text-xs text-gray-500">
                        {file.processingTimeMs}ms
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                <span className="mr-1">{status.icon}</span>
                {status.text}
              </div>
            </div>
          </div>
        );
      })}
      
      {files.length > 10 && (
        <div className="p-4 text-center border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            さらに表示 ({files.length - 10}件)
          </button>
        </div>
      )}
    </div>
  );
} 