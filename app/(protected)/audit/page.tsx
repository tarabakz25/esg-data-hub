import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Download, Eye, AlertTriangle, CheckCircle, Clock, Users, Database, Settings } from "lucide-react"

export default function AuditPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground">Comprehensive logging and compliance tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Audit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audit Entries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,487</div>
            <p className="text-xs text-muted-foreground">+234 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">+3 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Changes</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,847</div>
            <p className="text-xs text-muted-foreground">+127 today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Activities</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,623</div>
            <p className="text-xs text-muted-foreground">+89 this hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Search</CardTitle>
          <CardDescription>Search and filter audit trail entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input placeholder="Search audit logs..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="data-change">Data Changes</SelectItem>
                <SelectItem value="user-login">User Login</SelectItem>
                <SelectItem value="security">Security Events</SelectItem>
                <SelectItem value="system">System Events</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Tabs */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="data">Data Changes</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Entries</CardTitle>
              <CardDescription>Latest system activities and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: "AUD-2024-001",
                    timestamp: "2024-01-15 14:30:25",
                    user: "john.doe@company.com",
                    action: "Data Upload",
                    resource: "Q4 2023 Energy Consumption Data",
                    status: "success",
                    details: "Uploaded 1,247 records to Environmental KPIs"
                  },
                  {
                    id: "AUD-2024-002",
                    timestamp: "2024-01-15 14:25:18",
                    user: "sarah.wilson@company.com",
                    action: "KPI Mapping",
                    resource: "Scope 2 Emissions Mapping",
                    status: "success",
                    details: "Mapped 15 data points to ISSB standards"
                  },
                  {
                    id: "AUD-2024-003",
                    timestamp: "2024-01-15 14:20:45",
                    user: "mike.chen@company.com",
                    action: "User Login",
                    resource: "Dashboard Access",
                    status: "success",
                    details: "Successful login from 192.168.1.45"
                  },
                  {
                    id: "AUD-2024-004",
                    timestamp: "2024-01-15 14:15:12",
                    user: "system",
                    action: "Automated Check",
                    resource: "KPI Completeness Validation",
                    status: "warning",
                    details: "Missing data detected for 3 required KPIs"
                  },
                  {
                    id: "AUD-2024-005",
                    timestamp: "2024-01-15 14:10:33",
                    user: "admin@company.com",
                    action: "Role Assignment",
                    resource: "User Permissions",
                    status: "success",
                    details: "Assigned Editor role to new user"
                  }
                ].map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {entry.status === "success" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : entry.status === "warning" ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{entry.action}</p>
                          <Badge variant={entry.status === "success" ? "default" : entry.status === "warning" ? "secondary" : "outline"}>
                            {entry.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{entry.details}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{entry.timestamp}</span>
                          <span>•</span>
                          <span>{entry.user}</span>
                          <span>•</span>
                          <span>{entry.id}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Failed Login Attempts</CardTitle>
                <CardDescription>Recent unsuccessful authentication attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { ip: "203.0.113.42", attempts: 5, timestamp: "2024-01-15 13:45:22" },
                    { ip: "198.51.100.15", attempts: 3, timestamp: "2024-01-15 12:30:18" },
                    { ip: "192.0.2.8", attempts: 7, timestamp: "2024-01-15 11:15:45" }
                  ].map((attempt, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium">{attempt.ip}</p>
                        <p className="text-sm text-muted-foreground">{attempt.timestamp}</p>
                      </div>
                      <Badge variant="destructive">{attempt.attempts} attempts</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permission Changes</CardTitle>
                <CardDescription>Recent role and permission modifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { user: "jane.smith@company.com", change: "Promoted to Editor", timestamp: "2024-01-15 10:30:00" },
                    { user: "bob.johnson@company.com", change: "Department changed to Finance", timestamp: "2024-01-14 16:45:12" },
                    { user: "alice.brown@company.com", change: "Access revoked", timestamp: "2024-01-14 09:20:33" }
                  ].map((change, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">{change.user}</p>
                        <p className="text-sm text-muted-foreground">{change.timestamp}</p>
                      </div>
                      <p className="text-sm font-medium">{change.change}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Modification History</CardTitle>
              <CardDescription>Track all changes to ESG data and KPIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    dataset: "Scope 1 Emissions - Manufacturing",
                    action: "Updated",
                    changes: "Modified 23 records",
                    user: "environmental.team@company.com",
                    timestamp: "2024-01-15 15:20:45",
                    impact: "High"
                  },
                  {
                    dataset: "Employee Diversity Metrics",
                    action: "Added",
                    changes: "Added Q4 2023 data",
                    user: "hr.analytics@company.com",
                    timestamp: "2024-01-15 14:45:12",
                    impact: "Medium"
                  },
                  {
                    dataset: "Board Composition Data",
                    action: "Updated",
                    changes: "Updated independence status",
                    user: "governance.team@company.com",
                    timestamp: "2024-01-15 13:30:28",
                    impact: "High"
                  }
                ].map((change, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{change.dataset}</p>
                        <Badge variant={change.impact === "High" ? "destructive" : "secondary"}>
                          {change.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{change.changes}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{change.timestamp}</span>
                        <span>•</span>
                        <span>{change.user}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Events</CardTitle>
                <CardDescription>Regulatory compliance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { event: "ISSB S1 Compliance Check", status: "Passed", timestamp: "2024-01-15 12:00:00" },
                    { event: "CSRD Article 8 Validation", status: "Warning", timestamp: "2024-01-15 10:30:00" },
                    { event: "GRI Standards Review", status: "Passed", timestamp: "2024-01-14 16:45:00" }
                  ].map((event, index) => (
                    <div key={index} className="flex justify-between items-center p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{event.event}</p>
                        <p className="text-sm text-muted-foreground">{event.timestamp}</p>
                      </div>
                      <Badge variant={event.status === "Passed" ? "default" : "secondary"}>
                        {event.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retention Policy</CardTitle>
                <CardDescription>Audit log retention settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Standard Logs</span>
                    <Badge>90 days</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Security Events</span>
                    <Badge>2 years</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Compliance Logs</span>
                    <Badge>7 years</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Data Changes</span>
                    <Badge>5 years</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 