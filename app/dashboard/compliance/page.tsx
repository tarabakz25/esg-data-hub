'use client'

import { useState, useEffect } from 'react'
import ComplianceChecker from '@/components/compliance/ComplianceChecker'
import ComplianceHistory from '@/components/compliance/ComplianceHistory'

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<'check' | 'history'>('check')

  useEffect(() => {
    console.log('🔍 CompliancePage mounted')
  }, [])

  console.log('🔍 CompliancePage rendering, activeTab:', activeTab)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">KPI Compliance Check</h1>
        <p className="mt-2 text-gray-600">
          ISSB/CSRD基準に基づく必須KPIの欠損チェックと監査対応を支援します。
        </p>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            🔍 Debug: ページが正常に表示されています。activeTab = {activeTab}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              console.log('🔍 Switching to check tab')
              setActiveTab('check')
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'check'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            コンプライアンスチェック
          </button>
          <button
            onClick={() => {
              console.log('🔍 Switching to history tab')
              setActiveTab('history')
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            チェック履歴
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'check' && (
          <>
            <div className="p-4 bg-green-50 border-b">
              <p className="text-sm text-green-700">🔍 Debug: ComplianceChecker コンポーネントを表示中</p>
            </div>
            <ComplianceChecker />
          </>
        )}
        {activeTab === 'history' && (
          <>
            <div className="p-4 bg-yellow-50 border-b">
              <p className="text-sm text-yellow-700">🔍 Debug: ComplianceHistory コンポーネントを表示中</p>
            </div>
            <ComplianceHistory />
          </>
        )}
      </div>
    </div>
  )
} 