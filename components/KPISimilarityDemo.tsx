'use client';

import React, { useState } from 'react';
import { useKpiSimilarity, useKpiStats } from '@/hooks/use-kpi-similarity';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function KPISimilarityDemo() {
  const [columnName, setColumnName] = useState('');
  const [sampleValues, setSampleValues] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { suggestKPIMapping, hybridKPISearch, isSearching, lastMapping } = useKpiSimilarity();
  const { fetchStats, generateEmbeddings, isLoading, stats } = useKpiStats();

  const handleColumnMapping = async () => {
    if (!columnName.trim()) return;

    const samples = sampleValues.trim() 
      ? sampleValues.split(',').map(s => s.trim()).filter(s => s)
      : undefined;

    try {
      await suggestKPIMapping(columnName, samples);
    } catch (error) {
      console.error('Mapping failed:', error);
    }
  };

  const handleHybridSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const result = await hybridKPISearch(searchQuery);
      console.log('Hybrid search results:', result);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">KPI類似度検索デモ</h1>
        <p className="text-gray-600">列名とサンプル値からKPIを自動マッピング</p>
      </div>

      {/* 統計情報 */}
      <Card>
        <CardHeader>
          <CardTitle>KPI辞書統計</CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalCount}</div>
                <div className="text-sm text-gray-500">総KPI数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.categoryCount}</div>
                <div className="text-sm text-gray-500">カテゴリ数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.embeddingsGenerated}</div>
                <div className="text-sm text-gray-500">埋め込み生成済</div>
              </div>
              <div className="text-center">
                <button
                  onClick={generateEmbeddings}
                  disabled={isLoading}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoading ? '生成中...' : '埋め込み生成'}
                </button>
              </div>
            </div>
          ) : (
            <div>統計情報を読み込み中...</div>
          )}
        </CardContent>
      </Card>

      {/* 列名マッピング */}
      <Card>
        <CardHeader>
          <CardTitle>列名からKPIマッピング</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">列名</label>
            <input
              type="text"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              placeholder="例: CO2排出量, 従業員数, 売上高"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">サンプル値（カンマ区切り）</label>
            <input
              type="text"
              value={sampleValues}
              onChange={(e) => setSampleValues(e.target.value)}
              placeholder="例: 123.45, 234.56, 345.67"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleColumnMapping}
            disabled={isSearching || !columnName.trim()}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isSearching ? 'マッピング中...' : 'KPIマッピング実行'}
          </button>
        </CardContent>
      </Card>

      {/* マッピング結果 */}
      {lastMapping && (
        <Card>
          <CardHeader>
            <CardTitle>マッピング結果: {lastMapping.columnName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">
                信頼度: <span className="font-bold">{(lastMapping.confidence * 100).toFixed(1)}%</span>
              </div>
              {lastMapping.bestMatch && (
                <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                  <div className="font-bold text-blue-900">{lastMapping.bestMatch.kpi.name}</div>
                  <div className="text-sm text-blue-700">
                    {lastMapping.bestMatch.kpi.category} | {lastMapping.bestMatch.kpi.unit}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    類似度: {(lastMapping.bestMatch.similarity * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>

            {lastMapping.topMatches.length > 1 && (
              <div>
                <h4 className="font-medium mb-2">その他の候補:</h4>
                <div className="space-y-2">
                  {lastMapping.topMatches.slice(1).map((match, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{match.kpi.name}</div>
                          <div className="text-sm text-gray-600">
                            <Badge variant="secondary">{match.kpi.category}</Badge>
                            <span className="ml-2">{match.kpi.unit}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {(match.similarity * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ハイブリッド検索 */}
      <Card>
        <CardHeader>
          <CardTitle>ハイブリッド検索</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">検索クエリ</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="例: 環境 CO2, 従業員 女性, ガバナンス 取締役"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleHybridSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isSearching ? '検索中...' : 'ハイブリッド検索'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
} 