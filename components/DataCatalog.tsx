'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Search, Database, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import type { KPIDetail, DataSourceDetail, CatalogStats } from '@/types/catalog';

interface DataCatalogProps {
  className?: string;
}

export function DataCatalog({ className }: DataCatalogProps) {
  const [activeTab, setActiveTab] = useState<'kpis' | 'datasources' | 'stats'>('stats');
  const [searchQuery, setSearchQuery] = useState('');
  const [kpis, setKPIs] = useState<KPIDetail[]>([]);
  const [dataSources, setDataSources] = useState<DataSourceDetail[]>([]);
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 統計情報を取得
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/catalog/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error || '統計情報の取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // KPIを検索
  const searchKPIs = async (query: string = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      params.set('limit', '20');
      
      const response = await fetch(`/api/catalog/kpis?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setKPIs(result.data);
      } else {
        setError(result.error || 'KPIの検索に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // データソースを検索
  const searchDataSources = async (query: string = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      params.set('limit', '20');
      
      const response = await fetch(`/api/catalog/datasources?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setDataSources(result.data);
      } else {
        setError(result.error || 'データソースの検索に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 初期読み込み
  useEffect(() => {
    fetchStats();
  }, []);

  // タブ切り替え時の処理
  useEffect(() => {
    setError(null);
    if (activeTab === 'kpis') {
      searchKPIs(searchQuery);
    } else if (activeTab === 'datasources') {
      searchDataSources(searchQuery);
    }
  }, [activeTab]);

  // 検索実行
  const handleSearch = () => {
    setError(null);
    if (activeTab === 'kpis') {
      searchKPIs(searchQuery);
    } else if (activeTab === 'datasources') {
      searchDataSources(searchQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`space-y-6 p-6 ${className}`}>
      {/* タブナビゲーション */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'stats'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          統計情報
        </button>
        <button
          onClick={() => setActiveTab('kpis')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'kpis'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle className="w-4 h-4 inline mr-2" />
          KPI一覧
        </button>
        <button
          onClick={() => setActiveTab('datasources')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'datasources'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Database className="w-4 h-4 inline mr-2" />
          データソース
        </button>
      </div>

      {/* 検索バー (KPI/データソースタブでのみ表示) */}
      {(activeTab === 'kpis' || activeTab === 'datasources') && (
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={activeTab === 'kpis' ? 'KPIを検索...' : 'データソースを検索...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            検索
          </Button>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* コンテンツエリア */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">読み込み中...</span>
        </div>
      ) : (
        <>
          {/* 統計情報タブ */}
          {activeTab === 'stats' && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">総KPI数</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalKPIs}</div>
                  <p className="text-xs text-muted-foreground">
                    登録済みのKPI指標
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">データソース</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDataSources}</div>
                  <p className="text-xs text-muted-foreground">
                    接続中のデータ提供元
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">コンプライアンス率</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.complianceRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    必須KPIの充足率
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">総レコード数</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    収集済みデータポイント
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">欠損KPI</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.missingKPIs}</div>
                  <p className="text-xs text-muted-foreground">
                    データが不足している指標
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">最近のアラート</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.recentAlerts}</div>
                  <p className="text-xs text-muted-foreground">
                    過去7日間のアラート件数
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* KPI一覧タブ */}
          {activeTab === 'kpis' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kpis.map((kpi) => (
                <Card key={kpi.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{kpi.displayName}</CardTitle>
                    <CardDescription>
                      <Badge variant="outline" className="mr-2">
                        {kpi.code}
                      </Badge>
                      {kpi.baseUnit}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {kpi.requirements && kpi.requirements.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">規制要件:</h4>
                        <div className="flex flex-wrap gap-1">
                          {kpi.requirements.map((req, index) => (
                            <Badge
                              key={index}
                              variant={req.isRequired ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {req.regulation}
                              {req.isRequired && " (必須)"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {kpis.length === 0 && !loading && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  KPIが見つかりませんでした
                </div>
              )}
            </div>
          )}

          {/* データソース一覧タブ */}
          {activeTab === 'datasources' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dataSources.map((ds) => (
                <Card key={ds.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{ds.name}</CardTitle>
                    <CardDescription>{ds.description || '説明なし'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>作成日: {new Date(ds.createdAt).toLocaleDateString('ja-JP')}</div>
                      <div>更新日: {new Date(ds.updatedAt).toLocaleDateString('ja-JP')}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {dataSources.length === 0 && !loading && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  データソースが見つかりませんでした
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 