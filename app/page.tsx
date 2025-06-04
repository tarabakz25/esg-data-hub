import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-black">ESG Data Hub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/catalog"
                className="bg-blue-600 text-black px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                データカタログ
              </Link>
              <Link 
                href="/kpi-requirements"
                className="bg-red-600 text-black px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                KPI監視
              </Link>
              <Link 
                href="/dashboard"
                className="bg-gray-600 text-black px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                ダッシュボード
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto py-8 px-4">
        {/* タイトル */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            ESGデータ統合プラットフォーム
          </h2>
          <p className="text-lg text-black">
            持続可能性報告の義務化に向けて、データ収集から分析まで効率的に管理
          </p>
        </div>

        {/* 機能カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* データカタログ */}
          <Link href="/catalog">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg text-black">データカタログ</CardTitle>
                <CardDescription className="text-black">
                  KPI・データソース・統計情報の一元管理
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-black">
                  <li>• REST & GraphQL API</li>
                  <li>• 高速検索・フィルタリング</li>
                  <li>• リアルタイム統計</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* KPI監視 */}
          <Link href="/kpi-requirements">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg text-black">KPI監視システム</CardTitle>
                <CardDescription className="text-black">
                  必須KPIの欠損を自動監視・通知
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-black">
                  <li>• 日次自動チェック</li>
                  <li>• Slack通知連携</li>
                  <li>• 期日管理・エスカレーション</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* ダッシュボード */}
          <Link href="/dashboard">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg text-black">ESGダッシュボード</CardTitle>
                <CardDescription className="text-black">
                  ESGデータの可視化と分析
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-black">
                  <li>• リアルタイム監視</li>
                  <li>• 対話的チャート</li>
                  <li>• コンプライアンス状況</li>
                </ul>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* システム効果 */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-black">システム効果</CardTitle>
            <CardDescription className="text-black">データ処理の効率化により実現する成果</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-1">50%</div>
                <div className="text-sm text-black">工数削減</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-1">80%</div>
                <div className="text-sm text-black">効率改善</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-1">99.9%</div>
                <div className="text-sm text-black">稼働率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-1">500ms</div>
                <div className="text-sm text-black">応答速度</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 概要 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-black">ESG Data Hub について</CardTitle>
            <CardDescription className="text-black">
              ISSB国内ガイドライン（2025年3月制定、2027年度義務化）に対応した
              次世代ESG情報管理プラットフォーム
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-3 text-black">主な機能</h4>
                <ul className="space-y-2 text-sm text-black">
                  <li>• データ統合ハブ</li>
                  <li>• AIマッピング技術</li>
                  <li>• KPIチェッカー</li>
                  <li>• 証跡ワークフロー</li>
                  <li>• データカタログ & API</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-black">対応規制・基準</h4>
                <ul className="space-y-2 text-sm text-black">
                  <li>• ISSB - 国際サステナビリティ基準審議会</li>
                  <li>• CSRD - 企業サステナビリティ報告指令</li>
                  <li>• TCFD - 気候関連財務情報開示</li>
                  <li>• GRI - グローバル・レポーティング・イニシアチブ</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
