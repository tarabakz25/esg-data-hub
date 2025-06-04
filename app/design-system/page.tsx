"use client"

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Button,
  StatusBadge,
  ESGCategoryCard,
  ESGMetricDisplay,
  ESGGradientBackground,
  ESGIcon
} from "@/components/ui"
import { KPICard } from "@/components/dashboard/kpi-card"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  Leaf, 
  Shield,
  Globe,
  Zap
} from "lucide-react"

export default function DesignSystemPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <ESGGradientBackground className="rounded-lg p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">ESG Design System</h1>
                <p className="text-white/90">統一されたサステナビリティテーマのUIコンポーネント</p>
              </div>
            </div>
          </ESGGradientBackground>
        </div>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ESGIcon category="environment" />
              <span>カラーパレット</span>
            </CardTitle>
            <CardDescription>
              ESGテーマに基づいた統一カラーシステム
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-primary">Environment (Primary)</h3>
                <div className="flex space-x-2">
                  <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <div className="primary-gradient w-12 h-12 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">GR</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">持続可能性、自然、環境保護</p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-secondary">Social (Secondary)</h3>
                <div className="flex space-x-2">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="secondary-gradient w-12 h-12 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">BL</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">社会性、信頼、コミュニティ</p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-accent">Governance (Accent)</h3>
                <div className="flex space-x-2">
                  <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div className="accent-gradient w-12 h-12 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PR</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">ガバナンス、透明性、統制</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ESG Category Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">ESGカテゴリカード</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ESGCategoryCard
              category="environment"
              title="Environmental"
              description="環境への取り組み"
              value="85%"
            >
              <div className="space-y-2">
                <ESGMetricDisplay
                  label="CO2削減率"
                  value="23"
                  unit="%"
                  category="environment"
                  trend={{ direction: "up", value: "+5%" }}
                />
              </div>
            </ESGCategoryCard>

            <ESGCategoryCard
              category="social"
              title="Social"
              description="社会への貢献"
              value="92%"
            >
              <div className="space-y-2">
                <ESGMetricDisplay
                  label="従業員満足度"
                  value="4.8"
                  unit="/5.0"
                  category="social"
                  trend={{ direction: "up", value: "+0.3" }}
                />
              </div>
            </ESGCategoryCard>

            <ESGCategoryCard
              category="governance"
              title="Governance"
              description="企業統治"
              value="78%"
            >
              <div className="space-y-2">
                <ESGMetricDisplay
                  label="コンプライアンス率"
                  value="98"
                  unit="%"
                  category="governance"
                  trend={{ direction: "neutral", value: "安定" }}
                />
              </div>
            </ESGCategoryCard>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">統一KPIカード</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard
              title="エネルギー消費量"
              value="1,245"
              unit="kWh"
              description="前月比"
              trend="down"
              trendValue="-12%"
              status="good"
              icon={Zap}
            />
            
            <KPICard
              title="廃棄物削減"
              value="67"
              unit="%"
              description="目標達成率"
              trend="up"
              trendValue="+8%"
              status="good"
              icon={Globe}
            />
            
            <KPICard
              title="従業員研修"
              value="134"
              unit="人"
              description="今月実施"
              trend="neutral"
              status="warning"
              icon={Users}
            />
            
            <KPICard
              title="コンプライアンス"
              value="3"
              unit="件"
              description="未対応項目"
              trend="down"
              trendValue="-2件"
              status="error"
              icon={Shield}
            />
          </div>
        </div>

        {/* Status Badges */}
        <Card>
          <CardHeader>
            <CardTitle>ステータスバッジ</CardTitle>
            <CardDescription>
              統一されたステータス表示コンポーネント
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <StatusBadge status="success">達成済み</StatusBadge>
                <StatusBadge status="warning">注意が必要</StatusBadge>
                <StatusBadge status="error">要対応</StatusBadge>
                <StatusBadge status="pending">処理中</StatusBadge>
                <StatusBadge status="neutral">未設定</StatusBadge>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <StatusBadge status="success" size="sm">小</StatusBadge>
                <StatusBadge status="warning" size="md">中</StatusBadge>
                <StatusBadge status="error" size="lg">大</StatusBadge>
              </div>

              <div className="flex flex-wrap gap-3">
                <StatusBadge status="success" showIcon={false}>アイコンなし</StatusBadge>
                <Badge variant="success">通常バッジ</Badge>
                <Badge variant="warning">警告</Badge>
                <Badge variant="accent">アクセント</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>ボタンコンポーネント</CardTitle>
            <CardDescription>
              統一されたボタンスタイル
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>使用ガイドライン</CardTitle>
            <CardDescription>
              デザインシステムの効果的な活用方法
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">カラーの使い分け</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Environment: 環境関連のKPI、グリーンエネルギー</li>
                    <li>• Social: 従業員、地域貢献、社会的影響</li>
                    <li>• Governance: コンプライアンス、リスク管理</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-secondary">ステータスの表現</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Success: 目標達成、正常状態</li>
                    <li>• Warning: 注意が必要、監視中</li>
                    <li>• Error: 緊急対応、問題発生</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 