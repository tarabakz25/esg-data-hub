"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, ExternalLink, Download, Eye, Activity } from "lucide-react";

const recentUploads = [
  {
    fileName: "サステナビリティレポート2023.csv",
    source: "CSV アップロード",
    uploadedBy: "田中 花子",
    uploadedOn: "2024-07-26 10:00",
    status: "完了",
    statusColor: "green"
  },
  {
    fileName: "ERPデータ抽出.xlsx",
    source: "ERPシステム",
    uploadedBy: "佐藤 健太",
    uploadedOn: "2024-07-25 15:30",
    status: "完了",
    statusColor: "green"
  },
  {
    fileName: "BIダッシュボードデータ.json",
    source: "BIツール",
    uploadedBy: "山田 美咲",
    uploadedOn: "2024-07-24 09:15",
    status: "処理中",
    statusColor: "yellow"
  },
  {
    fileName: "サプライヤーデータ.csv",
    source: "CSV アップロード",
    uploadedBy: "鈴木 大介",
    uploadedOn: "2024-07-23 14:00",
    status: "完了",
    statusColor: "green"
  },
  {
    fileName: "エネルギー消費データ.csv",
    source: "CSV アップロード",
    uploadedBy: "高橋 雅子",
    uploadedOn: "2024-07-22 11:45",
    status: "完了",
    statusColor: "green"
  }
];

export default function DataManagementPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">データ管理</h1>
              <p className="text-gray-600">
                ESGデータのインポート、検証プロセス、データ品質監視を管理します。
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-800 text-lg">総ファイル数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">247</div>
              <p className="text-xs text-emerald-600 mt-1">今月 +12</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-800 text-lg">データソース</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">8</div>
              <p className="text-xs text-blue-600 mt-1">接続済みシステム</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-800 text-lg">処理中</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">3</div>
              <p className="text-xs text-purple-600 mt-1">待機中のファイル</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Import Section */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-emerald-600" />
              データインポート
            </CardTitle>
            <CardDescription>
              新しいESGデータファイルをアップロードするか、外部システムに接続します
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg">
                <Upload className="w-4 h-4 mr-2" />
                CSV アップロード
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                <FileText className="w-4 h-4 mr-2" />
                システム接続
              </Button>
              <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                <Download className="w-4 h-4 mr-2" />
                一括インポート
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Uploads Section */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-800">最近のアップロード</CardTitle>
            <CardDescription>
              最新のデータアップロードとその処理ステータスを監視します
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-700">ファイル名</TableHead>
                  <TableHead className="font-semibold text-gray-700">ソース</TableHead>
                  <TableHead className="font-semibold text-gray-700">アップロード者</TableHead>
                  <TableHead className="font-semibold text-gray-700">日時</TableHead>
                  <TableHead className="font-semibold text-gray-700">ステータス</TableHead>
                  <TableHead className="font-semibold text-gray-700">アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUploads.map((upload, index) => (
                  <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span>{upload.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      <Badge variant="outline" className="text-xs">
                        {upload.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {upload.uploadedBy}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {upload.uploadedOn}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={
                          upload.statusColor === "green" 
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                            : upload.statusColor === "yellow"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      >
                        {upload.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-100">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
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