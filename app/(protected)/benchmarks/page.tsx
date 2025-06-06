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
          <h1 className="text-3xl font-bold">Benchmarks</h1>
          <p className="text-muted-foreground">Compare your ESG performance against industry peers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button>
            <Target className="h-4 w-4 mr-2" />
            Set Targets
          </Button>
        </div>
      </div>

      {/* Industry Comparison Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall ESG Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+5 vs industry avg (73)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industry Rank</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12th</div>
            <p className="text-xs text-muted-foreground">out of 156 companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Percentile</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92nd</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">Top 10%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement Areas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Key areas identified</p>
          </CardContent>
        </Card>
      </div>

      {/* Benchmark Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Benchmark Settings</CardTitle>
          <CardDescription>Configure comparison parameters and peer groups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="financial">Financial Services</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="energy">Energy</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Company Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="large-cap">Large Cap (>$10B)</SelectItem>
                <SelectItem value="mid-cap">Mid Cap ($2-10B)</SelectItem>
                <SelectItem value="small-cap">Small Cap (<$2B)</SelectItem>
                <SelectItem value="all">All Sizes</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Geography" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="apac">Asia Pacific</SelectItem>
                <SelectItem value="americas">Americas</SelectItem>
                <SelectItem value="emea">EMEA</SelectItem>
                <SelectItem value="japan">Japan</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest Year</SelectItem>
                <SelectItem value="3yr">3 Year Average</SelectItem>
                <SelectItem value="5yr">5 Year Trend</SelectItem>
                <SelectItem value="custom">Custom Period</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Benchmark Analysis Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="peers">Peer Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ESG Score Breakdown</CardTitle>
                <CardDescription>Performance across all ESG dimensions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-green-500" />
                        <span>Environmental</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">82</span>
                        <Badge variant="default">Above Avg</Badge>
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
                        <span>Social</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">75</span>
                        <Badge variant="secondary">Average</Badge>
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
                        <span>Governance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">76</span>
                        <Badge variant="outline">Below Avg</Badge>
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
                <CardTitle>Industry Position</CardTitle>
                <CardDescription>Your position within the manufacturing sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">Top 8%</div>
                    <p className="text-sm text-muted-foreground">Manufacturing Industry</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Industry Leader</span>
                      <span className="text-sm font-medium">95 (Top 1%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Top Quartile</span>
                      <span className="text-sm font-medium">87 (Top 25%)</span>
                    </div>
                    <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                      <span className="text-sm font-medium">Your Score</span>
                      <span className="text-sm font-bold">78 (Top 8%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Industry Average</span>
                      <span className="text-sm font-medium">73 (50th %ile)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bottom Quartile</span>
                      <span className="text-sm font-medium">58 (Bottom 25%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>ESG score evolution over the past 5 years</CardDescription>
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
                <CardTitle>Carbon Emissions</CardTitle>
                <CardDescription>Scope 1, 2, and 3 emissions comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "Scope 1 Emissions", value: "1,247 tCO2e", benchmark: "1,450 tCO2e", status: "better" },
                    { metric: "Scope 2 Emissions", value: "2,835 tCO2e", benchmark: "2,920 tCO2e", status: "better" },
                    { metric: "Scope 3 Emissions", value: "15,420 tCO2e", benchmark: "14,200 tCO2e", status: "worse" }
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
                            {item.status === "better" ? "Better" : "Needs Improvement"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Your: {item.value} | Industry Avg: {item.benchmark}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Efficiency</CardTitle>
                <CardDescription>Energy and water usage metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "Energy Intensity", value: "2.3 MWh/unit", benchmark: "2.8 MWh/unit", status: "better" },
                    { metric: "Water Usage", value: "450 m³/unit", benchmark: "520 m³/unit", status: "better" },
                    { metric: "Waste Generation", value: "12 kg/unit", benchmark: "9.5 kg/unit", status: "worse" }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.metric}</span>
                        <Badge variant={item.status === "better" ? "default" : "destructive"}>
                          {item.status === "better" ? "Better" : "Needs Improvement"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Your: {item.value} | Industry Avg: {item.benchmark}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Environmental Targets</CardTitle>
              <CardDescription>Progress towards science-based targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { target: "Net Zero by 2050", progress: 35, current: "35% reduction", goal: "100% reduction" },
                  { target: "50% Renewable Energy", progress: 78, current: "78% renewable", goal: "50% target" },
                  { target: "30% Waste Reduction", progress: 60, current: "18% reduction", goal: "30% target" }
                ].map((item, index) => (
                  <div key={index} className="space-y-3">
                    <div>
                      <h4 className="font-medium">{item.target}</h4>
                      <p className="text-sm text-muted-foreground">{item.current}</p>
                    </div>
                    <Progress value={item.progress} />
                    <p className="text-xs text-muted-foreground">{item.progress}% of {item.goal}</p>
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
                <CardTitle>Workforce Diversity</CardTitle>
                <CardDescription>Diversity metrics vs industry benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "Women in Leadership", value: "42%", benchmark: "35%", status: "better" },
                    { metric: "Ethnic Minority Representation", value: "28%", benchmark: "32%", status: "worse" },
                    { metric: "Pay Equity Ratio", value: "0.97", benchmark: "0.94", status: "better" }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.metric}</span>
                        <Badge variant={item.status === "better" ? "default" : "destructive"}>
                          {item.status === "better" ? "Above Average" : "Below Average"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Your: {item.value} | Industry Avg: {item.benchmark}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employee Wellbeing</CardTitle>
                <CardDescription>Health and safety performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "Employee Satisfaction", value: "8.2/10", benchmark: "7.8/10", status: "better" },
                    { metric: "Safety Incidents", value: "0.8 per 100k hours", benchmark: "1.2 per 100k hours", status: "better" },
                    { metric: "Training Hours per Employee", value: "42 hours", benchmark: "38 hours", status: "better" }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.metric}</span>
                        <Badge variant={item.status === "better" ? "default" : "destructive"}>
                          {item.status === "better" ? "Above Average" : "Below Average"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Your: {item.value} | Industry Avg: {item.benchmark}
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
                <CardTitle>Board Composition</CardTitle>
                <CardDescription>Board structure and independence metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "Board Independence", value: "67%", benchmark: "72%", status: "worse" },
                    { metric: "Women on Board", value: "33%", benchmark: "28%", status: "better" },
                    { metric: "Average Tenure", value: "4.2 years", benchmark: "5.1 years", status: "better" }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.metric}</span>
                        <Badge variant={item.status === "better" ? "default" : "destructive"}>
                          {item.status === "better" ? "Above Average" : "Below Average"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Your: {item.value} | Industry Avg: {item.benchmark}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Management</CardTitle>
                <CardDescription>Risk oversight and compliance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "ESG Risk Score", value: "Low (15)", benchmark: "Medium (28)", status: "better" },
                    { metric: "Compliance Violations", value: "0", benchmark: "0.3", status: "better" },
                    { metric: "Audit Committee Independence", value: "100%", benchmark: "95%", status: "better" }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.metric}</span>
                        <Badge variant={item.status === "better" ? "default" : "destructive"}>
                          {item.status === "better" ? "Above Average" : "Below Average"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Your: {item.value} | Industry Avg: {item.benchmark}
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
              <CardTitle>Peer Companies</CardTitle>
              <CardDescription>Direct comparison with similar companies in your industry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { company: "Your Company", score: 78, rank: 12, trend: "up" },
                  { company: "Company A", score: 82, rank: 8, trend: "up" },
                  { company: "Company B", score: 81, rank: 9, trend: "down" },
                  { company: "Company C", score: 79, rank: 10, trend: "up" },
                  { company: "Company D", score: 77, rank: 15, trend: "stable" },
                  { company: "Company E", score: 76, rank: 18, trend: "up" }
                ].map((peer, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${peer.company === "Your Company" ? "bg-blue-50 border-blue-200" : ""}`}>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold w-8">{peer.rank}</div>
                      <div>
                        <h4 className={`font-medium ${peer.company === "Your Company" ? "font-bold" : ""}`}>
                          {peer.company}
                        </h4>
                        <p className="text-sm text-muted-foreground">Manufacturing Sector</p>
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
                          <span className="text-xs text-muted-foreground capitalize">{peer.trend}</span>
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