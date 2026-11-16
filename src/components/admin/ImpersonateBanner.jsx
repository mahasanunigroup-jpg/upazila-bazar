'use client';
import { useRouter } from 'next/navigation';

export default function ImpersonateBanner({ targetName, targetRole }) {
  const router = useRouter();

  const handleExit = async () => {
    const res = await fetch('/api/admin/impersonate', { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className="mb-5 bg-amber-50 border border-amber-300 px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 shadow-sm">
      <p className="text-xs sm:text-sm text-amber-900">
        👁️ আপনি সুপার অ্যাডমিন হিসেবে <span className="font-bold">{targetName}</span> ({targetRole})-এর প্যানেল দেখছেন।
      </p>
      <button
        onClick={handleExit}
        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition whitespace-nowrap"
      >
        ← সুপার অ্যাডমিনে ফিরুন
      </button>
    </div>
  );
}
