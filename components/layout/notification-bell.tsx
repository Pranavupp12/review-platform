'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '@/lib/actions';

// 1. ADD PROPS INTERFACE
interface NotificationBellProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

// 2. USE PROPS INSTEAD OF INTERNAL STATE
export function NotificationBell({ isOpen, onToggle }: NotificationBellProps) {
  // const [isOpen, setIsOpen] = useState(false); <--- REMOVE THIS
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle Click Outside (Updated to use onToggle)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Only close if it's currently open
        if (isOpen) onToggle(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]); // <--- Add dependencies

  // ... (Fetch counts useEffect remains same) ...
  useEffect(() => {
      const fetchCount = async () => {
        const count = await getUnreadCount();
        setUnreadCount(count);
      };
      fetchCount();
    }, []);

  // Fetch data when OPEN prop changes
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        const data = await getNotifications();
        // @ts-ignore
        setNotifications(data);
        setLoading(false);
      };
      fetchData();
    }
  }, [isOpen]);

  // ... (Handlers remain mostly same, just check isOpen prop if needed) ...
  
  const handleNotificationClick = async (id: string, isRead: boolean) => {
    if (isRead) return;
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await markAsRead(id);
  };

  const handleDelete = async (e: React.MouseEvent, id: string, isRead: boolean) => {
    e.stopPropagation(); 
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (!isRead) setUnreadCount((prev) => Math.max(0, prev - 1));
    await deleteNotification(id);
  };

  const handleMarkAllRead = async () => {
     setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
     setUnreadCount(0);
     await markAllAsRead();
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-gray-500 hover:text-[#0ABED6]"
        onClick={() => onToggle(!isOpen)} // <--- USE PROP HERE
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-md bg-white py-1 shadow-lg  z-50">
           {/* ... Rest of JSX is identical ... */}
           <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
                 <button 
                 onClick={handleMarkAllRead}
                 className="text-xs text-[#0ABED6] hover:underline font-medium"
               >
                 Mark all read
               </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative flex flex-col gap-1 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 group",
                    !notification.isRead ? "bg-blue-50/50" : ""
                  )}
                  onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                >
                  <button
                    onClick={(e) => handleDelete(e, notification.id, notification.isRead)}
                    className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove notification"
                  >
                    <X className="h-3 w-3" />
                  </button>

                  <div className="pr-6">
                    <div className="flex items-center gap-2 mb-0.5">
                        <p className={cn("text-sm font-bold", !notification.isRead ? "text-red-500" : "text-gray-600")}>
                        {notification.title}
                        </p>
                        {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-[#0ABED6] shrink-0" />
                        )}
                    </div>
                    <p className="text-xs text-gray-500 whitespace-pre-wrap leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}