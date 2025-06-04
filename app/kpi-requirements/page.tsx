'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, Clock, Target, Search, Plus } from "lucide-react";

interface KPIRequirement {
  id: number;
  kpiId: number;
  regulation: string;
  isRequired: boolean;
  dueDate: string | null;
  department: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AlertLog {
  id: string;
  alertType: string;
  kpiId: number | null;
  regulation: string | null;
  department: string | null;
  message: string;
  status: string;
  sentAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
}

export default function KPIRequirementsPage() {
  const [requirements, setRequirements] = useState<KPIRequirement[]>([]);
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // フォーム用の状態
  const [formData, setFormData] = useState({
    kpiId: '',
    regulation: '',
    isRequired: true,
    dueDate: '',
    department: '',
    description: '',
  });

  useEffect(() => {
    fetchRequirements();
    fetchAlerts();
  }, []);

  const fetchRequirements = async () => {
    try {
      const response = await fetch('/api/kpi-requirements');
      const result = await response.json();
      if (result.success) {
        setRequirements(result.data);
      }
    } catch (error) {
      console.error('KPI要件取得エラー:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alert-logs?limit=10');
      const result = await response.json();
      if (result.success) {
        setAlerts(result.data);
      }
    } catch (error) {
      console.error('アラートログ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/kpi-requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          kpiId: parseInt(formData.kpiId),
          dueDate: formData.dueDate || undefined,
        }),
      });

      if (response.ok) {
        await fetchRequirements();
        setShowForm(false);
        setFormData({
          kpiId: '',
          regulation: '',
          isRequired: true,
          dueDate: '',
          department: '',
          description: '',
        });
      }
    } catch (error) {
      console.error('KPI要件作成エラー:', error);
    }
  };

  const runManualCheck = async () => {
    try {
      const response = await fetch('/api/jobs/kpi-missing-check', {
        method: 'POST',
      });
      const result = await response.json();
      if (result.success) {
        alert(`✅ チェック完了\n欠損KPI: ${result.summary.missingKPICount}件\n期日接近: ${result.summary.approachingDueDateCount}件`);
        await fetchAlerts();
      }
    } catch (error) {
      console.error('手動チェックエラー:', error);
      alert('❌ チェック実行に失敗しました');
    }
  };

  const updateAlertStatus = async (alertId: string, status: string) => {
    try {
      const response = await fetch('/api/alert-logs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alertId, status }),
      });

      if (response.ok) {
        await fetchAlerts();
      }
    } catch (error) {
      console.error('アラートステータス更新エラー:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
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
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">KPI Requirements Management</h1>
              <p className="text-gray-600">
                ESG KPIの要件設定とアラート監視システム
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button 
            onClick={runManualCheck}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
          >
            <Search className="w-4 h-4 mr-2" />
            手動チェック実行
          </Button>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'キャンセル' : '新規KPI要件'}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Target className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Requirements</p>
                  <p className="text-2xl font-bold text-blue-900">{requirements.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Required</p>
                  <p className="text-2xl font-bold text-green-900">
                    {requirements.filter(req => req.isRequired).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-900">
                    {alerts.filter(alert => alert.status === 'sent').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {alerts.filter(alert => alert.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
              <CardTitle className="text-xl text-gray-800">新規KPI要件作成</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">KPI ID</label>
                  <input
                    type="number"
                    value={formData.kpiId}
                    onChange={(e) => setFormData({ ...formData, kpiId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">規制</label>
                  <select
                    value={formData.regulation}
                    onChange={(e) => setFormData({ ...formData, regulation: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">選択してください</option>
                    <option value="ISSB">ISSB</option>
                    <option value="CSRD">CSRD</option>
                    <option value="GRI">GRI</option>
                    <option value="SASB">SASB</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">部門</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">期日</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2 flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    キャンセル
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                    作成
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Requirements Table */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-800">KPI要件一覧</CardTitle>
            <CardDescription>
              設定済みのKPI要件と規制フレームワーク
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-700">KPI ID</TableHead>
                  <TableHead className="font-semibold text-gray-700">規制</TableHead>
                  <TableHead className="font-semibold text-gray-700">必須</TableHead>
                  <TableHead className="font-semibold text-gray-700">部門</TableHead>
                  <TableHead className="font-semibold text-gray-700">期日</TableHead>
                  <TableHead className="font-semibold text-gray-700">説明</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requirements.map((req) => (
                  <TableRow key={req.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-900">{req.kpiId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {req.regulation}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={req.isRequired 
                          ? "bg-green-100 text-green-700 border-green-200" 
                          : "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      >
                        {req.isRequired ? '必須' : '任意'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{req.department || '-'}</TableCell>
                    <TableCell className="text-gray-600">{req.dueDate || '-'}</TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">
                      {req.description || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Alerts Table */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-800">最新アラート</CardTitle>
            <CardDescription>
              KPI欠損と期日接近のアラート履歴
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-700">アラート種別</TableHead>
                  <TableHead className="font-semibold text-gray-700">メッセージ</TableHead>
                  <TableHead className="font-semibold text-gray-700">ステータス</TableHead>
                  <TableHead className="font-semibold text-gray-700">送信日時</TableHead>
                  <TableHead className="font-semibold text-gray-700">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {alert.alertType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 max-w-md">
                      {alert.message}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={
                          alert.status === 'resolved' 
                            ? "bg-green-100 text-green-700 border-green-200" 
                            : alert.status === 'acknowledged'
                            ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }
                      >
                        {alert.status === 'resolved' ? '解決済み' : 
                         alert.status === 'acknowledged' ? '確認済み' : '送信済み'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {new Date(alert.sentAt).toLocaleString('ja-JP')}
                    </TableCell>
                    <TableCell>
                      {alert.status === 'sent' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateAlertStatus(alert.id, 'acknowledged')}
                            className="text-xs"
                          >
                            確認
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateAlertStatus(alert.id, 'resolved')}
                            className="text-xs"
                          >
                            解決
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 