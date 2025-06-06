"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { 
  MapPin,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Bot,
  User,
  ArrowRight
} from "lucide-react"

export default function MappingPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Mock mapping data
  const mappings = [
    {
      id: 1,
      dataSource: "エネルギー使用量_2024Q1.csv",
      status: "completed",
      mappingType: "ai",
      confidence: 95,
      sourceColumns: ["年月", "電力使用量_kWh", "ガス使用量_m3"],
      targetKPIs: ["電力消費量", "天然ガス消費量"],
      mappedBy: "AI Auto-Mapper",
      createdAt: "2024年1月15日 14:30",
      approvedBy: "田中 太郎",
      approvedAt: "2024年1月15日 15:45"
    },
    {
      id: 2,
      dataSource: "廃棄物データ_202401.xlsx",
      status: "pending_review",
      mappingType: "ai",
      confidence: 78,
      sourceColumns: ["日付", "一般廃棄物_kg", "産業廃棄物_kg", "リサイクル量_kg"],
      targetKPIs: ["一般廃棄物量", "産業廃棄物量", "リサイクル率"],
      mappedBy: "AI Auto-Mapper",
      createdAt: "2024年1月15日 12:15",
      approvedBy: null,
      approvedAt: null
    },
    {
      id: 3,
      dataSource: "人事データ_ダイバーシティ.json",
      status: "manual_required",
      mappingType: "manual",
      confidence: 0,
      sourceColumns: ["従業員ID", "性別", "年齢層", "役職", "部署"],
      targetKPIs: ["女性管理職比率", "年齢多様性指標"],
      mappedBy: "佐藤 花子",
      createdAt: "2024年1月14日 10:20",
      approvedBy: null,
      approvedAt: null
    },
    {
      id: 4,
      dataSource: "温室効果ガス排出量.csv",
      status: "error",
      mappingType: "ai",
      confidence: 45,
      sourceColumns: ["Scope1", "Scope2", "Scope3_Category1"],
      targetKPIs: ["Scope1排出量", "Scope2排出量", "Scope3排出量"],
      mappedBy: "AI Auto-Mapper",
      createdAt: "2024年1月14日 16:45",
      approvedBy: null,
      approvedAt: null
    }
  ]

  const filteredMappings = mappings.filter(mapping =>
    mapping.dataSource.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />完了</Badge>
      case "pending_review":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />レビュー待ち</Badge>
      case "manual_required":
        return <Badge className="bg-blue-100 text-blue-800"><User className="w-3 h-3 mr-1" />手動作業必要</Badge>
      case "error":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />エラー</Badge>
      default:
        return <Badge variant="outline">不明</Badge>
    }
  }

  const getMappingTypeIcon = (type: string) => {
    return type === "ai" ? <Bot className="w-4 h-4 text-blue-500" /> : <User className="w-4 h-4 text-gray-500" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">データマッピング</h1>
          <p className="text-gray-600 mt-1">AIによる自動マッピングと手動マッピング管理</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-blue-200 text-blue-700">
            <Bot className="h-4 w-4 mr-2" />
            AI一括マッピング
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <MapPin className="h-4 w-4 mr-2" />
            手動マッピング
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総マッピング数</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
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
                <p className="text-2xl font-bold text-gray-900">18</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI自動マッピング</p>
                <p className="text-2xl font-bold text-gray-900">87%</p>
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
                <p className="text-sm font-medium text-gray-600">承認待ち</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Mapping Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span>AI マッピング エンジン</span>
          </CardTitle>
          <CardDescription>
            機械学習による自動データマッピングの状況
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">学習進捗</span>
                <span className="text-sm text-gray-600">92%</span>
              </div>
              <Progress value={92} className="h-2" />
              <p className="text-xs text-gray-500">1,254 データセットで学習済み</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">マッピング精度</span>
                <span className="text-sm text-gray-600">87.3%</span>
              </div>
              <Progress value={87.3} className="h-2" />
              <p className="text-xs text-gray-500">過去30日間の平均精度</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">処理速度</span>
                <span className="text-sm text-gray-600">2.4s</span>
              </div>
              <div className="h-2 bg-green-100 rounded-full">
                <div className="h-full bg-green-500 rounded-full w-4/5"></div>
              </div>
              <p className="text-xs text-gray-500">1,000行あたりの処理時間</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <Input
            placeholder="データソースを検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Mappings List */}
      <div className="space-y-4">
        {filteredMappings.map((mapping) => (
          <Card key={mapping.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="flex flex-col items-center space-y-2">
                    {getMappingTypeIcon(mapping.mappingType)}
                    <span className="text-xs text-gray-500">
                      {mapping.mappingType === "ai" ? "AI" : "手動"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {mapping.dataSource}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">ソース列</h4>
                        <div className="space-y-1">
                          {mapping.sourceColumns.map((column, index) => (
                            <Badge key={index} variant="outline" className="mr-1 mb-1">
                              {column}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">ターゲットKPI</h4>
                        <div className="space-y-1">
                          {mapping.targetKPIs.map((kpi, index) => (
                            <Badge key={index} className="mr-1 mb-1 bg-blue-100 text-blue-800">
                              {kpi}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    {mapping.mappingType === "ai" && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">AI信頼度</span>
                          <span className="font-medium">{mapping.confidence}%</span>
                        </div>
                        <Progress value={mapping.confidence} className="h-2" />
                      </div>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>作成: {mapping.createdAt}</span>
                      <span>作成者: {mapping.mappedBy}</span>
                      {mapping.approvedBy && (
                        <>
                          <span>承認者: {mapping.approvedBy}</span>
                          <span>承認日: {mapping.approvedAt}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(mapping.status)}
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    詳細
                  </Button>
                  {mapping.status === "pending_review" && (
                    <Button variant="outline" size="sm" className="text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      承認
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    編集
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {mapping.status === "error" && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    エラー: AI信頼度が低いため手動マッピングが必要です。データ形式を確認してください。
                  </p>
                </div>
              )}
              {mapping.status === "manual_required" && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    手動マッピングが必要です。データ構造が複雑なため、専門知識を持つユーザーによる設定をお願いします。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMappings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">マッピングデータが見つかりません</h3>
            <p className="text-gray-600">検索条件を変更するか、新しいマッピングを作成してください。</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 