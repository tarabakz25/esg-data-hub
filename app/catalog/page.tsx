"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { DataCatalog } from '@/components/DataCatalog';
import { Card, CardContent } from "@/components/ui/card";
import { Database } from "lucide-react";

export default function CatalogPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <PageHeader
          title="データカタログ"
          description="ESGデータの統合管理とKPI監視システム"
          icon={Database}
        />

        {/* Data Catalog Component */}
        <Card className="shadow-lg card-shadow">
          <CardContent className="p-0">
            <DataCatalog />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 