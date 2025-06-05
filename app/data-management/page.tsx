"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, ExternalLink, Download, Eye, Activity, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface UploadRecord {
  id: number;
  filename: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'parsed' | 'errored' | 'COMPLETED' | 'PROCESSING' | 'ERROR' | 'PENDING';
  statusColor: string;
  source: string;
  uploadId?: number;
}

interface ProcessingStats {
  totalUploads: number;
  processingFiles: number;
  completedFiles: number;
  errorFiles: number;
  avgProcessingTimeMs: number;
}

// Prismaスキーマの正しいステータス値に対応
const mapStatus = (status: string): string => {
  switch (status) {
    case 'parsed':
      return '解析済み';
    case 'errored':
      return 'エラー';
    case 'COMPLETED':
      return '完了';
    case 'PROCESSING':
      return '処理中';
    case 'ERROR':
      return 'エラー';
    case 'PENDING':
      return '待機中';
    default:
      return status;
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'parsed':
    case 'COMPLETED':
      return 'green';
    case 'PROCESSING':
    case 'PENDING':
      return 'yellow';
    case 'errored':
    case 'ERROR':
      return 'red';
    default:
      return 'gray';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'parsed':
    case 'COMPLETED':
      return <CheckCircle className="w-4 h-4" />;
    case 'PROCESSING':
      return <Loader2 className="w-4 h-4 animate-spin" />;
    case 'PENDING':
      return <Clock className="w-4 h-4" />;
    case 'errored':
    case 'ERROR':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

export default function DataManagementPage() {
  const [recentUploads, setRecentUploads] = useState<UploadRecord[]>([]);
  const [processingStats, setProcessingStats] = useState<ProcessingStats>({
    totalUploads: 0,
    processingFiles: 0,
    completedFiles: 0,
    errorFiles: 0,
    avgProcessingTimeMs: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // データ取得
  const fetchData = async () => {
    setError(null);
    try {
      // アップロード履歴を取得（uploadテーブルから）
      const uploadsResponse = await fetch('/api/dashboard/file-history');
      
      if (uploadsResponse.ok) {
        const uploadsData = await uploadsResponse.json();
        
        // データの正規化
        const normalizedUploads = (uploadsData.files || []).map((file: any) => ({
          id: file.id || file.uploadId,
          filename: file.filename,
          uploadedBy: 'システムユーザー',
          uploadedAt: file.uploadedAt,
          status: file.processingStatus || 'parsed', // ProcessingStatusを使用
          statusColor: getStatusColor(file.processingStatus || 'parsed'),
          source: 'CSV Import',
          uploadId: file.uploadId
        }));

        setRecentUploads(normalizedUploads);

        // 統計情報の計算
        const stats = normalizedUploads.reduce((acc: ProcessingStats, upload) => {
          acc.totalUploads++;
          switch (upload.status) {
            case 'COMPLETED':
              acc.completedFiles++;
              break;
            case 'PROCESSING':
              acc.processingFiles++;
              break;
            case 'ERROR':
            case 'errored':
              acc.errorFiles++;
              break;
          }
          return acc;
        }, {
          totalUploads: 0,
          processingFiles: 0,
          completedFiles: 0,
          errorFiles: 0,
          avgProcessingTimeMs: 5000 // 仮の値
        });

        setProcessingStats(stats);
      } else {
        throw new Error('アップロード履歴の取得に失敗しました');
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
      setError(error instanceof Error ? error.message : 'データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // ファイル詳細表示
  const handleViewFile = (upload: UploadRecord) => {
    if (upload.id) {
      router.push(`/file-details/${upload.id}`);
    }
  };

  // アップロード画面への遷移
  const handleUploadRedirect = () => {
    router.push('/upload');
  };

  // データ取得時のエラーハンドリング
  useEffect(() => {
    fetchData();
    
    // 定期的なデータ更新（本番環境では30秒間隔）
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // ローディング状態
  if (isLoading && recentUploads.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
            <p className="text-gray-600">データを読み込み中...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // エラー状態
  if (error && recentUploads.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">データ取得エラー</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchData} className="bg-emerald-600 hover:bg-emerald-700">
              再試行
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">データ管理</h1>
            <p className="text-gray-600 mt-2">
              ESGデータの取り込み、管理、分析を行います
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={fetchData} 
              variant="outline" 
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Activity className="w-4 h-4 mr-2" />
              )}
              更新
            </Button>
          </div>
        </div>

        {/* エラー表示（部分エラー） */}
        {error && recentUploads.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800">
                データ更新中にエラーが発生しました: {error}
              </p>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総ファイル数</p>
                  <p className="text-2xl font-bold text-gray-900">{processingStats.totalUploads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">処理中</p>
                  <p className="text-2xl font-bold text-gray-900">{processingStats.processingFiles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">完了済み</p>
                  <p className="text-2xl font-bold text-gray-900">{processingStats.completedFiles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">エラー</p>
                  <p className="text-2xl font-bold text-gray-900">{processingStats.errorFiles}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Import Section */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-emerald-600" />
              データインポート
            </CardTitle>
            <CardDescription>
              新しいESGデータファイルをアップロードするか、外部システムに接続します
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={handleUploadRedirect}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
              >
                <Upload className="w-4 h-4 mr-2" />
                CSV アップロード
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                <FileText className="w-4 h-4 mr-2" />
                システム接続
              </Button>
              <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                <Download className="w-4 h-4 mr-2" />
                一括インポート
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Uploads Section */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              最近のアップロード
            </CardTitle>
            <CardDescription>
              最新のファイルアップロード履歴と処理状況
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {recentUploads.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">ファイル名</TableHead>
                    <TableHead className="w-[20%]">アップロード日時</TableHead>
                    <TableHead className="w-[15%]">ステータス</TableHead>
                    <TableHead className="w-[25%]">アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUploads.map((upload) => (
                    <TableRow key={upload.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div>
                          <p className="text-gray-900">{upload.filename}</p>
                          <p className="text-sm text-gray-500">{upload.source}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(upload.uploadedAt).toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`flex items-center space-x-1 ${
                            upload.statusColor === "green" 
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                              : upload.statusColor === "yellow"
                              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : upload.statusColor === "red"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {getStatusIcon(upload.status)}
                          <span>{mapStatus(upload.status)}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                            onClick={() => handleViewFile(upload)}
                            title="詳細を表示"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-100"
                            title="ダウンロード"
                            disabled={upload.status !== 'COMPLETED' && upload.status !== 'parsed'}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">アップロードされたファイルがありません</p>
                <Button 
                  onClick={handleUploadRedirect}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                >
                  最初のファイルをアップロード
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 