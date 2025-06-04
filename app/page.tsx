import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-green-50/30">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-green-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* ヘッダー */}
      <nav className="relative backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center animate-fade-in">
              <div className="flex items-center space-x-3">
                <div>
                  <h1 className="text-2xl font-bold gradient-text">ESG Data Hub</h1>
                  <p className="text-xs text-muted-foreground">データ統合プラットフォーム</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 animate-slide-up">
              <Link 
                href="/catalog"
                className="group bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 hover-lift shadow-lg flex items-center space-x-2"
              >
                <span className="text-lg">📚</span>
                <span className="font-medium">データカタログ</span>
              </Link>
              <Link 
                href="/kpi-requirements"
                className="group bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 hover-lift shadow-lg flex items-center space-x-2"
              >
                <span className="text-lg">🚨</span>
                <span className="font-medium">KPI監視</span>
              </Link>
              <Link 
                href="/dashboard"
                className="group bg-white/80 backdrop-blur-sm text-gray-700 hover:text-gray-900 px-6 py-3 rounded-xl hover:bg-white/90 transition-all duration-300 hover-lift shadow-lg border border-white/50 flex items-center space-x-2"
              >
                <span className="text-lg">📊</span>
                <span className="font-medium">ダッシュボード</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* ヒーローセクション */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-sm font-medium px-4 py-2 rounded-full mb-6 shadow-lg">
            <span className="mr-2">🌱</span>
            ISSB準拠・2027年度義務化対応
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            <span className="gradient-text">ESGデータ</span>を<br />
            <span className="text-gray-700">統合的に管理</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            持続可能性報告の義務化に向けて、データ収集から分析まで<br />
            効率的なワークフローを実現するプラットフォーム
          </p>
        </div>

        {/* 機能カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* データカタログ */}
          <Link href="/catalog" className="group animate-slide-up" style={{animationDelay: '0.1s'}}>
            <Card className="h-full hover-lift border-gray-200 shadow-lg group-hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-green-50/50 to-white">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
              <CardHeader className="relative">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">📚</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">最新</Badge>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">データカタログ</CardTitle>
                <CardDescription className="text-gray-600">
                  KPI・データソース・統計情報の一元管理
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    REST & GraphQL API
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    高速検索・フィルタリング
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    リアルタイム統計
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-green-600 group-hover:text-green-700 transition-colors">
                    詳細を見る →
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* KPI欠損アラート */}
          <Link href="/kpi-requirements" className="group animate-slide-up" style={{animationDelay: '0.2s'}}>
            <Card className="h-full hover-lift border-gray-200 shadow-lg group-hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-red-50/50 to-white">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent"></div>
              <CardHeader className="relative">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">🚨</span>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">重要</Badge>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">KPI監視システム</CardTitle>
                <CardDescription className="text-gray-600">
                  必須KPIの欠損を自動監視・通知
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    日次自動チェック
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Slack通知連携
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    期日管理・エスカレーション
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-red-600 group-hover:text-red-700 transition-colors">
                    設定を見る →
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* ダッシュボード */}
          <Link href="/dashboard" className="group animate-slide-up" style={{animationDelay: '0.3s'}}>
            <Card className="h-full hover-lift border-gray-200 shadow-lg group-hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-blue-50/50 to-white">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
              <CardHeader className="relative">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">効率化</Badge>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">ESGダッシュボード</CardTitle>
                <CardDescription className="text-gray-600">
                  ESGデータの可視化と分析
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    リアルタイム監視
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    対話的チャート
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    コンプライアンス状況
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                    開始する →
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 統計サマリー */}
        <Card className="mb-16 border-gray-200 shadow-lg animate-fade-in overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5"></div>
          <CardHeader className="relative text-center bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">システム効果</CardTitle>
            <CardDescription className="text-gray-600">データ処理の効率化により実現する成果</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="text-4xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform">50%</div>
                <div className="text-sm text-gray-600 font-medium">工数削減</div>
                <div className="text-xs text-gray-500 mt-1">データ収集作業</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform">80%</div>
                <div className="text-sm text-gray-600 font-medium">効率改善</div>
                <div className="text-xs text-gray-500 mt-1">マッピング処理</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">99.9%</div>
                <div className="text-sm text-gray-600 font-medium">稼働率</div>
                <div className="text-xs text-gray-500 mt-1">システム可用性</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform">500ms</div>
                <div className="text-sm text-gray-600 font-medium">応答速度</div>
                <div className="text-xs text-gray-500 mt-1">API レスポンス</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 将来実装 */}
        <Card className="mb-12 glass border-0 shadow-elegant animate-fade-in overflow-hidden opacity-75">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-orange-500/5"></div>
          <CardHeader className="relative">
            <div className="flex items-center space-x-4 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-orange-500 rounded-xl flex items-center justify-center shadow-soft">
                <span className="text-white text-xl">📋</span>
              </div>
              <Badge variant="outline" className="border-purple-200 text-purple-700">開発予定</Badge>
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">証跡管理システム</CardTitle>
            <CardDescription className="text-gray-600">
              ブロックチェーン技術による監査証跡とバージョン管理
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  イミュータブルな記録
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  完全な変更履歴追跡
                </div>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                  監査対応の自動化
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                  コンプライアンス検証
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 機能説明 */}
        <Card className="glass border-0 shadow-elegant animate-fade-in overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5"></div>
          <CardHeader className="relative">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">📈</span>
              <CardTitle className="text-2xl font-bold gradient-text">ESG Data Hub について</CardTitle>
            </div>
            <CardDescription className="text-gray-700 text-lg leading-relaxed">
              ISSB国内ガイドライン（2025年3月制定、2027年度義務化）に対応した<br />
              次世代ESG情報管理プラットフォーム
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">🎯</span>主な機能
                </h4>
                <div className="space-y-3">
                  {[
                    'データ統合ハブ',
                    'AIマッピング技術',
                    'KPIチェッカー',
                    '証跡ワークフロー',
                    'データカタログ & API'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-3"></div>
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">📊</span>対応規制・基準
                </h4>
                <div className="space-y-3">
                  {[
                    { name: 'ISSB', desc: '国際サステナビリティ基準審議会' },
                    { name: 'CSRD', desc: '企業サステナビリティ報告指令' },
                    { name: 'TCFD', desc: '気候関連財務情報開示' },
                    { name: 'GRI', desc: 'グローバル・レポーティング・イニシアチブ' }
                  ].map((standard, index) => (
                    <div key={index} className="flex items-start text-gray-700">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <span className="font-medium">{standard.name}</span>
                        <div className="text-sm text-gray-600">{standard.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
