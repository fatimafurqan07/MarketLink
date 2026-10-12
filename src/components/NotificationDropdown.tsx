import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Package,
  QrCode,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { NotificationItem, NotificationType } from '../types.ts';
import { api } from '../services/api.ts';
import { cn } from '../utils/cn.ts';

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  onRefreshNotifications: () => void;
  onNotificationClick?: (notification: NotificationItem) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications = [],
  onRefreshNotifications,
  onNotificationClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkRead = async (e: React.MouseEvent, n: NotificationItem) => {
    e.stopPropagation();
    if (!n.isRead) {
      try {
        await api.markNotificationRead(n.id);
        onRefreshNotifications();
      } catch (err) {
        console.warn('Failed to mark notification as read:', err);
      }
    }
    if (onNotificationClick) {
      onNotificationClick(n);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      onRefreshNotifications();
    } catch (err) {
      console.warn('Failed to mark all notifications as read:', err);
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'order_placed':
        return <ShoppingBag className="w-4 h-4 text-[#064e3b]" />;
      case 'order_accepted':
        return <CheckCircle2 className="w-4 h-4 text-[#064e3b]" />;
      case 'order_ready':
        return <QrCode className="w-4 h-4 text-[#f59e0b]" />;
      case 'order_cancelled':
        return <AlertCircle className="w-4 h-4 text-[#b3261e]" />;
      default:
        return <Package className="w-4 h-4 text-[#064e3b]" />;
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        title="Notifications"
        className="relative h-9 w-9 rounded-lg bg-white border border-[#e2e8e5] text-[#10231d] hover:text-[#064e3b] hover:bg-[#eef2ec] flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0"
      >
        <Bell className="w-4 h-4 text-[#10231d]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#064e3b] px-1 font-mono text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#e2e8e5] shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-white border-b border-[#e2e8e5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-normal text-[#10231d] text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#064e3b] font-mono text-[10px] font-medium border border-emerald-200">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-medium text-[#064e3b] hover:text-[#043d2e] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#e2e8e5]">
            {safeNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-[#eef2ec] text-[#64748b] mx-auto flex items-center justify-center mb-2.5">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-[#10231d]">No notifications yet</p>
                <p className="text-[11px] text-[#64748b] mt-0.5">
                  Updates on placed and accepted orders will appear here.
                </p>
              </div>
            ) : (
              safeNotifications.map((n, idx) => (
                <div
                  key={`notif-${n.id || (n as any)._id || idx}`}
                  onClick={(e) => handleMarkRead(e, n)}
                  className={cn(
                    'p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-[#f8f7f2]',
                    !n.isRead ? 'bg-[#ecfdf5]/40 font-medium' : 'bg-white'
                  )}
                >
                  <div className="p-2 rounded-lg bg-[#ecfdf5] border border-emerald-200 shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p
                        className={cn(
                          'text-xs leading-snug break-words',
                          !n.isRead ? 'text-[#10231d] font-semibold' : 'text-[#64748b]'
                        )}
                      >
                        {n.message}
                      </p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0 mt-1" />
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] text-[#64748b] font-mono">
                        {formatTimestamp(n.createdAt)}
                      </span>
                      {n.orderCode && (
                        <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded-md bg-[#eef2ec] text-[#064e3b] border border-[#e2e8e5]">
                          {n.orderCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-[#f8f7f2] border-t border-[#e2e8e5] text-center">
            <span className="text-[10px] text-[#64748b] font-mono">
              MarketLink Real-Time Notification Stream
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
