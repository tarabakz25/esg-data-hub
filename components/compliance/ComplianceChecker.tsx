'use client'

import { useState } from 'react'
import { ComplianceCheckResult, ComplianceStandard } from '@/types/services/compliance'

interface ComplianceFormData {
  period: string
  standard: ComplianceStandard
}

export default function ComplianceChecker() {
  const [formData, setFormData] = useState<ComplianceFormData>({
    period: '2024Q4',
    standard: 'issb'
  })
  const [result, setResult] = useState<ComplianceCheckResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // まず既存の結果があるかチェック
      const getResponse = await fetch(
        `/api/compliance/check?period=${formData.period}&standard=${formData.standard}`
      )

      if (getResponse.ok) {
        const existingResult = await getResponse.json()
        setResult(existingResult)
        setLoading(false)
        return
      }

      // 既存結果がない場合は新規チェック実行
      const postResponse = await fetch('/api/compliance/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!postResponse.ok) {
        const errorData = await postResponse.json()
        throw new Error(errorData.error || 'チェックに失敗しました')
      }

      const newResult = await postResponse.json()
      setResult(newResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-800 bg-green-100'
      case 'warning':
        return 'text-yellow-800 bg-yellow-100'
      case 'critical':
        return 'text-red-800 bg-red-100'
      default:
        return 'text-gray-800 bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'compliant':
        return '適合'
      case 'warning':
        return '警告'
      case 'critical':
        return '重大'
      default:
        return '不明'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-50'
      case 'warning':
        return 'text-yellow-700 bg-yellow-50'
      default:
        return 'text-gray-700 bg-gray-50'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* チェック実行フォーム */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-gray-700">
              チェック期間
            </label>
            <select
              id="period"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2024Q1">2024年 第1四半期</option>
              <option value="2024Q2">2024年 第2四半期</option>
              <option value="2024Q3">2024年 第3四半期</option>
              <option value="2024Q4">2024年 第4四半期</option>
              <option value="2024">2024年 通年</option>
            </select>
          </div>

          <div>
            <label htmlFor="standard" className="block text-sm font-medium text-gray-700">
              コンプライアンス基準
            </label>
            <select
              id="standard"
              value={formData.standard}
              onChange={(e) => setFormData({ ...formData, standard: e.target.value as ComplianceStandard })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="issb">ISSB (International Sustainability Standards Board)</option>
              <option value="csrd">CSRD (Corporate Sustainability Reporting Directive)</option>
              <option value="custom">カスタム基準 (社内規定)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'チェック実行中...' : 'コンプライアンスチェック実行'}
        </button>
      </form>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 結果表示 */}
      {result && (
        <div className="space-y-4">
          {/* サマリー */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">チェック結果サマリー</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{result.complianceRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">コンプライアンス率</div>
              </div>
              <div className="text-center">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(result.status)}`}>
                  {getStatusLabel(result.status)}
                </div>
                <div className="text-sm text-gray-600 mt-1">ステータス</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{result.criticalMissing}</div>
                <div className="text-sm text-gray-600">重大な欠損</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{result.warningMissing}</div>
                <div className="text-sm text-gray-600">警告レベル欠損</div>
              </div>
            </div>
          </div>

          {/* 欠損KPIリスト */}
          {result.missingKpis.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">欠損KPI一覧</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        KPI ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        KPI名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        カテゴリ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        重要度
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        期待単位
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.missingKpis.map((kpi, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {kpi.kpiId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {kpi.kpiName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {kpi.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(kpi.severity)}`}>
                            {kpi.severity === 'critical' ? '重大' : '警告'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {kpi.expectedUnit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">全てのKPIが揃っています</h3>
                  <p className="mt-1 text-sm text-green-700">
                    {result.standard.toUpperCase()}基準の必須KPIは全て揃っており、コンプライアンス要件を満たしています。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* チェック詳細情報 */}
          <div className="text-sm text-gray-500 border-t pt-4">
            <p>チェック実行日時: {new Date(result.checkedAt).toLocaleString('ja-JP')}</p>
            <p>対象期間: {result.period}</p>
            <p>適用基準: {result.standard.toUpperCase()}</p>
            <p>総KPI数: {result.totalKpis}</p>
          </div>
        </div>
      )}
    </div>
  )
} 