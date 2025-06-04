'use client'

import KpiTable from '@/components/kpi/KpiTable'
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBarIcon } from '@heroicons/react/24/outline';

export default function KpisPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="KPI Data"
          description="アップロードされたKPIデータを確認・管理できます。"
          esgCategory="social"
        />
        
        {/* KPI Table */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5 text-secondary" />
              <span>KPIデータ一覧</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KpiTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 