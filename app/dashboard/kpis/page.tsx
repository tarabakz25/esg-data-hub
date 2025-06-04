'use client'

import KpiTable from '@/components/kpi/KpiTable'

export default function KpisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">KPI Data</h1>
        <p className="mt-2 text-gray-600">
          アップロードされたKPIデータを確認・管理できます。
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          KPIデータ一覧
        </h2>
        <KpiTable />
      </div>
    </div>
  )
} 