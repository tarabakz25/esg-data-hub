'use client';

import { AutoMappingWizard } from '@/components/AutoMappingWizard';
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { MapIcon } from '@heroicons/react/24/outline';

export default function MappingPage() {
  return (
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="セマンティックマッピング"
          description="AIによるKPIの自動マッピングを確認・管理します。"
          esgCategory="governance"
        />
        
        {/* Mapping Wizard */}
        <Card className="card-shadow">
          <CardContent className="p-0">
            <AutoMappingWizard />
          </CardContent>
        </Card>
      </div>
  );
} 