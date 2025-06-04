'use client'

import UploadForm from '@/components/upload/UploadForm'

export default function IngestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">KPI Data Upload</h1>
        <p className="mt-2 text-gray-600">
          CSVファイルをアップロードしてKPIデータを管理システムに取り込みます。
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          ファイルアップロード
        </h2>
        <UploadForm />
      </div>
    </div>
  )
} 