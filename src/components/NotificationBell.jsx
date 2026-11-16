// src/components/NotificationBell.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Trash2 } from 'lucide-react';

// 🔊 ব্রাউজারের বিল্ট-ইন মিষ্টি নোটিফিকেশন টোন (কোনো MP3 ফাইল ছাড়াই বাজবে)
function playNotificationTone() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 নোট
    osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.12); // D6 নোট (ডিং-ডং)

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // অডিও ব্লক থাকলে ইগনোর করবে
  }
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevCountRef = useRef(0);
  const isFirstLoad = useRef(true);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const newCount = data.unreadCount || 0;

        // নতুন নোটিফিকেশন আসলে শব্দ বাজবে
        if (!isFirstLoad.current && newCount > prevCountRef.current) {
          playNotificationTone();
        }

        prevCountRef.current = newCount;
        isFirstLoad.current = false;
        setNotifications(data.notifications || []);
        setUnreadCount(newCount);
      }
    } catch {
      // নেটওয়ার্ক ত্রুটি ইগনোর
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // প্রতি ১০ সেকেন্ডে চেক
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // দেখার সাথে সাথে তালিকা থেকে সরিয়ে নির্ধারিত পেজে নিয়ে যাবে
  const handleNotificationClick = async (item) => {
    setNotifications((prev) => prev.filter((n) => n._id !== item._id));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    prevCountRef.current = Math.max(0, prevCountRef.current - 1);
    setOpen(false);

    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: item._id }),
    });

    if (item.link) router.push(item.link);
  };

  // সবগুলো মুছে ফেলা
  const handleClearAll = async () => {
    setNotifications([]);
    setUnreadCount(0);
    prevCountRef.current = 0;

    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 বেল আইকন বাটন */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
        title="নোটিফিকেশন দেখুন"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 📱 মোবাইল ও 💻 ডেস্কটপ—সব ডিভাইসের জন্য পূর্ণ রেসপনসিভ ড্রপডাউন */}
      {open && (
        <div className="fixed inset-x-3 top-20 md:absolute md:inset-x-auto md:top-full md:left-0 md:mt-2 md:w-80 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between gap-2">
            <h4 className="font-bold text-xs text-gray-800">
              🔔 নতুন নোটিফিকেশন ({unreadCount} টি)
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[11px] text-red-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" /> সব মুছুন
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-400">
                কোনো নতুন নোটিফিকেশন নেই
              </p>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  className="p-3.5 bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-gray-800 leading-snug">
                      {item.title}
                    </p>
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1"></span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed break-words">
                    {item.message}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    {new Date(item.createdAt).toLocaleString('bn-BD')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
