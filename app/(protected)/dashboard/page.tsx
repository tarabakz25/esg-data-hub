"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Database, 
  Upload,
  FileCheck,
  Users,
  Activity,
  ArrowRight,
  BarChart3
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session } = useSession()

  // Mock data for the dashboard
  const kpiStats = [
    {
      title: "総データソース",
      value: "12",
      change: "+2",
      changeType: "increase" as const,
      icon: Database,
      href: "/sources"
    },
    {
      title: "今月の取込量",
      value: "2.4GB",
      change: "+15%",
      changeType: "increase" as const,
      icon: Upload,
      href: "/ingest"
    },
    {
      title: "マッピング完了率",
      value: "87%",
      change: "+5%",
      changeType: "increase" as const,
      icon: CheckCircle,
      href: "/mapping"
    },
    {
      title: "欠損KPI",
      value: "3",
      change: "-2",
      changeType: "decrease" as const,
      icon: AlertTriangle,
      href: "/kpi-check"
    }
  ]

  const alerts = [
    {
      id: 1,
      type: "warning" as const,
      title: "Scope 2 排出量データの欠損",
      description: "2024年Q3のScope 2排出量データが未入力です",
      time: "2時間前",
      href: "/kpi-check"
    },
    {
      id: 2,
      type: "info" as const,
      title: "新しいデータソースが追加されました",
      description: "環境部門からの廃棄物データソースが追加されました",
      time: "4時間前",
      href: "/sources"
    },
    {
      id: 3,
      type: "success" as const,
      title: "AI マッピング完了",
      description: "エネルギー使用量データのマッピングが完了しました",
      time: "6時間前",
      href: "/mapping"
    }
  ]

  const recentActivity = [
    {
      id: 1,
      action: "データ取込",
      target: "エネルギー使用量_2024Q3.csv",
      user: "田中 太郎",
      time: "30分前",
      status: "completed"
    },
    {
      id: 2,
      action: "マッピング承認",
      target: "廃棄物データ",
      user: "佐藤 花子",
      time: "1時間前",
      status: "completed"
    },
    {
      id: 3,
      action: "監査コメント",
      target: "Scope 1 排出量",
      user: "監査法人 A",
      time: "2時間前",
      status: "pending"
    }
  ]

  const complianceStatus = [
    {
      category: "ISSB基準",
      progress: 75,
      status: "進行中",
      dueDate: "2024年3月末"
    },
    {
      category: "CSRD要件",
      progress: 60,
      status: "進行中",
      dueDate: "2024年6月末"
    },
    {
      category: "監査準備",
      progress: 90,
      status: "ほぼ完了",
      dueDate: "2024年2月末"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          おかえりなさい、{session?.user?.name}さん
        </h1>
        <p className="text-gray-600">
          本日のESGデータ管理状況をご確認ください
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiStats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  {stat.changeType === "increase" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.changeType === "increase" ? "text-green-600" : "text-red-600"}>
                    {stat.change}
                  </span>
                  <span>先月比</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>アラート・通知</span>
            </CardTitle>
            <CardDescription>
              重要な通知とアラートを確認してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert) => (
              <Link key={alert.id} href={alert.href}>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    alert.type === "warning" ? "bg-orange-500" :
                    alert.type === "info" ? "bg-blue-500" : "bg-green-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </Link>
            ))}
            <Link href="/kpi-check">
              <Button variant="outline" className="w-full">
                すべてのアラートを表示
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <span>最近のアクティビティ</span>
            </CardTitle>
            <CardDescription>
              システム内での最新の活動状況
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === "completed" ? "bg-green-500" : "bg-orange-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{activity.action}</span>
                    <Badge variant="outline" className="text-xs">{activity.target}</Badge>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-600">{activity.user}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
            <Link href="/audit">
              <Button variant="outline" className="w-full">
                アクティビティログを表示
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileCheck className="h-5 w-5 text-green-500" />
            <span>コンプライアンス状況</span>
          </CardTitle>
          <CardDescription>
            各種基準・要件への対応進捗状況
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {complianceStatus.map((item) => (
              <div key={item.category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{item.category}</h4>
                  <Badge variant={item.progress >= 80 ? "default" : "secondary"}>
                    {item.status}
                  </Badge>
                </div>
                <Progress value={item.progress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{item.progress}% 完了</span>
                  <span>{item.dueDate}まで</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>クイックアクション</CardTitle>
          <CardDescription>
            よく使用する機能に素早くアクセス
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/ingest">
              <Button variant="outline" className="h-20 w-full flex flex-col space-y-2">
                <Upload className="h-5 w-5" />
                <span className="text-sm">データ取込</span>
              </Button>
            </Link>
            <Link href="/mapping">
              <Button variant="outline" className="h-20 w-full flex flex-col space-y-2">
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm">マッピング</span>
              </Button>
            </Link>
            <Link href="/kpi-check">
              <Button variant="outline" className="h-20 w-full flex flex-col space-y-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">KPIチェック</span>
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline" className="h-20 w-full flex flex-col space-y-2">
                <FileCheck className="h-5 w-5" />
                <span className="text-sm">レポート出力</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 