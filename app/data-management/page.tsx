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
  status: 'COMPLETED' | 'PROCESSING' | 'ERROR' | 'PENDING';
  statusColor: string;
  source: string;
  uploadId?: number;
}

interface DataStats {
  totalFiles: number;
  totalDataSources: number;
  processingFiles: number;
  monthlyGrowth: number;
}

interface ApiError {
  error: string;
  details?: string;
}

export default function DataManagementPage() {
  const router = useRouter();
  const [recentUploads, setRecentUploads] = useState<UploadRecord[]>([]);
  const [dataStats, setDataStats] = useState<DataStats>({
    totalFiles: 0,
    totalDataSources: 0,
    processingFiles: 0,
    monthlyGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データ統計とアップロード履歴を取得
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 並列でデータを取得してパフォーマンスを向上
      const [fileHistoryResponse, statsResponse] = await Promise.all([
        fetch('/api/dashboard/file-history', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        fetch('/api/catalog/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      ]);

      // ファイル履歴の処理
      if (fileHistoryResponse.ok) {
        const fileHistoryData = await fileHistoryResponse.json();
        
        // APIレスポンスを内部形式に変換
        const uploads: UploadRecord[] = fileHistoryData.files?.map((file: any) => ({
          id: file.id,
          filename: file.filename,
          uploadedBy: file.uploadedBy || 'システム',
          uploadedAt: new Date(file.uploadedAt).toLocaleString('ja-JP'),
          status: file.processingStatus || 'PENDING',
          statusColor: getStatusColor(file.processingStatus),
          source: getSourceType(file.filename),
          uploadId: file.uploadId
        })) || [];

        setRecentUploads(uploads);
      } else {
        console.warn('ファイル履歴の取得に失敗しました');
      }

      // 統計データの処理
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setDataStats({
          totalFiles: statsData.totalDataSources || 0,
          totalDataSources: statsData.totalKpis || 0,
          processingFiles: recentUploads.filter(u => u.status === 'PROCESSING').length,
          monthlyGrowth: statsData.recentGrowth || 0
        });
      } else {
        console.warn('統計データの取得に失敗しました');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(errorMessage);
      console.error('データ取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ステータスに応じた色を決定
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'COMPLETED': return 'green';
      case 'PROCESSING': return 'yellow';
      case 'ERROR': return 'red';
      default: return 'gray';
    }
  };

  // ファイル名からソースタイプを推定
  const getSourceType = (filename: string): string => {
    if (filename.toLowerCase().includes('csv')) return 'CSV アップロード';
    if (filename.toLowerCase().includes('excel') || filename.toLowerCase().includes('xlsx')) return 'Excel アップロード';
    if (filename.toLowerCase().includes('erp')) return 'ERPシステム';
    if (filename.toLowerCase().includes('bi')) return 'BIツール';
    return 'CSV アップロード';
  };

  // ステータスアイコンを取得
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'PROCESSING': return <Clock className="w-4 h-4" />;
      case 'ERROR': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">データ管理</h1>
                <p className="text-gray-600">
                  ESGデータのインポート、検証プロセス、データ品質監視を管理します。
                </p>
              </div>
            </div>
            <Button 
              onClick={fetchData}
              variant="outline" 
              size="sm"
              disabled={isLoading}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              更新
            </Button>
          </div>
          
          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 font-medium">エラーが発生しました</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-800 text-lg">総ファイル数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">{dataStats.totalFiles}</div>
              <p className="text-xs text-emerald-600 mt-1">今月 +{dataStats.monthlyGrowth}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-800 text-lg">データソース</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{dataStats.totalDataSources}</div>
              <p className="text-xs text-blue-600 mt-1">接続済みシステム</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-800 text-lg">処理中</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{dataStats.processingFiles}</div>
              <p className="text-xs text-purple-600 mt-1">待機中のファイル</p>
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
            <CardTitle className="text-xl text-gray-800">最近のアップロード</CardTitle>
            <CardDescription>
              最新のデータアップロードとその処理ステータスを監視します
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentUploads.length > 0 ? (
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-semibold text-gray-700">ファイル名</TableHead>
                    <TableHead className="font-semibold text-gray-700">ソース</TableHead>
                    <TableHead className="font-semibold text-gray-700">アップロード者</TableHead>
                    <TableHead className="font-semibold text-gray-700">日時</TableHead>
                    <TableHead className="font-semibold text-gray-700">ステータス</TableHead>
                    <TableHead className="font-semibold text-gray-700">アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUploads.map((upload) => (
                    <TableRow key={upload.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="truncate max-w-xs" title={upload.filename}>
                            {upload.filename}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <Badge variant="outline" className="text-xs">
                          {upload.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {upload.uploadedBy}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {upload.uploadedAt}
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
                          <span>{upload.status}</span>
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
                            disabled={upload.status !== 'COMPLETED'}
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