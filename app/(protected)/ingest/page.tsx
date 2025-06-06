"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  File, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  Download,
  Eye,
  Trash2
} from "lucide-react"

export default function IngestPage() {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload
      console.log("Files:", e.dataTransfer.files)
    }
  }

  // Mock data for upload history
  const uploadHistory = [
    {
      id: 1,
      fileName: "エネルギー使用量_2024Q1.csv",
      uploadDate: "2024年1月15日 14:30",
      status: "completed",
      size: "2.4 MB",
      records: "1,234",
      processing: 100
    },
    {
      id: 2,
      fileName: "廃棄物データ_202401.xlsx",
      uploadDate: "2024年1月15日 12:15",
      status: "processing",
      size: "1.8 MB",
      records: "856",
      processing: 65
    },
    {
      id: 3,
      fileName: "温室効果ガス排出量.csv",
      uploadDate: "2024年1月14日 16:45",
      status: "error",
      size: "3.1 MB",
      records: "0",
      processing: 0
    },
    {
      id: 4,
      fileName: "人事データ_ダイバーシティ.json",
      uploadDate: "2024年1月14日 10:20",
      status: "completed",
      size: "0.9 MB",
      records: "2,456",
      processing: 100
    }
  ]

  // Mock scheduled imports
  const scheduledImports = [
    {
      id: 1,
      name: "月次エネルギーデータ",
      source: "エネルギー管理システム",
      frequency: "毎月1日",
      nextRun: "2024年2月1日 9:00",
      status: "active"
    },
    {
      id: 2,
      name: "週次廃棄物データ",
      source: "廃棄物管理API",
      frequency: "毎週月曜日",
      nextRun: "2024年1月22日 6:00",
      status: "active"
    },
    {
      id: 3,
      name: "四半期人事データ",
      source: "人事システム",
      frequency: "四半期末",
      nextRun: "2024年3月31日 23:59",
      status: "paused"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />完了</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />処理中</Badge>
      case "error":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />エラー</Badge>
      default:
        return <Badge variant="outline">不明</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">データ取込</h1>
        <p className="text-gray-600 mt-1">ファイルアップロードとスケジュール取込の管理</p>
      </div>

      {/* Upload Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今月の取込</p>
                <p className="text-2xl font-bold text-gray-900">28</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">成功</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">処理中</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">エラー</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-blue-500" />
              <span>ファイルアップロード</span>
            </CardTitle>
            <CardDescription>
              CSV、Excel、JSONファイルをドラッグ&ドロップでアップロード
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ファイルをドロップするか、クリックして選択
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                対応形式: CSV, Excel, JSON (最大 100MB)
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                ファイルを選択
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>サポートされる形式:</span>
              </div>
              <div className="flex space-x-2">
                <Badge variant="outline">CSV</Badge>
                <Badge variant="outline">Excel</Badge>
                <Badge variant="outline">JSON</Badge>
                <Badge variant="outline">XML</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Imports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <span>スケジュール取込</span>
            </CardTitle>
            <CardDescription>
              自動データ取込スケジュールの管理
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheduledImports.map((schedule) => (
              <div key={schedule.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{schedule.name}</h4>
                  <Badge variant={schedule.status === "active" ? "default" : "secondary"}>
                    {schedule.status === "active" ? "アクティブ" : "一時停止"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">ソース: {schedule.source}</p>
                <p className="text-sm text-gray-600 mb-1">頻度: {schedule.frequency}</p>
                <p className="text-sm text-gray-600">次回実行: {schedule.nextRun}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              新しいスケジュールを作成
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upload History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <File className="h-5 w-5 text-purple-500" />
            <span>アップロード履歴</span>
          </CardTitle>
          <CardDescription>
            最近のファイルアップロードとその処理状況
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {uploadHistory.map((upload) => (
              <div key={upload.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <File className="h-8 w-8 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">{upload.fileName}</h4>
                      <p className="text-sm text-gray-600">
                        {upload.uploadDate} • {upload.size} • {upload.records} レコード
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(upload.status)}
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      詳細
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      再取込
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {upload.status === "processing" && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>処理進捗</span>
                      <span>{upload.processing}%</span>
                    </div>
                    <Progress value={upload.processing} className="h-2" />
                  </div>
                )}
                {upload.status === "error" && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      エラー: ファイル形式が正しくありません。列ヘッダーを確認してください。
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 