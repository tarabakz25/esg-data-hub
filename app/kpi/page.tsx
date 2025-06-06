"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  Brain,
  Search,
  ArrowRight,
  TrendingUp,
  Calendar,
  User,
  FileText,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Eye,
  Edit
} from "lucide-react";
import { cn } from "@/lib/utils";

// モックデータ
const mockMappings = [
  {
    id: "map001",
    sourceColumn: "CO2_emissions_scope1",
    mappedKPI: "Scope1 CO2排出量",
    confidence: 95,
    status: "確定",
    dataType: "numeric",
    unit: "t-CO2",
    sampleValues: ["1234.5", "2456.7", "3789.2"]
  },
  {
    id: "map002",
    sourceColumn: "employee_count_total",
    mappedKPI: "従業員数",
    confidence: 88,
    status: "要確認",
    dataType: "numeric", 
    unit: "人",
    sampleValues: ["5432", "5567", "5789"]
  },
  {
    id: "map003",
    sourceColumn: "renewable_energy_rate",
    mappedKPI: "再生可能エネルギー比率",
    confidence: 72,
    status: "未確定",
    dataType: "percentage",
    unit: "%",
    sampleValues: ["23.4", "26.8", "31.2"]
  }
];

const mockMissingKPIs = [
  {
    id: "missing001",
    name: "Scope3 CO2排出量",
    category: "環境",
    regulation: "ISSB",
    priority: "高",
    deadline: "2024-12-31",
    responsible: "環境推進部",
    lastUpdate: "2024-12-10"
  },
  {
    id: "missing002",
    name: "女性管理職比率",
    category: "社会",
    regulation: "CSRD",
    priority: "中",
    deadline: "2025-01-15",
    responsible: "人事部",
    lastUpdate: "2024-12-12"
  },
  {
    id: "missing003",
    name: "取締役会の独立性",
    category: "ガバナンス",
    regulation: "GRI",
    priority: "中",
    deadline: "2025-02-28",
    responsible: "コーポレート・ガバナンス室",
    lastUpdate: "2024-12-08"
  }
];

const mockKPIRequirements = [
  {
    id: "req001",
    name: "ISSB必須KPI",
    regulation: "ISSB",
    totalKPIs: 156,
    completedKPIs: 142,
    missingKPIs: 14,
    coverage: 91,
    lastCheck: "2024-12-15"
  },
  {
    id: "req002",
    name: "CSRD開示要件",
    regulation: "CSRD",
    totalKPIs: 234,
    completedKPIs: 198,
    missingKPIs: 36,
    coverage: 85,
    lastCheck: "2024-12-15"
  },
  {
    id: "req003",
    name: "GRI Standards",
    regulation: "GRI",
    totalKPIs: 189,
    completedKPIs: 165,
    missingKPIs: 24,
    coverage: 87,
    lastCheck: "2024-12-14"
  }
];

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return "text-green-600 bg-green-50";
  if (confidence >= 70) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "高": return "bg-red-100 text-red-800 border-red-200";
    case "中": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "低": return "bg-green-100 text-green-800 border-green-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function KPIManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMapping, setSelectedMapping] = useState<string | null>(null);

  const filteredMappings = mockMappings.filter(mapping =>
    mapping.sourceColumn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.mappedKPI.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Target className="h-8 w-8 text-green-600" />
              <span>KPI管理</span>
              <Badge className="bg-gradient-to-r from-blue-500 to-green-500 text-white flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>AI</span>
              </Badge>
            </h1>
            <p className="text-gray-600 mt-2">自動マッピング、欠損チェック、要件管理の統合管理</p>
          </div>
          <Button className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <Play className="h-4 w-4 mr-2" />
            自動処理開始
          </Button>
        </div>

        {/* 概要カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Brain className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">142</p>
                  <p className="text-sm text-gray-600">自動マッピング済</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">89%</p>
                  <p className="text-sm text-gray-600">マッピング精度</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                  <p className="text-sm text-gray-600">要確認KPI</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Target className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">14</p>
                  <p className="text-sm text-gray-600">欠損KPI</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* メインコンテンツ */}
        <Tabs defaultValue="mapping" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mapping" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>自動マッピング</span>
            </TabsTrigger>
            <TabsTrigger value="missing" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>欠損チェック</span>
            </TabsTrigger>
            <TabsTrigger value="requirements" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>要件管理</span>
            </TabsTrigger>
          </TabsList>

          {/* 自動マッピングタブ */}
          <TabsContent value="mapping" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-green-600" />
                      <span>AI自動マッピング結果</span>
                    </CardTitle>
                    <CardDescription>機械学習による列名とKPIの自動対応付け</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="マッピングを検索..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      エクスポート
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredMappings.map((mapping) => (
                    <div
                      key={mapping.id}
                      className={cn(
                        "p-4 border rounded-lg transition-all cursor-pointer",
                        selectedMapping === mapping.id 
                          ? "border-blue-500 bg-blue-50" 
                          : "hover:bg-gray-50"
                      )}
                      onClick={() => setSelectedMapping(mapping.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                              {mapping.sourceColumn}
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                            <div className="font-semibold text-gray-900">{mapping.mappedKPI}</div>
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <span>データ型: {mapping.dataType}</span>
                            <span>単位: {mapping.unit}</span>
                            <span>サンプル: {mapping.sampleValues.slice(0, 2).join(", ")}...</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-center">
                            <div className={cn(
                              "text-lg font-bold px-3 py-1 rounded-lg",
                              getConfidenceColor(mapping.confidence)
                            )}>
                              {mapping.confidence}%
                            </div>
                            <div className="text-xs text-gray-500 mt-1">信頼度</div>
                          </div>
                          <Badge className={cn(
                            mapping.status === "確定" ? "bg-green-100 text-green-800" :
                            mapping.status === "要確認" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          )}>
                            {mapping.status}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {filteredMappings.length}件のマッピング結果を表示中
                  </div>
                  <div className="flex space-x-3">
                    <Button variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      再マッピング
                    </Button>
                    <Button className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      マッピング確定
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 欠損チェックタブ */}
          <TabsContent value="missing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span>欠損KPI一覧</span>
                </CardTitle>
                <CardDescription>規制要件で必須とされるが不足しているKPI</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMissingKPIs.map((kpi) => (
                    <div key={kpi.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{kpi.name}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>期限: {kpi.deadline}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{kpi.responsible}</span>
                            </span>
                            <span>カテゴリ: {kpi.category}</span>
                            <span>規制: {kpi.regulation}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={cn("flex items-center space-x-1", getPriorityColor(kpi.priority))}>
                          <span>{kpi.priority}優先</span>
                        </Badge>
                        <Button size="sm" className="bg-blue-500 text-white">
                          <User className="h-4 w-4 mr-1" />
                          担当者に通知
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">アクション推奨</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        14個のKPIが欠損しています。優先度「高」の項目から対応を開始することをお勧めします。
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-3">
                    <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700">
                      <Download className="h-4 w-4 mr-2" />
                      欠損リストをダウンロード
                    </Button>
                    <Button size="sm" className="bg-yellow-600 text-white">
                      一括通知送信
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 要件管理タブ */}
          <TabsContent value="requirements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockKPIRequirements.map((requirement) => (
                <Card key={requirement.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{requirement.name}</span>
                      <Badge variant="outline">{requirement.regulation}</Badge>
                    </CardTitle>
                    <CardDescription>
                      最終チェック: {requirement.lastCheck}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>進捗状況</span>
                        <span>{requirement.coverage}%</span>
                      </div>
                      <Progress value={requirement.coverage} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>完了: {requirement.completedKPIs}</span>
                        <span>不足: {requirement.missingKPIs}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-700">{requirement.completedKPIs}</div>
                        <div className="text-xs text-green-600">完了KPI</div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-lg font-bold text-red-700">{requirement.missingKPIs}</div>
                        <div className="text-xs text-red-600">欠損KPI</div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        詳細
                      </Button>
                      <Button size="sm" className="flex-1 bg-blue-500 text-white">
                        <Play className="h-4 w-4 mr-2" />
                        チェック実行
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>全体コンプライアンス状況</span>
                </CardTitle>
                <CardDescription>各規制基準に対する適合状況の概要</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-800">総合コンプライアンス</h4>
                      <span className="text-2xl font-bold text-blue-700">88%</span>
                    </div>
                    <Progress value={88} className="h-3" />
                    <p className="text-sm text-blue-600 mt-2">
                      全579 KPIのうち505が完了、74が不足しています
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-bold text-green-600">91%</div>
                      <div className="text-sm text-gray-600">ISSB準拠率</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-bold text-yellow-600">85%</div>
                      <div className="text-sm text-gray-600">CSRD準拠率</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-bold text-blue-600">87%</div>
                      <div className="text-sm text-gray-600">GRI準拠率</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 