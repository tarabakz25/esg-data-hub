'use client'

import SimpleUploadForm from '@/components/upload/SimpleUploadForm'

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ESGデータアップロード</h1>
          <p className="mt-4 text-lg text-gray-600">
            CSVファイルをアップロードして自動処理を開始します
          </p>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg p-8">
          <SimpleUploadForm />
        </div>
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">✨ 新しい統合ワークフロー</h3>
          <div className="space-y-3 text-blue-700">
            <div className="flex items-center space-x-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
              <span>CSVファイルをドラッグ&ドロップまたは選択</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
              <span>AI が自動でKPIマッピングを実行</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
              <span>累積データが自動更新され、ダッシュボードに反映</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold">4</span>
              <span>コンプライアンスチェックが自動実行</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 