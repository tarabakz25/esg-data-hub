import * as React from 'react';

export interface TimelineItem {
  title: string;
  content: React.ReactNode;
  timestamp: Date;
  by: string;
}

export interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{item.title}</h3>
              <span className="text-sm text-gray-500">
                {item.timestamp.toLocaleDateString('ja-JP')}
              </span>
            </div>
            <div className="mt-2">{item.content}</div>
            <p className="text-sm text-gray-600 mt-1">by {item.by}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 