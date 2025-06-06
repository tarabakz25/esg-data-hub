import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  CheckCircle, 
  BarChart3, 
  Database, 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  TrendingUp,
  FileCheck,
  Clock,
  Sparkles
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              <Sparkles className="w-3 h-3 mr-1" />
              ISSB準拠・監査法人推奨
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              ESGデータ統合を
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                3週間で
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              データ収集から分析、報告まで。ISSB対応のESGデータプラットフォームで
              持続可能性報告の義務化に備えませんか？
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600 shadow-lg text-lg px-8 py-4">
                  無料トライアル開始
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/signin">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                  ログイン
                </Button>
              </Link>
            </div>
            
            {/* Social Proof */}
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">ISSB準拠</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">監査法人推奨</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">SOC2 Type2準拠</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              3ステップでESGデータ管理を完全自動化
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              データ収集、自動マッピング、監査証跡まで。これまで数ヶ月かかっていた作業を3週間に短縮。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Step 1 */}
            <Card className="relative overflow-hidden border-2 border-blue-100 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">1. データ取込</CardTitle>
                <CardDescription>
                  CSV、API、システム連携で既存データを簡単統合
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    ドラッグ&ドロップアップロード
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    API自動連携
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    スケジュール取込
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="relative overflow-hidden border-2 border-green-100 hover:border-green-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">2. AI自動マッピング</CardTitle>
                <CardDescription>
                  LLM搭載で意味理解とISS​B指標への自動分類
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    LLM意味推論
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    ISSB自動分類
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    品質チェック
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="relative overflow-hidden border-2 border-purple-100 hover:border-purple-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">3. 監査証跡</CardTitle>
                <CardDescription>
                  完全な変更履歴とバージョン管理で監査対応完璧
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    完全監査ログ
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    差分比較機能
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    コメント管理
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              導入企業が実感する成果
            </h2>
            <p className="text-xl text-gray-600">
              ESG Data Hubで実現したデータ処理効率化の実績
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">80%</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">工数削減</div>
              <div className="text-sm text-gray-600">データ処理時間短縮</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">3週間</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">導入期間</div>
              <div className="text-sm text-gray-600">従来の1/4の期間</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">稼働率</div>
              <div className="text-sm text-gray-600">高可用性保証</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">500+</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">企業導入</div>
              <div className="text-sm text-gray-600">上場企業中心</div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              完全なコンプライアンス対応
            </h2>
            <p className="text-xl text-gray-600">
              国際基準・監査法人要件に完全準拠した安心のプラットフォーム
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <FileCheck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">ISSB準拠</h3>
              <p className="text-sm text-gray-600">国際サステナビリティ基準審議会の要件を完全満たし</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">SOC2 Type2</h3>
              <p className="text-sm text-gray-600">セキュリティ・可用性・処理の整合性を第三者認証</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">CSRD対応</h3>
              <p className="text-sm text-gray-600">EU企業サステナビリティ報告指令に対応</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">監査法人推奨</h3>
              <p className="text-sm text-gray-600">Big4監査法人での採用実績と推奨</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ESGデータ管理を今すぐ効率化
          </h2>
          <p className="text-xl mb-8 opacity-90">
            2027年度ISSB義務化まであと3年。<br/>
            今始めれば、余裕を持った準備ができます。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-4">
                無料トライアル開始
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/signin">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                既存アカウントでログイン
              </Button>
            </Link>
          </div>
          <p className="text-sm mt-6 opacity-75">
            クレジットカード不要 • 30日間無料 • いつでもキャンセル可能
          </p>
        </div>
      </section>
    </div>
  )
} 