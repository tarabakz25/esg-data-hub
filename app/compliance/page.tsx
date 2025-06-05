'use client'

import { useState, useEffect } from 'react'
import ComplianceChecker from '@/components/compliance/ComplianceChecker'
import ComplianceHistory from '@/components/compliance/ComplianceHistory'
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui";
import { Shield, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<'check' | 'history'>('check')

  useEffect(() => {
    console.log('🔍 CompliancePage mounted')
  }, [])

  console.log('🔍 CompliancePage rendering, activeTab:', activeTab)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="KPI Compliance Check"
          description="ISSB/CSRD基準に基づく必須KPIの欠損チェックと監査対応を支援します。"
          esgCategory="governance"
        />

        {/* Debug Info */}
        <Card className="bg-secondary/5 border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <StatusBadge status="success" size="sm">Debug</StatusBadge>
              <span className="text-sm text-secondary">
                ページが正常に表示されています。activeTab = {activeTab}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => {
              console.log('🔍 Switching to check tab')
              setActiveTab('check')
            }}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-theme flex items-center justify-center space-x-2",
              activeTab === 'check'
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            )}
          >
            <CheckCircle className="w-4 h-4" />
            <span>コンプライアンスチェック</span>
          </button>
          <button
            onClick={() => {
              console.log('🔍 Switching to history tab')
              setActiveTab('history')
            }}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-theme flex items-center justify-center space-x-2",
              activeTab === 'history'
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            )}
          >
            <Clock className="w-4 h-4" />
            <span>チェック履歴</span>
          </button>
        </div>

        {/* Tab Content */}
        <Card className="card-shadow">
          {activeTab === 'check' && (
            <>
              <CardContent className="p-4 bg-success/5 border-b border-border">
                <div className="flex items-center space-x-2">
                  <StatusBadge status="success" size="sm">Debug</StatusBadge>
                  <span className="text-sm text-success">ComplianceChecker コンポーネントを表示中</span>
                </div>
              </CardContent>
              <ComplianceChecker />
            </>
          )}
          {activeTab === 'history' && (
            <>
              <CardContent className="p-4 bg-warning/5 border-b border-border">
                <div className="flex items-center space-x-2">
                  <StatusBadge status="warning" size="sm">Debug</StatusBadge>
                  <span className="text-sm text-warning">ComplianceHistory コンポーネントを表示中</span>
                </div>
              </CardContent>
              <ComplianceHistory />
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
} 