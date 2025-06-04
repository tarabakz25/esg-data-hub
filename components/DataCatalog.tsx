'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge, StatusBadge } from './ui';
import { Search, Database, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import type { KPIDetail, DataSourceDetail, CatalogStats } from '@/types/catalog';
import { cn } from '@/lib/utils';

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
    <div className={cn("space-y-6 p-6", className)}>
      {/* タブナビゲーション */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('stats')}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-theme flex items-center justify-center space-x-2",
            activeTab === 'stats'
              ? 'bg-card text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          )}
        >
          <TrendingUp className="w-4 h-4" />
          <span>統計情報</span>
        </button>
        <button
          onClick={() => setActiveTab('kpis')}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-theme flex items-center justify-center space-x-2",
            activeTab === 'kpis'
              ? 'bg-card text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          )}
        >
          <CheckCircle className="w-4 h-4" />
          <span>KPI一覧</span>
        </button>
        <button
          onClick={() => setActiveTab('datasources')}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-theme flex items-center justify-center space-x-2",
            activeTab === 'datasources'
              ? 'bg-card text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          )}
        >
          <Database className="w-4 h-4" />
          <span>データソース</span>
        </button>
      </div>

      {/* 検索バー (KPI/データソースタブでのみ表示) */}
      {(activeTab === 'kpis' || activeTab === 'datasources') && (
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
        <div className="bg-error/10 border border-error/20 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-error mr-2" />
            <span className="text-error">{error}</span>
          </div>
        </div>
      )}

      {/* コンテンツエリア */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">読み込み中...</span>
        </div>
      ) : (
        <>
          {/* 統計情報タブ */}
          {activeTab === 'stats' && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-all border-primary/20 bg-primary/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">総KPI数</CardTitle>
                  <CheckCircle className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.totalKPIs}</div>
                  <p className="text-xs text-muted-foreground">
                    登録済みのKPI指標
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all border-secondary/20 bg-secondary/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">データソース</CardTitle>
                  <Database className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{stats.totalDataSources}</div>
                  <p className="text-xs text-muted-foreground">
                    接続中のデータ提供元
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all border-success/20 bg-success/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">コンプライアンス率</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{stats.complianceRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    必須KPIの充足率
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all border-accent/20 bg-accent/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">総レコード数</CardTitle>
                  <Database className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{stats.totalRecords.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    収集済みデータポイント
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all border-warning/20 bg-warning/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">欠損KPI</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{stats.missingKPIs}</div>
                  <p className="text-xs text-muted-foreground">
                    データが不足している指標
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all border-error/20 bg-error/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">最近のアラート</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-error" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-error">{stats.recentAlerts}</div>
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
                <Card key={kpi.id} className="hover:shadow-md transition-all border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">{kpi.displayName}</CardTitle>
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
                        <h4 className="text-sm font-medium text-muted-foreground">規制要件:</h4>
                        <div className="flex flex-wrap gap-1">
                          {kpi.requirements.map((req, index) => (
                            <StatusBadge
                              key={index}
                              status={req.isRequired ? "success" : "neutral"}
                              size="sm"
                              className="text-xs"
                            >
                              {req.regulation}
                              {req.isRequired && " (必須)"}
                            </StatusBadge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {kpis.length === 0 && !loading && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  KPIが見つかりませんでした
                </div>
              )}
            </div>
          )}

          {/* データソース一覧タブ */}
          {activeTab === 'datasources' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dataSources.map((ds) => (
                <Card key={ds.id} className="hover:shadow-md transition-all border-secondary/20 bg-secondary/5">
                  <CardHeader>
                    <CardTitle className="text-lg text-secondary">{ds.name}</CardTitle>
                    <CardDescription>{ds.description || '説明なし'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>作成日: {new Date(ds.createdAt).toLocaleDateString('ja-JP')}</div>
                      <div>更新日: {new Date(ds.updatedAt).toLocaleDateString('ja-JP')}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {dataSources.length === 0 && !loading && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
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