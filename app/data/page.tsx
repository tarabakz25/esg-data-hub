"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Database, 
  Upload, 
  History, 
  Search,
  Plus,
  FileText,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

// モックデータ
const mockDataSources = [
  {
    id: "ds001",
    name: "本社_環境データ_2024Q3.xlsx",
    type: "Excel",
    size: "2.4 MB",
    uploadDate: "2024-12-15",
    updatedBy: "田中 太郎",
    status: "処理完了",
    kpiCount: 45,
    quality: 92
  },
  {
    id: "ds002", 
    name: "子会社A_社会データ.csv",
    type: "CSV",
    size: "1.8 MB",
    uploadDate: "2024-12-14",
    updatedBy: "佐藤 花子",
    status: "マッピング中",
    kpiCount: 23,
    quality: 88
  },
  {
    id: "ds003",
    name: "ガバナンス指標_統合.json",
    type: "JSON", 
    size: "0.6 MB",
    uploadDate: "2024-12-13",
    updatedBy: "山田 次郎",
    status: "エラー",
    kpiCount: 12,
    quality: 65
  }
];

const mockRecentActivity = [
  {
    id: "act001",
    action: "ファイルアップロード",
    filename: "環境データ_Q4.xlsx",
    user: "田中 太郎",
    timestamp: "2024-12-15 14:30",
    status: "成功"
  },
  {
    id: "act002", 
    action: "自動マッピング",
    filename: "社会データ.csv",
    user: "システム",
    timestamp: "2024-12-15 14:15",
    status: "完了"
  },
  {
    id: "act003",
    action: "データ再処理",
    filename: "ガバナンス指標.json",
    user: "佐藤 花子",
    timestamp: "2024-12-15 13:45",
    status: "実行中"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "処理完了": return "bg-green-100 text-green-800 border-green-200";
    case "マッピング中": return "bg-blue-100 text-blue-800 border-blue-200";
    case "エラー": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "処理完了": return <CheckCircle className="h-4 w-4" />;
    case "マッピング中": return <Clock className="h-4 w-4" />;
    case "エラー": return <AlertCircle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

export default function DataManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const filteredSources = mockDataSources.filter(source =>
    source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.updatedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // ファイルアップロード処理をここに実装
    console.log("Files dropped:", e.dataTransfer.files);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Database className="h-8 w-8 text-blue-600" />
              <span>データ管理</span>
            </h1>
            <p className="text-gray-600 mt-2">データソースの登録、ファイルアップロード、処理履歴の管理</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
            <Plus className="h-4 w-4 mr-2" />
            新しいソース追加
          </Button>
        </div>

        {/* 概要カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                  <p className="text-sm text-gray-600">データソース</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                  <p className="text-sm text-gray-600">処理完了</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                  <p className="text-sm text-gray-600">処理中</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                  <p className="text-sm text-gray-600">エラー</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* メインコンテンツ */}
        <Tabs defaultValue="sources" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sources" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>ソース管理</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>アップロード</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>処理履歴</span>
            </TabsTrigger>
          </TabsList>

          {/* ソース管理タブ */}
          <TabsContent value="sources" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>データソース一覧</CardTitle>
                    <CardDescription>登録済みのデータソースと処理状況</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="ソース名で検索..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{source.name}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{source.uploadDate}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{source.updatedBy}</span>
                            </span>
                            <span>{source.size}</span>
                            <span>{source.kpiCount} KPIs</span>
                            <span>品質: {source.quality}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={cn("flex items-center space-x-1", getStatusColor(source.status))}>
                          {getStatusIcon(source.status)}
                          <span>{source.status}</span>
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* アップロードタブ */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ファイルアップロード</CardTitle>
                <CardDescription>ESGデータファイルをアップロードして自動処理を開始</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                    isDragging 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-300 hover:border-gray-400"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ファイルをドラッグ＆ドロップ
                  </h3>
                  <p className="text-gray-600 mb-4">
                    または <Button variant="link" className="p-0">クリックしてファイルを選択</Button>
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>対応形式: CSV, Excel (.xlsx, .xls), JSON</p>
                    <p>最大ファイルサイズ: 100MB</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="description">説明（オプション）</Label>
                    <Input
                      id="description"
                      placeholder="このデータソースの説明を入力..."
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">部門</Label>
                    <Input
                      id="department"
                      placeholder="例: 環境推進部"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button variant="outline">キャンセル</Button>
                  <Button className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                    アップロード開始
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 処理履歴タブ */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>最近のアクティビティ</CardTitle>
                <CardDescription>データ処理の履歴とステータス</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <History className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{activity.action}</h4>
                        <p className="text-sm text-gray-600">{activity.filename}</p>
                        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                          <span>{activity.user}</span>
                          <span>•</span>
                          <span>{activity.timestamp}</span>
                        </div>
                      </div>
                      <Badge className={cn(
                        activity.status === "成功" ? "bg-green-100 text-green-800" :
                        activity.status === "実行中" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      )}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 