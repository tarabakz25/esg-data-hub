"use client";
import Link from 'next/link';
import { ChartBarIcon, DocumentArrowUpIcon, MapIcon } from '@heroicons/react/24/outline';
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui";
import { ESGIcon } from "@/components/ui/esg-theme";
import { BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const dashboardItems = [
    {
      title: 'データ取り込み',
      description: 'CSVファイルからESGデータを取り込みます',
      href: '/dashboard/ingest',
      icon: DocumentArrowUpIcon,
      esgCategory: 'environment' as const,
      status: 'success' as const
    },
    {
      title: 'KPI管理',
      description: 'KPIデータの確認と管理を行います',
      href: '/dashboard/kpis',
      icon: ChartBarIcon,
      esgCategory: 'social' as const,
      status: 'success' as const
    },
    {
      title: 'セマンティックマッピング',
      description: 'AIによるKPIの自動マッピングを確認します',
      href: '/dashboard/mapping',
      icon: MapIcon,
      esgCategory: 'governance' as const,
      status: 'warning' as const
    }
  ];

  const getCategoryTheme = (category: 'environment' | 'social' | 'governance') => {
    switch (category) {
      case 'environment':
        return "hover:shadow-md transition-all border-primary/20 bg-primary/5 hover:bg-primary/10";
      case 'social':
        return "hover:shadow-md transition-all border-secondary/20 bg-secondary/5 hover:bg-secondary/10";
      case 'governance':
        return "hover:shadow-md transition-all border-accent/20 bg-accent/5 hover:bg-accent/10";
      default:
        return "hover:shadow-md transition-all";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="ESGダッシュボード"
        description="ESGデータハブへようこそ。データの取り込み、管理、分析を効率的に行えます。"
        icon={BarChart3}
      />

      {/* Dashboard Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="block"
            >
              <Card className={getCategoryTheme(item.esgCategory)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-white/80 shadow-sm">
                        <ESGIcon category={item.esgCategory} size="md" />
                      </div>
                      <CardTitle className="text-lg">
                        {item.title}
                      </CardTitle>
                    </div>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <CardDescription className="mt-3">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>最近のアクティビティ</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center space-x-3">
                <StatusBadge status="success" size="sm" showIcon={false}>稼働中</StatusBadge>
                <span className="text-foreground">システム準備完了</span>
              </div>
              <span className="text-sm text-muted-foreground">今すぐ</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center space-x-3">
                <StatusBadge status="success" size="sm" showIcon={false}>稼働中</StatusBadge>
                <span className="text-foreground">ESGデータハブが稼働中</span>
              </div>
              <span className="text-sm text-muted-foreground">今すぐ</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tip Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="p-1 rounded-full bg-primary/20">
              <span className="text-lg">💡</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-primary mb-2">ヒント</h3>
              <p className="text-sm text-foreground">
                まずは「データ取り込み」からCSVファイルをアップロードして、ESGデータの管理を始めましょう。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 