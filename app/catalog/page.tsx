"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataCatalog } from '@/components/DataCatalog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

export default function CatalogPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">データカタログ</h1>
              <p className="text-gray-600">
                ESGデータの統合管理とKPI監視システム
              </p>
            </div>
          </div>
        </div>

        {/* Data Catalog Component */}
        <Card className="border-gray-200 shadow-lg">
          <CardContent className="p-0">
            <DataCatalog />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 