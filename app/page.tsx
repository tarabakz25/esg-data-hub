import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ESGGradientBackground, ESGIcon, ESGCategoryCard, ESGMetricDisplay } from "@/components/ui/esg-theme";
import { StatusBadge } from "@/components/ui/status-badge";
import { BarChart3, Database, Zap, Shield, TrendingUp, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">ESG Data Hub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/catalog">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md">
                  データカタログ
                </Button>
              </Link>
              <Link href="/kpi-requirements">
                <Button variant="secondary" className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md">
                  KPI監視
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="border-blue-200 text-blue-700 bg-white hover:bg-blue-50">
                  ダッシュボード
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto py-8 px-4">
        {/* ヒーローセクション */}
        <div className="mb-12">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 p-8 text-white text-center shadow-xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-4">
                ESGデータ統合プラットフォーム
              </h2>
              <p className="text-xl text-white/95 mb-6">
                持続可能性報告の義務化に向けて、データ収集から分析まで効率的に管理
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <StatusBadge status="success" className="text-white bg-white/25 border-white/40 backdrop-blur-sm">
                  ISSB対応
                </StatusBadge>
                <StatusBadge status="success" className="text-white bg-white/25 border-white/40 backdrop-blur-sm">
                  CSRD対応
                </StatusBadge>
                <StatusBadge status="success" className="text-white bg-white/25 border-white/40 backdrop-blur-sm">
                  AI搭載
                </StatusBadge>
              </div>
            </div>
          </div>
        </div>

        {/* ESGカテゴリカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/catalog">
            <Card className="h-full hover:shadow-xl transition-all cursor-pointer border-blue-100 bg-white/90 backdrop-blur-sm hover:scale-105">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <span className="text-white text-lg">🌱</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-800">データカタログ</CardTitle>
                    <CardDescription className="text-gray-600">KPI・データソース・統計情報の一元管理</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• REST & GraphQL API</li>
                  <li>• 高速検索・フィルタリング</li>
                  <li>• リアルタイム統計</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/kpi-requirements">
            <Card className="h-full hover:shadow-xl transition-all cursor-pointer border-blue-100 bg-white/90 backdrop-blur-sm hover:scale-105">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-lg">👥</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-800">KPI監視システム</CardTitle>
                    <CardDescription className="text-gray-600">必須KPIの欠損を自動監視・通知</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 日次自動チェック</li>
                  <li>• Slack通知連携</li>
                  <li>• 期日管理・エスカレーション</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard">
            <Card className="h-full hover:shadow-xl transition-all cursor-pointer border-blue-100 bg-white/90 backdrop-blur-sm hover:scale-105">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-lg">⚖️</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-800">ESGダッシュボード</CardTitle>
                    <CardDescription className="text-gray-600">ESGデータの可視化と分析</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• リアルタイム監視</li>
                  <li>• 対話的チャート</li>
                  <li>• コンプライアンス状況</li>
                </ul>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* システム効果 */}
        <Card className="mb-8 shadow-lg border-blue-100 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-gray-800 flex items-center justify-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>システム効果</span>
            </CardTitle>
            <CardDescription className="text-gray-600">データ処理の効率化により実現する成果</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                <div className="text-2xl font-bold text-green-700 mb-1">50%</div>
                <div className="text-sm text-green-600 mb-2">工数削減</div>
                <div className="text-xs text-green-500">+15% ↑</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <div className="text-2xl font-bold text-blue-700 mb-1">80%</div>
                <div className="text-sm text-blue-600 mb-2">効率改善</div>
                <div className="text-xs text-blue-500">+25% ↑</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                <div className="text-2xl font-bold text-purple-700 mb-1">99.9%</div>
                <div className="text-sm text-purple-600 mb-2">稼働率</div>
                <div className="text-xs text-purple-500">安定</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                <div className="text-2xl font-bold text-orange-700 mb-1">500ms</div>
                <div className="text-sm text-orange-600 mb-2">応答速度</div>
                <div className="text-xs text-orange-500">-100ms ↓</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 概要 */}
        <Card className="shadow-lg border-blue-100 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>ESG Data Hub について</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              ISSB国内ガイドライン（2025年3月制定、2027年度義務化）に対応した
              次世代ESG情報管理プラットフォーム
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-3 text-blue-700 flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>主な機能</span>
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-xs">🌱</div>
                    <span>データ統合ハブ</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs">👥</div>
                    <span>AIマッピング技術</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-xs">⚖️</div>
                    <span>KPIチェッカー</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>証跡ワークフロー</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span>データカタログ & API</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-green-700 flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>対応規制・基準</span>
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <StatusBadge status="success" size="sm" showIcon={false} className="bg-green-100 text-green-700 border-green-300">ISSB</StatusBadge>
                    <span>国際サステナビリティ基準審議会</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <StatusBadge status="success" size="sm" showIcon={false} className="bg-blue-100 text-blue-700 border-blue-300">CSRD</StatusBadge>
                    <span>企業サステナビリティ報告指令</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <StatusBadge status="warning" size="sm" showIcon={false} className="bg-yellow-100 text-yellow-700 border-yellow-300">TCFD</StatusBadge>
                    <span>気候関連財務情報開示</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <StatusBadge status="neutral" size="sm" showIcon={false} className="bg-gray-100 text-gray-700 border-gray-300">GRI</StatusBadge>
                    <span>グローバル・レポーティング・イニシアチブ</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
