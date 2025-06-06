import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, FileText, Download, Eye, Plus, Clock, CheckCircle, AlertTriangle, BarChart3, TrendingUp, Globe } from "lucide-react"
import { useState } from "react"

export default function ReportsPage() {
  const [date, setDate] = useState<Date>()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate and manage ESG compliance reports</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
        </div>
      </div>

      {/* Report Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+8 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">3 due this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regulatory Updates</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">New requirements</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>Create ESG compliance reports using predefined templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="issb-s1">ISSB S1 - Climate</SelectItem>
                <SelectItem value="issb-s2">ISSB S2 - Sustainability</SelectItem>
                <SelectItem value="csrd">CSRD Compliance</SelectItem>
                <SelectItem value="gri">GRI Standards</SelectItem>
                <SelectItem value="custom">Custom Report</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Reporting Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="q1-2024">Q1 2024</SelectItem>
                <SelectItem value="q2-2024">Q2 2024</SelectItem>
                <SelectItem value="q3-2024">Q3 2024</SelectItem>
                <SelectItem value="q4-2024">Q4 2024</SelectItem>
                <SelectItem value="fy-2024">FY 2024</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Due Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Reports</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4">
            {[
              {
                id: "RPT-2024-015",
                title: "Q4 2023 ISSB S1 Climate Disclosure",
                type: "ISSB S1",
                status: "Completed",
                generated: "2024-01-15",
                size: "2.3 MB",
                department: "Environmental",
                progress: 100
              },
              {
                id: "RPT-2024-014",
                title: "CSRD Article 8 Compliance Report",
                type: "CSRD",
                status: "Under Review",
                generated: "2024-01-14",
                size: "1.8 MB",
                department: "Compliance",
                progress: 85
              },
              {
                id: "RPT-2024-013",
                title: "GRI 2021 Standards Annual Report",
                type: "GRI",
                status: "Draft",
                generated: "2024-01-13",
                size: "3.1 MB",
                department: "Sustainability",
                progress: 60
              },
              {
                id: "RPT-2024-012",
                title: "Social Impact Assessment Q4",
                type: "Custom",
                status: "Completed",
                generated: "2024-01-12",
                size: "1.5 MB",
                department: "Social",
                progress: 100
              },
              {
                id: "RPT-2024-011",
                title: "Governance Metrics Dashboard",
                type: "Custom",
                status: "Processing",
                generated: "2024-01-11",
                size: "0.9 MB",
                department: "Governance",
                progress: 30
              }
            ].map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <FileText className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{report.title}</h3>
                          <Badge variant={
                            report.status === "Completed" ? "default" :
                            report.status === "Under Review" ? "secondary" :
                            report.status === "Draft" ? "outline" : "destructive"
                          }>
                            {report.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{report.type}</span>
                          <span>•</span>
                          <span>{report.department}</span>
                          <span>•</span>
                          <span>{report.generated}</span>
                          <span>•</span>
                          <span>{report.size}</span>
                        </div>
                        {report.status === "Processing" || report.status === "Draft" ? (
                          <div className="mt-2">
                            <Progress value={report.progress} className="w-32" />
                            <p className="text-xs text-muted-foreground mt-1">{report.progress}% complete</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {report.status === "Completed" && (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  ISSB Standards
                </CardTitle>
                <CardDescription>International Sustainability Standards Board</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>S1 - General Requirements</span>
                    <Badge variant="default">Complete</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>S2 - Climate Disclosures</span>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                  <Progress value={85} />
                  <p className="text-sm text-muted-foreground">Next review: March 31, 2024</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  CSRD Compliance
                </CardTitle>
                <CardDescription>Corporate Sustainability Reporting Directive</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Article 8 Requirements</span>
                    <Badge variant="default">Complete</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Double Materiality</span>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                  <Progress value={70} />
                  <p className="text-sm text-muted-foreground">Next review: April 15, 2024</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  GRI Standards
                </CardTitle>
                <CardDescription>Global Reporting Initiative</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>GRI 2021 Universal</span>
                    <Badge variant="default">Complete</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Topic Standards</span>
                    <Badge variant="default">Complete</Badge>
                  </div>
                  <Progress value={95} />
                  <p className="text-sm text-muted-foreground">Next review: June 30, 2024</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "ISSB S1 Template",
                description: "Standard template for ISSB S1 General Requirements for Disclosure of Sustainability-related Financial Information",
                usage: 45,
                lastUpdated: "2024-01-10"
              },
              {
                name: "CSRD Article 8",
                description: "Template for Corporate Sustainability Reporting Directive Article 8 compliance",
                usage: 32,
                lastUpdated: "2024-01-08"
              },
              {
                name: "GRI 2021 Universal",
                description: "Comprehensive template for GRI 2021 Universal Standards reporting",
                usage: 28,
                lastUpdated: "2024-01-05"
              },
              {
                name: "Climate Risk Assessment",
                description: "Specialized template for climate-related financial risk assessments",
                usage: 21,
                lastUpdated: "2024-01-03"
              },
              {
                name: "Social Impact Report",
                description: "Template for social sustainability and impact measurement reporting",
                usage: 19,
                lastUpdated: "2023-12-28"
              },
              {
                name: "Governance Metrics",
                description: "Template for corporate governance and board composition reporting",
                usage: 15,
                lastUpdated: "2023-12-25"
              }
            ].map((template, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Usage this month</span>
                      <span className="font-medium">{template.usage} reports</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last updated</span>
                      <span className="text-muted-foreground">{template.lastUpdated}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">Use Template</Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reporting Trends</CardTitle>
                <CardDescription>Monthly report generation over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>January 2024</span>
                    <span className="font-medium">23 reports</span>
                  </div>
                  <Progress value={85} />
                  <div className="flex items-center justify-between">
                    <span>December 2023</span>
                    <span className="font-medium">19 reports</span>
                  </div>
                  <Progress value={70} />
                  <div className="flex items-center justify-between">
                    <span>November 2023</span>
                    <span className="font-medium">16 reports</span>
                  </div>
                  <Progress value={60} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Score</CardTitle>
                <CardDescription>Overall compliance across all frameworks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>ISSB Standards</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <Progress value={92} />
                  <div className="flex items-center justify-between">
                    <span>CSRD Requirements</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <Progress value={87} />
                  <div className="flex items-center justify-between">
                    <span>GRI Standards</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <Progress value={95} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Report completion rates by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Environmental</span>
                    <span className="font-medium">98%</span>
                  </div>
                  <Progress value={98} />
                  <div className="flex items-center justify-between">
                    <span>Social</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <Progress value={94} />
                  <div className="flex items-center justify-between">
                    <span>Governance</span>
                    <span className="font-medium">91%</span>
                  </div>
                  <Progress value={91} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Critical reporting deadlines approaching</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { report: "CSRD Q1 2024", deadline: "2024-04-30", days: 45 },
                    { report: "ISSB S2 Annual", deadline: "2024-05-15", days: 60 },
                    { report: "GRI Annual Report", deadline: "2024-06-30", days: 106 }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.report}</p>
                        <p className="text-sm text-muted-foreground">{item.deadline}</p>
                      </div>
                      <Badge variant="outline">{item.days} days</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 