'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // クライアント側でQueryClientを初期化
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // デフォルトで5分間キャッシュ
            staleTime: 5 * 60 * 1000,
            // ネットワークエラー時のリトライ設定
            retry: (failureCount, error) => {
              // 404エラーはリトライしない
              if (error instanceof Error && error.message.includes('404')) {
                return false
              }
              // 3回までリトライ
              return failureCount < 3
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 開発環境でのみReact Query Devtoolsを表示 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
} 