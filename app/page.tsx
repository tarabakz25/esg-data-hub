import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ESGGradientBackground, ESGIcon, ESGCategoryCard, ESGMetricDisplay } from "@/components/ui/esg-theme";
import { StatusBadge } from "@/components/ui/status-badge";
import { BarChart3, Database, Zap, Shield, TrendingUp, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg esg-gradient flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">ESG Data Hub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/catalog">
                <Button className="primary-gradient text-white hover:opacity-90">
                  データカタログ
                </Button>
              </Link>
              <Link href="/kpi-requirements">
                <Button variant="secondary" className="secondary-gradient text-white hover:opacity-90">
                  KPI監視
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">
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
          <ESGGradientBackground className="rounded-lg p-8 text-white text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-4">
                ESGデータ統合プラットフォーム
              </h2>
              <p className="text-xl text-white/90 mb-6">
                持続可能性報告の義務化に向けて、データ収集から分析まで効率的に管理
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <StatusBadge status="success" className="text-white bg-white/20 border-white/30">
                  ISSB対応
                </StatusBadge>
                <StatusBadge status="success" className="text-white bg-white/20 border-white/30">
                  CSRD対応
                </StatusBadge>
                <StatusBadge status="success" className="text-white bg-white/20 border-white/30">
                  AI搭載
                </StatusBadge>
              </div>
            </div>
          </ESGGradientBackground>
        </div>

        {/* ESGカテゴリカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/catalog">
            <ESGCategoryCard
              category="environment"
              title="データカタログ"
              description="KPI・データソース・統計情報の一元管理"
              className="h-full hover:shadow-lg transition-all cursor-pointer"
            >
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• REST & GraphQL API</li>
                <li>• 高速検索・フィルタリング</li>
                <li>• リアルタイム統計</li>
              </ul>
            </ESGCategoryCard>
          </Link>

          <Link href="/kpi-requirements">
            <ESGCategoryCard
              category="social"
              title="KPI監視システム"
              description="必須KPIの欠損を自動監視・通知"
              className="h-full hover:shadow-lg transition-all cursor-pointer"
            >
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 日次自動チェック</li>
                <li>• Slack通知連携</li>
                <li>• 期日管理・エスカレーション</li>
              </ul>
            </ESGCategoryCard>
          </Link>

          <Link href="/dashboard">
            <ESGCategoryCard
              category="governance"
              title="ESGダッシュボード"
              description="ESGデータの可視化と分析"
              className="h-full hover:shadow-lg transition-all cursor-pointer"
            >
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• リアルタイム監視</li>
                <li>• 対話的チャート</li>
                <li>• コンプライアンス状況</li>
              </ul>
            </ESGCategoryCard>
          </Link>
        </div>

        {/* システム効果 */}
        <Card className="mb-8 card-shadow">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-foreground flex items-center justify-center space-x-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span>システム効果</span>
            </CardTitle>
            <CardDescription>データ処理の効率化により実現する成果</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <ESGMetricDisplay
                label="工数削減"
                value="50"
                unit="%"
                category="environment"
                trend={{ direction: "up", value: "+15%" }}
              />
              <ESGMetricDisplay
                label="効率改善"
                value="80"
                unit="%"
                category="social"
                trend={{ direction: "up", value: "+25%" }}
              />
              <ESGMetricDisplay
                label="稼働率"
                value="99.9"
                unit="%"
                category="governance"
                trend={{ direction: "neutral", value: "安定" }}
              />
              <ESGMetricDisplay
                label="応答速度"
                value="500"
                unit="ms"
                category="environment"
                trend={{ direction: "down", value: "-100ms" }}
              />
            </div>
          </CardContent>
        </Card>

        {/* 概要 */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center space-x-2">
              <Shield className="h-5 w-5 text-accent" />
              <span>ESG Data Hub について</span>
            </CardTitle>
            <CardDescription>
              ISSB国内ガイドライン（2025年3月制定、2027年度義務化）に対応した
              次世代ESG情報管理プラットフォーム
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-3 text-primary flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>主な機能</span>
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <ESGIcon category="environment" size="sm" />
                    <span>データ統合ハブ</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <ESGIcon category="social" size="sm" />
                    <span>AIマッピング技術</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <ESGIcon category="governance" size="sm" />
                    <span>KPIチェッカー</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span>証跡ワークフロー</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-secondary" />
                    <span>データカタログ & API</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-secondary flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>対応規制・基準</span>
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <StatusBadge status="success" size="sm" showIcon={false}>ISSB</StatusBadge>
                    <span>国際サステナビリティ基準審議会</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <StatusBadge status="success" size="sm" showIcon={false}>CSRD</StatusBadge>
                    <span>企業サステナビリティ報告指令</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <StatusBadge status="warning" size="sm" showIcon={false}>TCFD</StatusBadge>
                    <span>気候関連財務情報開示</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <StatusBadge status="neutral" size="sm" showIcon={false}>GRI</StatusBadge>
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
