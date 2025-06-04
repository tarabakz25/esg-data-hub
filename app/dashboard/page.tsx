"use client";
import Link from 'next/link';
import { ChartBarIcon, DocumentArrowUpIcon, MapIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const dashboardItems = [
    {
      title: 'データ取り込み',
      description: 'CSVファイルからESGデータを取り込みます',
      href: '/dashboard/ingest',
      icon: DocumentArrowUpIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'KPI管理',
      description: 'KPIデータの確認と管理を行います',
      href: '/dashboard/kpis',
      icon: ChartBarIcon,
      color: 'bg-green-500'
    },
    {
      title: 'セマンティックマッピング',
      description: 'AIによるKPIの自動マッピングを確認します',
      href: '/dashboard/mapping',
      icon: MapIcon,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ESGダッシュボード</h1>
        <p className="mt-2 text-gray-600">
          ESGデータハブへようこそ。データの取り込み、管理、分析を効率的に行えます。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${item.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
              </div>
              <p className="mt-3 text-gray-600">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">最近のアクティビティ</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">システム準備完了</span>
            <span className="text-sm text-gray-500">今すぐ</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">ESGデータハブが稼働中</span>
            <span className="text-sm text-gray-500">今すぐ</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 ヒント</h3>
        <p className="text-sm text-blue-700">
          まずは「データ取り込み」からCSVファイルをアップロードして、ESGデータの管理を始めましょう。
        </p>
      </div>
    </div>
  );
} 