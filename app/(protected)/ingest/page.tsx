"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
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
  Trash2,
  X
} from "lucide-react"
import { useUploadKpi } from "@/app/hooks/useUploadKpi"

interface FileHistoryItem {
  id: number;
  uploadId: number;
  filename: string;
  uploadedAt: string;
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  detectedKpis: number;
  processedRecords: number;
  processingTimeMs?: number;
}

interface UploadStats {
  totalFiles: number;
  completedFiles: number;
  errorFiles: number;
  processingFiles: number;
}

export default function IngestPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadHistory, setUploadHistory] = useState<FileHistoryItem[]>([])
  const [uploadStats, setUploadStats] = useState<UploadStats>({
    totalFiles: 0,
    completedFiles: 0,
    errorFiles: 0,
    processingFiles: 0
  })
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { mutate: uploadFile, progress, isPending, isSuccess, error } = useUploadKpi()

  // ファイル形式とサイズの制限
  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  const ALLOWED_TYPES = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json']
  const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls', '.json']

  // アップロード履歴を取得
  const fetchUploadHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/dashboard/file-history?limit=20')
      if (response.ok) {
        const data = await response.json()
        setUploadHistory(data.files || [])
        
        // 統計を計算
        const files = data.files || []
        const stats = {
          totalFiles: files.length,
          completedFiles: files.filter((f: FileHistoryItem) => f.processingStatus === 'COMPLETED').length,
          errorFiles: files.filter((f: FileHistoryItem) => f.processingStatus === 'ERROR').length,
          processingFiles: files.filter((f: FileHistoryItem) => f.processingStatus === 'PROCESSING' || f.processingStatus === 'PENDING').length
        }
        setUploadStats(stats)
      }
    } catch (error) {
      console.error('履歴取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUploadHistory()
  }, [fetchUploadHistory])

  // アップロード成功時に履歴を更新
  useEffect(() => {
    if (isSuccess) {
      setSelectedFiles([])
      setUploadError(null)
      // 少し遅延してから履歴を更新（サーバー側の処理完了を待つ）
      setTimeout(() => {
        fetchUploadHistory()
      }, 1000)
    }
  }, [isSuccess, fetchUploadHistory])

  // ファイル検証
  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `ファイルサイズは${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB以下にしてください`
    }

    if (file.size === 0) {
      return '空のファイルはアップロードできません'
    }

    const hasValidType = ALLOWED_TYPES.includes(file.type)
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    )

    if (!hasValidType && !hasValidExtension) {
      return 'CSV、Excel（.xlsx、.xls）、JSONファイルのみアップロード可能です'
    }

    return null
  }

  // ファイル処理
  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const validFiles: File[] = []
    let errorMessage = ''

    for (const file of fileArray) {
      const validationError = validateFile(file)
      if (validationError) {
        errorMessage = validationError
        break
      }

      // 重複チェック
      if (selectedFiles.some(f => f.name === file.name)) {
        errorMessage = 'ファイル名が重複しています'
        break
      }

      validFiles.push(file)
    }

    if (errorMessage) {
      setUploadError(errorMessage)
      return
    }

    setSelectedFiles(prev => [...prev, ...validFiles])
    setUploadError(null)
  }

  // ドラッグ&ドロップハンドラー
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isPending) return

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [isPending])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (isPending) return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }, [isPending, selectedFiles])

  // ファイル選択ボタンクリック
  const handleFileSelectClick = () => {
    if (isPending) return
    fileInputRef.current?.click()
  }

  // ファイル選択
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
    // リセットして同じファイルを再選択可能にする
    e.target.value = ''
  }

  // ファイル削除
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setUploadError(null)
  }

  // アップロード実行
  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      setUploadError('アップロードするファイルを選択してください')
      return
    }

    if (selectedFiles.length > 1) {
      setUploadError('一度に1つのファイルのみアップロード可能です')
      return
    }

    const fileToUpload = selectedFiles[0]
    if (fileToUpload) {
      uploadFile(fileToUpload)
    }
  }

  // ステータスバッジ
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />完了</Badge>
      case "PROCESSING":
      case "PENDING":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />処理中</Badge>
      case "ERROR":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />エラー</Badge>
      default:
        return <Badge variant="outline">不明</Badge>
    }
  }

  // ファイル詳細表示
  const viewFileDetails = (fileId: number) => {
    router.push(`/dashboard/file-details/${fileId}`)
  }

  // 日時フォーマット
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Mock scheduled imports (この部分は将来的に実装)
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
                <p className="text-sm font-medium text-gray-600">総ファイル数</p>
                <p className="text-2xl font-bold text-gray-900">{uploadStats.totalFiles}</p>
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
                <p className="text-2xl font-bold text-gray-900">{uploadStats.completedFiles}</p>
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
                <p className="text-2xl font-bold text-gray-900">{uploadStats.processingFiles}</p>
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
                <p className="text-2xl font-bold text-gray-900">{uploadStats.errorFiles}</p>
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
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-blue-500 bg-blue-50" : 
                isPending ? "border-gray-200 bg-gray-50" : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className={`h-12 w-12 mx-auto mb-4 ${isPending ? 'text-gray-300' : 'text-gray-400'}`} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isPending ? 'アップロード中...' : 'ファイルをドロップするか、クリックして選択'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                対応形式: CSV, Excel, JSON (最大 50MB)
              </p>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleFileSelectClick}
                disabled={isPending}
              >
                ファイルを選択
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls,.json"
                onChange={handleFileSelect}
                disabled={isPending}
              />
            </div>

            {/* 選択されたファイル一覧 */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">選択されたファイル:</h4>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <File className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* アップロード進捗 */}
            {isPending && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>アップロード進捗</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* エラー表示 */}
            {(uploadError || error) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  {uploadError || (error as any)?.error || (error as any)?.message || 'アップロードエラーが発生しました'}
                </p>
              </div>
            )}

            {/* アップロードボタン */}
            <Button 
              className="w-full"
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isPending}
            >
              {isPending ? 'アップロード中...' : 'アップロード開始'}
            </Button>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>サポートされる形式:</span>
              </div>
              <div className="flex space-x-2">
                <Badge variant="outline">CSV</Badge>
                <Badge variant="outline">Excel</Badge>
                <Badge variant="outline">JSON</Badge>
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
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">履歴を読み込み中...</p>
            </div>
          ) : uploadHistory.length === 0 ? (
            <div className="text-center py-8">
              <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">アップロード履歴がありません</p>
              <p className="text-sm text-gray-500 mt-1">
                ファイルをアップロードすると、ここに履歴が表示されます
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {uploadHistory.slice(0, 10).map((upload) => (
                <div key={upload.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <File className="h-8 w-8 text-gray-400" />
                      <div>
                        <h4 className="font-medium text-white">{upload.filename}</h4>
                        <p className="text-sm text-gray-600">
                          {formatDateTime(upload.uploadedAt)} • {upload.detectedKpis} KPI • {upload.processedRecords} レコード
                          {upload.processingTimeMs && ` • ${upload.processingTimeMs}ms`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(upload.processingStatus)}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewFileDetails(upload.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        詳細
                      </Button>
                    </div>
                  </div>
                  {upload.processingStatus === "PROCESSING" && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>処理進捗</span>
                        <span>処理中...</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                  )}
                </div>
              ))}
              {uploadHistory.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={() => router.push('/dashboard')}>
                    すべての履歴を表示 ({uploadHistory.length - 10}件)
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 