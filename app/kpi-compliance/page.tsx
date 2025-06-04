"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Target } from "lucide-react";

const complianceData = [
  {
    kpi: "炭素排出量削減",
    standard: "ISSB",
    status: "適合",
    dueDate: "2024-12-31",
    assignedTo: "山田 花子",
    progress: 85,
    statusColor: "green"
  },
  {
    kpi: "水使用効率",
    standard: "CSRD",
    status: "リスクあり",
    dueDate: "2024-09-15",
    assignedTo: "佐藤 健太",
    progress: 65,
    statusColor: "yellow"
  },
  {
    kpi: "ダイバーシティ&インクルージョン指標",
    standard: "ISSB",
    status: "適合",
    dueDate: "2024-11-30",
    assignedTo: "田中 美咲",
    progress: 92,
    statusColor: "green"
  },
  {
    kpi: "サプライチェーン透明性",
    standard: "CSRD",
    status: "非適合",
    dueDate: "2024-08-31",
    assignedTo: "鈴木 大介",
    progress: 35,
    statusColor: "red"
  },
  {
    kpi: "エネルギー効率",
    standard: "ISSB",
    status: "適合",
    dueDate: "2024-10-15",
    assignedTo: "高橋 雅子",
    progress: 78,
    statusColor: "green"
  }
];

export default function KPICompliancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">KPIコンプライアンス</h1>
              <p className="text-gray-600">
                ISSB、CSRD、その他の規制フレームワークにおけるESGコンプライアンスを監視します。
              </p>
            </div>
          </div>
        </div>

        {/* Overall Compliance Card */}
        <Card className="border-gray-200 shadow-lg bg-gradient-to-br from-slate-50 to-blue-50">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              全体コンプライアンス
            </CardTitle>
            <CardDescription>
              すべてのESGフレームワークにおける現在のコンプライアンス状況
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-800">コンプライアンス率</span>
                <span className="text-2xl font-bold text-blue-600">75%</span>
              </div>
              <Progress value={75} className="h-3" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>20のKPIのうち15が適合</span>
                <span>目標: 85%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">適合</p>
                  <p className="text-2xl font-bold text-emerald-900">15</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">リスクあり</p>
                  <p className="text-2xl font-bold text-yellow-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">非適合</p>
                  <p className="text-2xl font-bold text-red-900">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Target className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">総KPI数</p>
                  <p className="text-2xl font-bold text-blue-900">20</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Breakdown */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-800">コンプライアンス詳細</CardTitle>
            <CardDescription>
              フレームワーク別のKPIコンプライアンス詳細表示
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-50 border-b border-gray-200 rounded-none">
                <TabsTrigger value="overview" className="text-sm font-medium">概要</TabsTrigger>
                <TabsTrigger value="issb" className="text-sm font-medium">ISSB</TabsTrigger>
                <TabsTrigger value="csrd" className="text-sm font-medium">CSRD</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-0">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="font-semibold text-gray-700">KPI</TableHead>
                      <TableHead className="font-semibold text-gray-700">基準</TableHead>
                      <TableHead className="font-semibold text-gray-700">ステータス</TableHead>
                      <TableHead className="font-semibold text-gray-700">進捗</TableHead>
                      <TableHead className="font-semibold text-gray-700">期限</TableHead>
                      <TableHead className="font-semibold text-gray-700">担当者</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complianceData.map((item, index) => (
                      <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium text-gray-900">
                          {item.kpi}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {item.standard}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary"
                            className={
                              item.statusColor === "green" 
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                                : item.statusColor === "yellow"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                : "bg-red-100 text-red-700 border-red-200"
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={item.progress} className="w-16 h-2" />
                            <span className="text-sm text-gray-600">{item.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {item.dueDate}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {item.assignedTo}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="issb" className="mt-0">
                <div className="p-6 text-center text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>ISSBフレームワークコンプライアンス詳細</p>
                </div>
              </TabsContent>
              
              <TabsContent value="csrd" className="mt-0">
                <div className="p-6 text-center text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>CSRDフレームワークコンプライアンス詳細</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 