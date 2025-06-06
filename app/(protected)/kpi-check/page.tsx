"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  Calendar,
  TrendingDown,
  TrendingUp
} from "lucide-react"

export default function KPICheckPage() {
  // Mock KPI check data
  const kpiChecks = [
    {
      id: 1,
      kpi: "Scope 2 排出量",
      category: "環境",
      status: "missing",
      deadline: "2024年2月末",
      daysOverdue: 15,
      department: "環境部",
      lastUpdated: "2023年12月末",
      severity: "high",
      comments: 2
    },
    {
      id: 2,
      kpi: "女性管理職比率",
      category: "社会",
      status: "missing", 
      deadline: "2024年1月末",
      daysOverdue: 3,
      department: "人事部",
      lastUpdated: "2023年11月末",
      severity: "medium",
      comments: 1
    },
    {
      id: 3,
      kpi: "水使用量",
      category: "環境",
      status: "outdated",
      deadline: "2024年1月末",
      daysOverdue: 0,
      department: "施設管理部",
      lastUpdated: "2023年9月末",
      severity: "low",
      comments: 0
    },
    {
      id: 4,
      kpi: "取締役会における女性比率",
      category: "ガバナンス",
      status: "complete",
      deadline: "2024年1月末",
      daysOverdue: 0,
      department: "経営企画部",
      lastUpdated: "2024年1月15日",
      severity: "none",
      comments: 0
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "missing":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />欠損</Badge>
      case "outdated":
        return <Badge className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />期限切れ</Badge>
      case "complete":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />完了</Badge>
      default:
        return <Badge variant="outline">不明</Badge>
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-orange-600"
      case "low":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const missingCount = kpiChecks.filter(k => k.status === "missing").length
  const outdatedCount = kpiChecks.filter(k => k.status === "outdated").length
  const completeCount = kpiChecks.filter(k => k.status === "complete").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KPIチェック</h1>
          <p className="text-gray-600 mt-1">必須KPIの欠損チェックとアラート管理</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Calendar className="h-4 w-4 mr-2" />
          手動チェック実行
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">欠損KPI</p>
                <p className="text-2xl font-bold text-gray-900">{missingCount}</p>
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
                <p className="text-sm font-medium text-gray-600">期限切れ</p>
                <p className="text-2xl font-bold text-gray-900">{outdatedCount}</p>
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
                <p className="text-sm font-medium text-gray-600">完了</p>
                <p className="text-2xl font-bold text-gray-900">{completeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">完了率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((completeCount / kpiChecks.length) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Status List */}
      <Card>
        <CardHeader>
          <CardTitle>KPI状況一覧</CardTitle>
          <CardDescription>
            必須KPIの最新状況と対応要件
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {kpiChecks.map((kpi) => (
              <div key={kpi.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{kpi.kpi}</h3>
                    {getStatusBadge(kpi.status)}
                    <Badge variant="outline">{kpi.category}</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {kpi.comments > 0 && (
                      <Badge variant="outline" className="text-blue-600">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {kpi.comments}
                      </Badge>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      詳細
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">担当部署:</span>
                    <p className="font-medium">{kpi.department}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">期限:</span>
                    <p className="font-medium">{kpi.deadline}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">最終更新:</span>
                    <p className="font-medium">{kpi.lastUpdated}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">遅延:</span>
                    <p className={`font-medium ${getSeverityColor(kpi.severity)}`}>
                      {kpi.daysOverdue > 0 ? `${kpi.daysOverdue}日` : "なし"}
                    </p>
                  </div>
                </div>

                {kpi.status === "missing" && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      このKPIのデータが欠損しています。至急データ収集が必要です。
                    </p>
                  </div>
                )}

                {kpi.status === "outdated" && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <Clock className="w-4 h-4 inline mr-1" />
                      データが古くなっています。最新データの更新をお願いします。
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle>アラート設定</CardTitle>
          <CardDescription>
            KPIチェックの自動化とアラート通知の設定
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">チェック頻度</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>日次自動チェック</span>
                  <Badge className="bg-green-100 text-green-800">有効</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>週次レポート</span>
                  <Badge className="bg-green-100 text-green-800">有効</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>月次詳細レポート</span>
                  <Badge className="bg-green-100 text-green-800">有効</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">通知設定</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>メール通知</span>
                  <Badge className="bg-green-100 text-green-800">有効</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Slack通知</span>
                  <Badge className="bg-green-100 text-green-800">有効</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Teams通知</span>
                  <Badge variant="secondary">無効</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button variant="outline" className="mr-3">
              設定を編集
            </Button>
            <Button variant="outline">
              通知テスト
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 