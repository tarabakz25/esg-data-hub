"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  BarChart3,
  Database
} from "lucide-react"

export default function RecordsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  
  // Mock data records
  const records = [
    {
      id: 1,
      name: "エネルギー使用量データ",
      category: "環境",
      subcategory: "エネルギー",
      recordCount: 1234,
      dateRange: "2023年1月〜2024年1月",
      lastUpdated: "2024年1月15日",
      dataSource: "エネルギー管理システム",
      status: "active",
      kpis: ["電力消費量", "天然ガス消費量", "エネルギー効率"]
    },
    {
      id: 2,
      name: "廃棄物データ",
      category: "環境",
      subcategory: "廃棄物",
      recordCount: 856,
      dateRange: "2023年1月〜2024年1月",
      lastUpdated: "2024年1月14日",
      dataSource: "廃棄物管理API",
      status: "active",
      kpis: ["一般廃棄物量", "産業廃棄物量", "リサイクル率"]
    },
    {
      id: 3,
      name: "従業員ダイバーシティデータ",
      category: "社会",
      subcategory: "人事",
      recordCount: 2456,
      dateRange: "2023年4月〜2024年1月",
      lastUpdated: "2024年1月10日",
      dataSource: "人事システム",
      status: "active",
      kpis: ["女性管理職比率", "年齢多様性指標", "障害者雇用率"]
    },
    {
      id: 4,
      name: "温室効果ガス排出量",
      category: "環境",
      subcategory: "GHG排出",
      recordCount: 567,
      dateRange: "2023年1月〜2023年12月",
      lastUpdated: "2024年1月12日",
      dataSource: "排出量計算システム",
      status: "incomplete",
      kpis: ["Scope1排出量", "Scope2排出量", "Scope3排出量"]
    },
    {
      id: 5,
      name: "取締役会データ",
      category: "ガバナンス",
      subcategory: "経営",
      recordCount: 48,
      dateRange: "2023年1月〜2024年1月",
      lastUpdated: "2024年1月15日",
      dataSource: "経営企画システム",
      status: "active",
      kpis: ["取締役会女性比率", "独立取締役比率", "会議開催回数"]
    }
  ]

  const filteredRecords = records.filter(record =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">アクティブ</Badge>
      case "incomplete":
        return <Badge className="bg-orange-100 text-orange-800">不完全</Badge>
      case "archived":
        return <Badge variant="secondary">アーカイブ済み</Badge>
      default:
        return <Badge variant="outline">不明</Badge>
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "環境":
        return "bg-green-100 text-green-800"
      case "社会":
        return "bg-blue-100 text-blue-800"
      case "ガバナンス":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalRecords = records.reduce((sum, record) => sum + record.recordCount, 0)
  const activeRecords = records.filter(r => r.status === "active").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">データブラウザ</h1>
          <p className="text-gray-600 mt-1">ESGデータレコードの参照と分析</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            データエクスポート
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <BarChart3 className="h-4 w-4 mr-2" />
            レポート作成
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総データセット</p>
                <p className="text-2xl font-bold text-gray-900">{records.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総レコード数</p>
                <p className="text-2xl font-bold text-gray-900">{totalRecords.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">アクティブ</p>
                <p className="text-2xl font-bold text-gray-900">{activeRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">最終更新</p>
                <p className="text-2xl font-bold text-gray-900">今日</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="データセットを検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              フィルター
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              期間選択
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Records */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{record.name}</h3>
                    <Badge className={getCategoryColor(record.category)}>
                      {record.category}
                    </Badge>
                    <Badge variant="outline">{record.subcategory}</Badge>
                    {getStatusBadge(record.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-gray-600">レコード数:</span>
                      <p className="font-medium">{record.recordCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">期間:</span>
                      <p className="font-medium">{record.dateRange}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">最終更新:</span>
                      <p className="font-medium">{record.lastUpdated}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-sm text-gray-600">データソース:</span>
                    <p className="font-medium">{record.dataSource}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600 mb-2 block">関連KPI:</span>
                    <div className="flex flex-wrap gap-1">
                      {record.kpis.map((kpi, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {kpi}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    詳細
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    分析
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">データレコードが見つかりません</h3>
            <p className="text-gray-600">検索条件を変更するか、新しいデータを取り込んでください。</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 