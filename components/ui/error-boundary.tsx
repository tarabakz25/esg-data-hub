"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // 本番環境でエラー監視サービスに送信
    if (process.env.NODE_ENV === 'production') {
      // analytics.track('error_boundary_triggered', {
      //   error: error.message,
      //   stack: error.stack,
      //   componentStack: errorInfo.componentStack,
      // });
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // カスタムフォールバックUIがある場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // デフォルトのエラーUI
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                  申し訳ございません
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  予期しないエラーが発生しました
                </p>
              </div>

              <div className="mt-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-sm text-red-800">
                    <p className="font-medium">エラー詳細:</p>
                    <p className="mt-1 font-mono text-xs">
                      {this.state.error?.message || '不明なエラー'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col space-y-3">
                  <button
                    onClick={this.handleReset}
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    再試行
                  </button>
                  
                  <button
                    onClick={this.handleReload}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    ページを再読み込み
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/'}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    ホームに戻る
                  </button>
                </div>

                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <details className="mt-6">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                      開発者向け詳細情報
                    </summary>
                    <div className="mt-2 bg-gray-100 p-3 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                      <div className="whitespace-pre-wrap">
                        {this.state.error?.stack}
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        Component Stack:
                        <div className="whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </div>
                      </div>
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 軽量版エラーバウンダリ（特定のコンポーネント用）
interface SimpleErrorBoundaryProps {
  children: ReactNode;
  fallback?: string;
}

export function SimpleErrorBoundary({ children, fallback = "エラーが発生しました" }: SimpleErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{fallback}</p>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
} 