"use client";

import { memo } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'red' | 'gray';
  message?: string;
  className?: string;
}

const LoadingSpinner = memo<LoadingSpinnerProps>(({ 
  size = 'md', 
  color = 'blue', 
  message, 
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'md': return 'h-6 w-6';
      case 'lg': return 'h-8 w-8';
      case 'xl': return 'h-12 w-12';
      default: return 'h-6 w-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'blue': return 'border-blue-600';
      case 'green': return 'border-green-600';
      case 'red': return 'border-red-600';
      case 'gray': return 'border-gray-600';
      default: return 'border-blue-600';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 ${getSizeClasses()} ${getColorClasses()}`}
        role="status"
        aria-label="読み込み中"
      />
      {message && (
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

// プリセットされたローディングコンポーネント
export const PageLoading = memo(() => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="xl" message="ページを読み込み中..." />
  </div>
));

export const TableLoading = memo(() => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner size="lg" message="データを読み込み中..." />
  </div>
));

export const InlineLoading = memo<{ message?: string }>(({ message = "読み込み中..." }) => (
  <div className="flex items-center space-x-2 py-2">
    <LoadingSpinner size="sm" />
    <span className="text-sm text-gray-600">{message}</span>
  </div>
));

export const ButtonLoading = memo<{ message?: string }>(({ message = "処理中..." }) => (
  <div className="flex items-center space-x-2">
    <LoadingSpinner size="sm" color="gray" />
    <span>{message}</span>
  </div>
));

export default LoadingSpinner; 