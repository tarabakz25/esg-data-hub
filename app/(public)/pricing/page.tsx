import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, Zap, Star } from "lucide-react"

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      description: "小規模企業向け",
      price: "¥98,000",
      period: "/月",
      badge: null,
      features: [
        "データソース 3つまで",
        "月間データ取込 10GB",
        "基本レポート",
        "メールサポート",
        "2ユーザーまで",
        "基本監査ログ"
      ],
      cta: "無料トライアル開始",
      ctaVariant: "outline" as const
    },
    {
      name: "Professional",
      description: "中規模企業向け",
      price: "¥298,000",
      period: "/月",
      badge: "人気",
      features: [
        "データソース 無制限",
        "月間データ取込 100GB",
        "AI自動マッピング",
        "カスタムレポート",
        "電話・チャットサポート",
        "10ユーザーまで",
        "完全監査証跡",
        "API アクセス",
        "Slack連携"
      ],
      cta: "無料トライアル開始",
      ctaVariant: "default" as const
    },
    {
      name: "Enterprise",
      description: "大企業・グループ企業向け",
      price: "お問い合わせ",
      period: "",
      badge: "推奨",
      features: [
        "Professional の全機能",
        "無制限データ取込",
        "専任カスタマーサクセス",
        "SLA 99.9% 保証",
        "無制限ユーザー",
        "SSO/SAML対応",
        "オンプレミス対応",
        "カスタム開発",
        "24/7 優先サポート"
      ],
      cta: "お問い合わせ",
      ctaVariant: "secondary" as const
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            シンプルで透明性のある料金体系
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            企業規模に応じて選べるプラン。すべてのプランで30日間無料トライアル付き。
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>クレジットカード不要</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>30日間無料</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>いつでもキャンセル可能</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  plan.badge === "人気" ? "border-2 border-blue-200 scale-105" : 
                  plan.badge === "推奨" ? "border-2 border-green-200" : "border border-gray-200"
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-0 right-0">
                    <Badge 
                      className={`rounded-none rounded-bl-lg ${
                        plan.badge === "人気" ? "bg-blue-500" : "bg-green-500"
                      } text-white`}
                    >
                      {plan.badge === "人気" ? <Star className="w-3 h-3 mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.name === "Enterprise" ? "#contact" : "/signup"}>
                    <Button 
                      className={`w-full ${
                        plan.ctaVariant === "default" 
                          ? "bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600" 
                          : ""
                      }`}
                      variant={plan.ctaVariant}
                      size="lg"
                    >
                      {plan.cta}
                      {plan.name !== "Enterprise" && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              よくある質問
            </h2>
            <p className="text-xl text-gray-600">
              料金やプランについてのご質問にお答えします
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-3">無料トライアルでは何ができますか？</h3>
              <p className="text-gray-600">
                選択したプランの全機能を30日間無料でお試しいただけます。クレジットカードの登録は不要です。
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-3">プランの変更は可能ですか？</h3>
              <p className="text-gray-600">
                はい、いつでもプランのアップグレード・ダウングレードが可能です。料金は日割り計算されます。
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-3">データの移行サポートはありますか？</h3>
              <p className="text-gray-600">
                Professional以上のプランでは、既存システムからのデータ移行をサポートいたします。
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-3">セキュリティ対策は万全ですか？</h3>
              <p className="text-gray-600">
                SOC2 Type2準拠、ISO27001認証取得済み。企業の重要データを安全に保護します。
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            今すぐESGデータ管理を始めませんか？
          </h2>
          <p className="text-xl mb-8 opacity-90">
            30日間の無料トライアルで、ESG Data Hubの効果を実感してください。
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
                ログイン
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 