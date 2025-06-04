'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStats } from '@/app/hooks/useNotifications';
import { NotificationPanel } from './NotificationPanel';

interface NotificationBellProps {
  className?: string;
}

/**
 * 通知ベルコンポーネント
 */
export function NotificationBell({ className = '' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { stats, isLoading, error } = useNotificationStats();

  const unreadCount = stats?.unreadNotifications || 0;
  const hasCritical = (stats?.criticalUnread || 0) > 0;

  return (
    <div className="relative">
      {/* 通知ベルボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
        aria-label={`通知 ${unreadCount > 0 ? `(${unreadCount}件の未読)` : ''}`}
      >
        <Bell 
          className={`w-6 h-6 ${hasCritical ? 'text-red-600' : 'text-gray-600'}`}
          size={24}
        />
        
        {/* 未読数バッジ */}
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 rounded-full ${
            hasCritical ? 'bg-red-600' : 'bg-blue-600'
          }`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* ローディング中のインジケーター */}
        {isLoading && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-gray-400 rounded-full animate-pulse"></span>
        )}
      </button>

      {/* 通知パネル */}
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* パネル */}
          <div className="absolute right-0 top-full mt-2 z-50">
            <NotificationPanel 
              onClose={() => setIsOpen(false)}
              stats={stats}
            />
          </div>
        </>
      )}
    </div>
  );
} 