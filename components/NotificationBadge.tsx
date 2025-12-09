'use client';

import { Bell } from 'lucide-react';

interface NotificationBadgeProps {
  count: number;
  message: string;
}

export function NotificationBadge({ count, message }: NotificationBadgeProps) {
  if (count === 0) return null;
  
  return (
    <div className="absolute -top-1 -right-1 flex items-center gap-1">
      <div className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
        {count}
      </div>
    </div>
  );
}

interface NotificationPanelProps {
  notifications: {
    id: string;
    type: 'verify' | 'approve' | 'review' | 'complete';
    title: string;
    description: string;
    timestamp: Date;
    action?: {
      label: string;
      handler: () => void;
    };
  }[];
}

export function NotificationPanel({ notifications }: NotificationPanelProps) {
  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No pending notifications</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {notifications.map(notif => (
        <div key={notif.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-sm text-gray-900">{notif.title}</h4>
              <p className="text-xs text-gray-600 mt-1">{notif.description}</p>
            </div>
            <span className="text-xs text-gray-500">
              {notif.timestamp.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          {notif.action && (
            <button
              onClick={notif.action.handler}
              className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              {notif.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

