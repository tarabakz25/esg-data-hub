'use client'

import UploadForm from '@/components/upload/UploadForm'
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';

export default function IngestPage() {
  return (
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="KPI Data Upload"
          description="CSVファイルをアップロードしてKPIデータを管理システムに取り込みます。"
          esgCategory="environment"
        />
        
        {/* Upload Form */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DocumentArrowUpIcon className="h-5 w-5 text-primary" />
              <span>ファイルアップロード</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UploadForm />
          </CardContent>
        </Card>
      </div>
  )
} 