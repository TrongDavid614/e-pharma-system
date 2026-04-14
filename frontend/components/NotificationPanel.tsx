'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Notification } from '@/types';
import { BellIcon } from '@heroicons/react/24/outline';

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((n: Notification) => {
    setNotifications((prev) => [n, ...prev].slice(0, 50));
    setUnreadCount((c) => c + 1);
  }, []);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/topic/notifications', (message: IMessage) => {
          try {
            const notification: Notification = JSON.parse(message.body);
            addNotification(notification);
          } catch {
            // ignore malformed messages
          }
        });
      },
    });

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [addNotification]);

  const markAllRead = () => {
    setUnreadCount(0);
  };

  const badgeColor =
    notifications.some((n) => n.type === 'LOW_STOCK') ? 'bg-red-500' : 'bg-yellow-500';

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markAllRead();
        }}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 ${badgeColor} text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  <BellIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No notifications
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          n.type === 'LOW_STOCK'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {n.type === 'LOW_STOCK' ? 'Low Stock' : 'Expiring Soon'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mt-1">{n.medicineName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setNotifications([])}
                  className="text-xs text-gray-500 hover:text-gray-700 w-full text-center"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
