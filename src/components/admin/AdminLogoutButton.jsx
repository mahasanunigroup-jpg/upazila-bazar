// src/components/admin/AdminLogoutButton.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // ডাটাবেস থেকে activeSessionId আনলক ও কুকি ক্লিয়ার করা
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-3.5 py-2.5 rounded-lg text-left text-red-400 hover:text-white hover:bg-red-600/90 transition whitespace-nowrap cursor-pointer disabled:opacity-50"
    >
      🚪 {loading ? 'লগআউট হচ্ছে...' : 'লগআউট করুন'}
    </button>
  );
}
