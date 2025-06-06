"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ChartBarIcon, DocumentArrowUpIcon, MapIcon } from '@heroicons/react/24/outline';
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui";
import { ESGIcon } from "@/components/ui/esg-theme";
import { BarChart3, Loader2 } from "lucide-react";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // まだロード中
    if (!session) {
      router.push('/signin');
    }
  }, [session, status, router]);

  // ロード中の場合
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">認証情報を確認中...</p>
        </div>
      </div>
    );
  }

  // 未認証の場合
  if (!session) {
    return null; // useEffectでリダイレクトされるため、何も表示しない
  }

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
                      <CardTitle className="text-lg text-black">
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
      <RecentActivity
        limit={8}
        autoRefresh={true}
        refreshInterval={30000}
        showStats={true}
      />

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