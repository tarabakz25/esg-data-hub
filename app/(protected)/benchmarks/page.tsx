import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Search, Filter, TrendingUp, TrendingDown, Target, Award, BarChart3, Globe, Users, Leaf } from "lucide-react"

export default function BenchmarksPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ベンチマーク</h1>
          <p className="text-muted-foreground">業界の同業他社とESGパフォーマンスを比較</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            フィルター
          </Button>
          <Button>
            <Target className="h-4 w-4 mr-2" />
            目標設定
          </Button>
        </div>
      </div>

      {/* Industry Comparison Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総合ESGスコア</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">業界平均より+5 (73)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">業界ランキング</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12位</div>
            <p className="text-xs text-muted-foreground">156社中</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">パーセンタイル</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92位</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">上位10%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">改善領域</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">主要領域を特定</p>
          </CardContent>
        </Card>
      </div>

      {/* Benchmark Filters */}
      <Card>
        <CardHeader>
          <CardTitle>ベンチマーク設定</CardTitle>
          <CardDescription>比較パラメータと同業他社グループの設定</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="業界" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manufacturing">製造業</SelectItem>
                <SelectItem value="technology">テクノロジー</SelectItem>
                <SelectItem value="financial">金融サービス</SelectItem>
                <SelectItem value="healthcare">ヘルスケア</SelectItem>
                <SelectItem value="energy">エネルギー</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="企業規模" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="large-cap">大型株（100億ドル以上）</SelectItem>
                <SelectItem value="mid-cap">中型株（20-100億ドル）</SelectItem>
                <SelectItem value="small-cap">小型株（20億ドル未満）</SelectItem>
                <SelectItem value="all">全規模</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="地域" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">グローバル</SelectItem>
                <SelectItem value="apac">アジア太平洋</SelectItem>
                <SelectItem value="americas">南北アメリカ</SelectItem>
                <SelectItem value="emea">EMEA</SelectItem>
                <SelectItem value="japan">日本</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="期間" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">最新年度</SelectItem>
                <SelectItem value="3yr">3年平均</SelectItem>
                <SelectItem value="5yr">5年トレンド</SelectItem>
                <SelectItem value="custom">カスタム期間</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Benchmark Analysis Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="environmental">環境</TabsTrigger>
          <TabsTrigger value="social">社会</TabsTrigger>
          <TabsTrigger value="governance">ガバナンス</TabsTrigger>
          <TabsTrigger value="peers">同業他社分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ESGスコア内訳</CardTitle>
                <CardDescription>全ESG分野でのパフォーマンス</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-green-500" />
                        <span>環境</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">82</span>
                        <Badge variant="default">平均以上</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={82} className="flex-1" />
                      <span className="text-sm text-muted-foreground w-12">82/100</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span>社会</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">75</span>
                        <Badge variant="secondary">平均</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={75} className="flex-1" />
                      <span className="text-sm text-muted-foreground w-12">75/100</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-purple-500" />
                        <span>ガバナンス</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">76</span>
                        <Badge variant="outline">平均以下</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={76} className="flex-1" />
                      <span className="text-sm text-muted-foreground w-12">76/100</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>業界内ポジション</CardTitle>
                <CardDescription>製造業セクター内での位置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">上位8%</div>
                    <p className="text-sm text-muted-foreground">製造業界</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">業界リーダー</span>
                      <span className="text-sm font-medium">95 (上位1%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">上位四分位</span>
                      <span className="text-sm font-medium">87 (上位25%)</span>
                    </div>
                    <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                      <span className="text-sm font-medium">あなたのスコア</span>
                      <span className="text-sm font-bold">78 (上位8%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">業界平均</span>
                      <span className="text-sm font-medium">73 (50パーセンタイル)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">下位四分位</span>
                      <span className="text-sm font-medium">58 (下位25%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>パフォーマンストレンド</CardTitle>
              <CardDescription>過去5年間のESGスコア推移</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { year: "2019", score: 68, change: null },
                  { year: "2020", score: 71, change: "+3" },
                  { year: "2021", score: 73, change: "+2" },
                  { year: "2022", score: 75, change: "+2" },
                  { year: "2023", score: 78, change: "+3" }
                ].map((data, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-bold">{data.score}</div>
                    <div className="text-sm text-muted-foreground">{data.year}</div>
                    {data.change && (
                      <div className="text-xs text-green-500 font-medium">{data.change}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environmental" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>炭素排出量</CardTitle>
                <CardDescription>スコープ1、2、3排出量の比較</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "スコープ1排出量", value: "1,247 tCO2e", benchmark: "1,450 tCO2e", status: "better" },
                    { metric: "スコープ2排出量", value: "2,835 tCO2e", benchmark: "2,920 tCO2e", status: "better" },
                    { metric: "スコープ3排出量", value: "15,420 tCO2e", benchmark: "14,200 tCO2e", status: "worse" }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.metric}</span>
                        <div className="flex items-center gap-2">
                          {item.status === "better" ? (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          )}
                          <Badge variant={item.status === "better" ? "default" : "destructive"}>
                            {item.status === "better" ? "良好" : "改善が必要"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        あなた: {item.value} | 業界平均: {item.benchmark}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>資源効率</CardTitle>
                <CardDescription>エネルギーと水使用量の指標</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "エネルギー原単位", value: "2.3 MWh/単位", benchmark: "2.8 MWh/単位", status: "better" },
                    { metric: "水使用量", value: "450 m³/単位", benchmark: "520 m³/単位", status: "better" },
                    { metric: "廃棄物発生量", value: "12 kg/単位", benchmark: "9.5 kg/単位", status: "worse" }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.metric}</span>
                        <Badge variant={item.status === "better" ? "default" : "destructive"}>
                          {item.status === "better" ? "良好" : "改善が必要"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        あなた: {item.value} | 業界平均: {item.benchmark}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>環境目標</CardTitle>
              <CardDescription>科学的根拠に基づく目標への進捗</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { target: "2050年ネットゼロ", progress: 35, current: "35%削減", goal: "100%削減" },
                  { target: "再生可能エネルギー50%", progress: 78, current: "78%再生可能", goal: "50%目標" },
                  { target: "廃棄物30%削減", progress: 60, current: "18%削減", goal: "30%目標" }
                ].map((item, index) => (
                  <div key={index} className="space-y-3">
                    <div>
                      <h4 className="font-medium">{item.target}</h4>
                      <p className="text-sm text-muted-foreground">{item.current}</p>
                    </div>
                    <Progress value={item.progress} />
                    <p className="text-xs text-muted-foreground">{item.goal}の{item.progress}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>労働力の多様性</CardTitle>
                <CardDescription>業界ベンチマークとの多様性指標比較</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "女性リーダーシップ", value: "42%", benchmark: "35%", status: "better" },
                    { metric: "少数民族代表", value: "28%", benchmark: "32%", status: "worse" },
                    { metric: "賃金公平比率", value: "0.97", benchmark: "0.94", status: "better" }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.metric}</span>
                        <Badge variant={item.status === "better" ? "default" : "destructive"}>
                          {item.status === "better" ? "平均以上" : "平均以下"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        あなた: {item.value} | 業界平均: {item.benchmark}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>従業員ウェルビーイング</CardTitle>
                <CardDescription>健康と安全のパフォーマンス指標</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "従業員満足度", value: "8.2/10", benchmark: "7.8/10", status: "better" },
                    { metric: "安全事故", value: "10万時間あたり0.8件", benchmark: "10万時間あたり1.2件", status: "better" },
                    { metric: "従業員1人あたり研修時間", value: "42時間", benchmark: "38時間", status: "better" }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.metric}</span>
                        <Badge variant={item.status === "better" ? "default" : "destructive"}>
                          {item.status === "better" ? "平均以上" : "平均以下"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        あなた: {item.value} | 業界平均: {item.benchmark}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="governance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>取締役会構成</CardTitle>
                <CardDescription>取締役会構造と独立性指標</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "取締役会独立性", value: "67%", benchmark: "72%", status: "worse" },
                    { metric: "女性取締役", value: "33%", benchmark: "28%", status: "better" },
                    { metric: "平均在任期間", value: "4.2年", benchmark: "5.1年", status: "better" }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.metric}</span>
                        <Badge variant={item.status === "better" ? "default" : "destructive"}>
                          {item.status === "better" ? "平均以上" : "平均以下"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        あなた: {item.value} | 業界平均: {item.benchmark}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>リスク管理</CardTitle>
                <CardDescription>リスク監督とコンプライアンス指標</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "ESGリスクスコア", value: "低 (15)", benchmark: "中 (28)", status: "better" },
                    { metric: "コンプライアンス違反", value: "0", benchmark: "0.3", status: "better" },
                    { metric: "監査委員会独立性", value: "100%", benchmark: "95%", status: "better" }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.metric}</span>
                        <Badge variant={item.status === "better" ? "default" : "destructive"}>
                          {item.status === "better" ? "平均以上" : "平均以下"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        あなた: {item.value} | 業界平均: {item.benchmark}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="peers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>同業他社</CardTitle>
              <CardDescription>業界内の類似企業との直接比較</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { company: "あなたの会社", score: 78, rank: 12, trend: "up" },
                  { company: "A社", score: 82, rank: 8, trend: "up" },
                  { company: "B社", score: 81, rank: 9, trend: "down" },
                  { company: "C社", score: 79, rank: 10, trend: "up" },
                  { company: "D社", score: 77, rank: 15, trend: "stable" },
                  { company: "E社", score: 76, rank: 18, trend: "up" }
                ].map((peer, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${peer.company === "あなたの会社" ? "bg-blue-50 border-blue-200" : ""}`}>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold w-8">{peer.rank}</div>
                      <div>
                        <h4 className={`font-medium ${peer.company === "あなたの会社" ? "font-bold" : ""}`}>
                          {peer.company}
                        </h4>
                        <p className="text-sm text-muted-foreground">製造業セクター</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold">{peer.score}</div>
                        <div className="flex items-center gap-1">
                          {peer.trend === "up" ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : peer.trend === "down" ? (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          ) : (
                            <div className="h-3 w-3" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {peer.trend === "up" ? "上昇" : peer.trend === "down" ? "下降" : "安定"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 