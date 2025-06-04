"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, ExternalLink, Download, Eye, Activity } from "lucide-react";

const recentUploads = [
  {
    fileName: "Sustainability Report 2023.csv",
    source: "CSV Upload",
    uploadedBy: "Sophia Clark",
    uploadedOn: "2024-07-26 10:00 AM",
    status: "Completed",
    statusColor: "green"
  },
  {
    fileName: "ERP Data Extract.xlsx",
    source: "ERP System",
    uploadedBy: "Ethan Bennett",
    uploadedOn: "2024-07-25 03:30 PM",
    status: "Completed",
    statusColor: "green"
  },
  {
    fileName: "BI Dashboard Data.json",
    source: "BI Tool",
    uploadedBy: "Olivia Carter",
    uploadedOn: "2024-07-24 09:15 AM",
    status: "Processing",
    statusColor: "yellow"
  },
  {
    fileName: "Supplier Data.csv",
    source: "CSV Upload",
    uploadedBy: "Liam Davis",
    uploadedOn: "2024-07-23 02:00 PM",
    status: "Completed",
    statusColor: "green"
  },
  {
    fileName: "Energy Consumption Data.csv",
    source: "CSV Upload",
    uploadedBy: "Ava Evans",
    uploadedOn: "2024-07-22 11:45 AM",
    status: "Completed",
    statusColor: "green"
  }
];

export default function DataManagementPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
              <p className="text-gray-600">
                Manage your ESG data imports, validation processes, and data quality monitoring.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-800 text-lg">Total Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">247</div>
              <p className="text-xs text-emerald-600 mt-1">+12 this month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-800 text-lg">Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">8</div>
              <p className="text-xs text-blue-600 mt-1">Connected systems</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-800 text-lg">Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">3</div>
              <p className="text-xs text-purple-600 mt-1">Files in queue</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Import Section */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-emerald-600" />
              Data Import
            </CardTitle>
            <CardDescription>
              Upload new ESG data files or connect to external systems
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg">
                <Upload className="w-4 h-4 mr-2" />
                CSV Upload
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                <FileText className="w-4 h-4 mr-2" />
                System Connect
              </Button>
              <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                <Download className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Uploads Section */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-800">Recent Uploads</CardTitle>
            <CardDescription>
              Monitor your latest data uploads and their processing status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-700">File Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Source</TableHead>
                  <TableHead className="font-semibold text-gray-700">Uploaded By</TableHead>
                  <TableHead className="font-semibold text-gray-700">Date & Time</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUploads.map((upload, index) => (
                  <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span>{upload.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      <Badge variant="outline" className="text-xs">
                        {upload.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {upload.uploadedBy}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {upload.uploadedOn}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={
                          upload.statusColor === "green" 
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                            : upload.statusColor === "yellow"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      >
                        {upload.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-100">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 