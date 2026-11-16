// src/components/admin/SecurityAlertBanner.jsx
'use client';
import { useEffect, useState } from 'react';

export default function SecurityAlertBanner() {
  const [alertData, setAlertData] = useState(null);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const res = await fetch('/api/admin/security-alert', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.alert?.hasAlert) {
            setAlertData(data.alert);
          }
        }
      } catch (err) {
        // নেটওয়ার্ক এরর ইগনোর
      }
    };

    fetchAlert();
    const interval = setInterval(fetchAlert, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = async () => {
    await fetch('/api/admin/security-alert', { method: 'DELETE' });
    setAlertData(null);
  };

  if (!alertData) return null;

  return (
    <div className="mb-6 bg-red-50 border-l-4 border-red-600 p-4 rounded-r-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h4 className="text-red-800 font-bold text-sm flex items-center gap-2">
          🚨 নিরাপত্তা সতর্কতা (অননুমোদিত লগইন চেষ্টা)
        </h4>
        <p className="text-red-700 text-xs mt-1">{alertData.message}</p>
        <p className="text-red-500 text-[11px] mt-1">
          ডিভাইস: {alertData.deviceInfo} | সময়: {new Date(alertData.attemptedAt).toLocaleString('bn-BD')}
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition self-start sm:self-center whitespace-nowrap"
      >
        বুঝেছি, বন্ধ করুন
      </button>
    </div>
  );
}
