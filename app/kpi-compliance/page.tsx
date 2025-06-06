"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Target, RefreshCw, Loader2 } from "lucide-react";

interface ComplianceItem {
  id: string;
  kpi: string;
  standard: string;
  status: string;
  dueDate: string;
  assignedTo: string;
  progress: number;
  statusColor: string;
  lastUpdated: string;
}

interface ComplianceStats {
  totalKpis: number;
  compliant: number;
  atRisk: number;
  nonCompliant: number;
  overallProgress: number;
  complianceRate: number;
}

export default function KPICompliancePage() {
  const [complianceData, setComplianceData] = useState<ComplianceItem[]>([]);
  const [stats, setStats] = useState<ComplianceStats>({
    totalKpis: 0,
    compliant: 0,
    atRisk: 0,
    nonCompliant: 0,
    overallProgress: 0,
    complianceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/compliance/check');
      if (!response.ok) {
        throw new Error('コンプライアンスデータの取得に失敗しました');
      }
      
      const data = await response.json();
      setComplianceData(data.items || []);
      setStats(data.stats || {
        totalKpis: 0,
        compliant: 0,
        atRisk: 0,
        nonCompliant: 0,
        overallProgress: 0,
        complianceRate: 0
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplianceData();
    
    // リアルタイム更新のためのポーリング設定
    const interval = setInterval(fetchComplianceData, 30000); // 30秒ごと
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '適合':
        return 'green';
      case 'リスクあり':
        return 'yellow';
      case '非適合':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">エラーが発生しました</h2>
            <p className="text-gray-600">{error}</p>
            <Button onClick={fetchComplianceData} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              再試行
            </Button>
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
            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <p className="text-sm text-gray-500">
                  最終更新: {lastUpdated.toLocaleTimeString('ja-JP')}
                </p>
              )}
              <Button
                onClick={fetchComplianceData}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                更新
              </Button>
            </div>
          </div>
        </div>

        {/* Overall Compliance Card */}
        <Card className="border-gray-200 shadow-lg bg-gradient-to-br from-slate-50 to-blue-50">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              全体コンプライアンス
              {loading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
            </CardTitle>
            <CardDescription>
              すべてのESGフレームワークにおける現在のコンプライアンス状況
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-800">コンプライアンス率</span>
                <span className="text-2xl font-bold text-blue-600">{stats.complianceRate}%</span>
              </div>
              <Progress value={stats.complianceRate} className="h-3" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{stats.totalKpis}のKPIのうち{stats.compliant}が適合</span>
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
                  <p className="text-2xl font-bold text-emerald-900">{stats.compliant}</p>
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
                  <p className="text-2xl font-bold text-yellow-900">{stats.atRisk}</p>
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
                  <p className="text-2xl font-bold text-red-900">{stats.nonCompliant}</p>
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
                  <p className="text-2xl font-bold text-blue-900">{stats.totalKpis}</p>
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
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>データを読み込み中...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : complianceData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          コンプライアンスデータがありません
                        </TableCell>
                      </TableRow>
                    ) : (
                      complianceData.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
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
                                getStatusColor(item.status) === "green" 
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                                  : getStatusColor(item.status) === "yellow"
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
                            {new Date(item.dueDate).toLocaleDateString('ja-JP')}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            <div className="flex flex-col">
                              <span>{item.assignedTo}</span>
                              <span className="text-xs text-gray-400">
                                更新: {new Date(item.lastUpdated).toLocaleDateString('ja-JP')}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="issb" className="mt-0">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="font-semibold text-gray-700">KPI</TableHead>
                      <TableHead className="font-semibold text-gray-700">ステータス</TableHead>
                      <TableHead className="font-semibold text-gray-700">進捗</TableHead>
                      <TableHead className="font-semibold text-gray-700">期限</TableHead>
                      <TableHead className="font-semibold text-gray-700">担当者</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>データを読み込み中...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      complianceData
                        .filter(item => item.standard === 'ISSB')
                        .map((item) => (
                          <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="font-medium text-gray-900">
                              {item.kpi}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="secondary"
                                className={
                                  getStatusColor(item.status) === "green" 
                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                                    : getStatusColor(item.status) === "yellow"
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
                              {new Date(item.dueDate).toLocaleDateString('ja-JP')}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {item.assignedTo}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="csrd" className="mt-0">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="font-semibold text-gray-700">KPI</TableHead>
                      <TableHead className="font-semibold text-gray-700">ステータス</TableHead>
                      <TableHead className="font-semibold text-gray-700">進捗</TableHead>
                      <TableHead className="font-semibold text-gray-700">期限</TableHead>
                      <TableHead className="font-semibold text-gray-700">担当者</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>データを読み込み中...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      complianceData
                        .filter(item => item.standard === 'CSRD')
                        .map((item) => (
                          <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="font-medium text-gray-900">
                              {item.kpi}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="secondary"
                                className={
                                  getStatusColor(item.status) === "green" 
                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                                    : getStatusColor(item.status) === "yellow"
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
                              {new Date(item.dueDate).toLocaleDateString('ja-JP')}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {item.assignedTo}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 