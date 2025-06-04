'use client';

import React, { useState } from 'react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useNotifications } from '../../hooks/useNotifications';

export default function TestNotificationsPage() {
  const [period, setPeriod] = useState('2024Q3');
  const [standard, setStandard] = useState('issb');
  const [isCreating, setIsCreating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  const { createNotification, refresh } = useNotifications();

  const handleCreateTestNotification = async () => {
    setIsCreating(true);
    try {
      await createNotification({
        type: 'compliance_missing',
        priority: 'high',
        title: 'テスト通知',
        message: 'これはテスト用の通知です。',
        severity: 'critical',
      });
      alert('テスト通知を作成しました');
    } catch (error) {
      console.error('テスト通知作成エラー:', error);
      alert('テスト通知の作成に失敗しました');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRunComplianceCheck = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/compliance/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period,
          standard,
          createNotifications: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      alert(`コンプライアンスチェック完了\n適合率: ${result.complianceRate.toFixed(1)}%`);
      await refresh();
    } catch (error) {
      console.error('コンプライアンスチェックエラー:', error);
      alert('コンプライアンスチェックに失敗しました');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">通知システムテスト</h1>
          <NotificationBell />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* テスト通知作成 */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-4">テスト通知作成</h2>
            <p className="text-gray-600 mb-4">
              システムに直接テスト通知を作成します。
            </p>
            <button
              onClick={handleCreateTestNotification}
              disabled={isCreating}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCreating ? '作成中...' : 'テスト通知を作成'}
            </button>
          </div>

          {/* コンプライアンスチェック */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-4">コンプライアンスチェック</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  期間
                </label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="2024Q3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  標準
                </label>
                <select
                  value={standard}
                  onChange={(e) => setStandard(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="issb">ISSB</option>
                  <option value="csrd">CSRD</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <button
                onClick={handleRunComplianceCheck}
                disabled={isChecking}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isChecking ? 'チェック中...' : 'コンプライアンスチェック実行'}
              </button>
            </div>
          </div>
        </div>

        {/* 説明 */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">使用方法</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>テスト通知作成</strong>: 手動でテスト通知を作成し、通知ベルに表示されることを確認できます。</li>
            <li><strong>コンプライアンスチェック</strong>: 指定した期間と標準でコンプライアンスチェックを実行し、不足KPIがある場合は自動的に通知が作成されます。</li>
            <li><strong>通知ベル</strong>: 右上の通知ベルをクリックすると、通知パネルが開きます。</li>
            <li>通知をクリックすると既読になり、アクションURLがある場合はリンク先に移動します。</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 