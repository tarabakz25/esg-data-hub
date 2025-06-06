"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Database, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock
} from "lucide-react"

export default function SourcesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data sources
  const dataSources = [
    {
      id: 1,
      name: "エネルギー使用量データ",
      type: "CSV",
      department: "環境部",
      status: "active",
      lastUpdated: "2024年1月15日",
      records: "1,234",
      description: "月次エネルギー消費データ"
    },
    {
      id: 2,
      name: "廃棄物管理システムAPI",
      type: "API",
      department: "施設管理部",
      status: "active",
      lastUpdated: "2024年1月14日",
      records: "856",
      description: "リアルタイム廃棄物データ"
    },
    {
      id: 3,
      name: "人事データベース",
      type: "Database",
      department: "人事部",
      status: "inactive",
      lastUpdated: "2024年1月10日",
      records: "2,456",
      description: "従業員データ（ダイバーシティ指標）"
    },
    {
      id: 4,
      name: "温室効果ガス排出量",
      type: "CSV",
      department: "環境部",
      status: "error",
      lastUpdated: "2024年1月12日",
      records: "567",
      description: "Scope 1, 2, 3 排出量データ"
    }
  ]

  const filteredSources = dataSources.filter(source =>
    source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />アクティブ</Badge>
      case "inactive":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />非アクティブ</Badge>
      case "error":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />エラー</Badge>
      default:
        return <Badge variant="outline">不明</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "CSV":
        return "📄"
      case "API":
        return "🔌"
      case "Database":
        return "🗄️"
      default:
        return "📁"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">データソース管理</h1>
          <p className="text-gray-600 mt-1">CSV、API、データベース連携の管理</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          新しいソースを追加
        </Button>
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
                <p className="text-sm font-medium text-gray-600">総ソース数</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
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
                <p className="text-sm font-medium text-gray-600">アクティブ</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">エラー</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総レコード数</p>
                <p className="text-2xl font-bold text-gray-900">5.2K</p>
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
                  placeholder="データソースを検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              フィルター
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredSources.map((source) => (
          <Card key={source.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getTypeIcon(source.type)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{source.name}</h3>
                    <p className="text-sm text-gray-600">{source.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">部署: {source.department}</span>
                      <span className="text-xs text-gray-500">レコード: {source.records}</span>
                      <span className="text-xs text-gray-500">更新: {source.lastUpdated}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(source.status)}
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    編集
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSources.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">データソースが見つかりません</h3>
            <p className="text-gray-600">検索条件を変更するか、新しいデータソースを追加してください。</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 