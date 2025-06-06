"use client";

import { useRecentActivity } from "@/app/hooks/useRecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, RefreshCw, AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  className?: string;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showHeader?: boolean;
  showRefreshButton?: boolean;
  showStats?: boolean;
}

export default function RecentActivity({
  className,
  limit = 8,
  autoRefresh = true,
  refreshInterval = 30000, // 30秒
  showHeader = true,
  showRefreshButton = true,
  showStats = false
}: RecentActivityProps) {
  const {
    activities,
    total,
    lastUpdated,
    isLoading,
    error,
    refresh,
    formatRelativeTime,
    getStatusConfig,
    stats
  } = useRecentActivity({
    limit,
    autoRefresh,
    refreshInterval
  });

  const renderActivityItem = (activity: any, index: number) => {
    const statusConfig = getStatusConfig(activity.status);
    
    const content = (
      <div
        key={activity.id}
        className={cn(
          "flex items-center justify-between py-3 px-4 transition-all duration-200",
          index < activities.length - 1 && "border-b border-border",
          activity.actionUrl && "hover:bg-gray-50 cursor-pointer"
        )}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* ステータスアイコン */}
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm",
            statusConfig.bgColor,
            statusConfig.borderColor,
            "border"
          )}>
            <span>{statusConfig.icon}</span>
          </div>
          
          {/* アクティビティ情報 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-foreground truncate">
                {activity.title}
              </p>
              <Badge variant="outline" className="text-xs">
                {activity.type}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-1">
              {activity.description}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {activity.user}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(activity.timestamp)}
              </span>
            </div>
          </div>
        </div>

        {/* アクションリンク */}
        {activity.actionUrl && (
          <div className="flex-shrink-0 ml-2">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
    );

    // アクションURLがある場合はリンクでラップ
    if (activity.actionUrl) {
      return (
        <Link key={activity.id} href={activity.actionUrl}>
          {content}
        </Link>
      );
    }

    return content;
  };

  return (
    <Card className={cn("card-shadow", className)}>
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>最近のアクティビティ</span>
              {total > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {total}
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              {/* 最終更新時刻 */}
              <span className="text-xs text-muted-foreground">
                最終更新: {formatRelativeTime(lastUpdated)}
              </span>
              
              {/* 手動更新ボタン */}
              {showRefreshButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refresh}
                  disabled={isLoading}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className={cn(
                    "h-4 w-4",
                    isLoading && "animate-spin"
                  )} />
                </Button>
              )}
            </div>
          </div>

          {/* 統計情報 */}
          {showStats && (
            <div className="flex items-center space-x-4 pt-2">
              <div className="flex items-center space-x-1">
                <span className="text-green-600">✅</span>
                <span className="text-xs text-muted-foreground">{stats.successCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-600">⚠️</span>
                <span className="text-xs text-muted-foreground">{stats.warningCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-red-600">❌</span>
                <span className="text-xs text-muted-foreground">{stats.errorCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-blue-600">ℹ️</span>
                <span className="text-xs text-muted-foreground">{stats.infoCount}</span>
              </div>
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className={cn(showHeader ? "pt-0" : "p-0")}>
        {/* ローディング状態 */}
        {isLoading && activities.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">読み込み中...</span>
          </div>
        )}

        {/* エラー状態 */}
        {error && activities.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <Button onClick={refresh} size="sm" variant="outline">
                再試行
              </Button>
            </div>
          </div>
        )}

        {/* アクティビティ一覧 */}
        {activities.length > 0 && (
          <div className="space-y-0">
            {activities.map((activity, index) => renderActivityItem(activity, index))}
          </div>
        )}

        {/* データなし状態 */}
        {!isLoading && !error && activities.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                最近のアクティビティはありません
              </p>
            </div>
          </div>
        )}

        {/* 部分エラー表示 */}
        {error && activities.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                最新データの取得に問題があります: {error}
              </span>
              <Button onClick={refresh} size="sm" variant="ghost" className="ml-auto">
                再試行
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 