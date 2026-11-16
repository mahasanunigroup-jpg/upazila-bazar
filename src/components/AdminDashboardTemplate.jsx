// src/components/AdminDashboardTemplate.jsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardTemplate({ levelTitle, themeColor = "orange" }) {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setAdmin(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = async () => {
    // কুকি ও লোকাল স্টোরেজ ক্লিয়ার করে লগআউট
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!admin) {
    return <div className="p-10 text-center text-gray-600">ড্যাশবোর্ড লোড হচ্ছে...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* টপ নেভিগেশন বার */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">উপজেলা বাজার — {levelTitle}</h1>
          <p className="text-sm text-gray-500">
            স্বাগতম, <span className="font-semibold text-gray-700">{admin.name}</span> ({admin.role})
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition"
        >
          লগআউট
        </button>
      </header>

      {/* মেইন কন্টেন্ট এরিয়া */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* দায়িত্বপ্রাপ্ত এলাকার তথ্য */}
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-orange-500">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">আপনার দায়িত্বপ্রাপ্ত এলাকা</h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
            {admin.division && <span className="bg-gray-100 px-3 py-1 rounded">বিভাগ: <b>{admin.division}</b></span>}
            {admin.district && <span className="bg-gray-100 px-3 py-1 rounded">জেলা: <b>{admin.district}</b></span>}
            {admin.upazila && <span className="bg-gray-100 px-3 py-1 rounded">উপজেলা: <b>{admin.upazila}</b></span>}
            {admin.union && <span className="bg-gray-100 px-3 py-1 rounded">ইউনিয়ন: <b>{admin.union}</b></span>}
            {!admin.division && <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded font-medium">সম্পূর্ণ বাংলাদেশ (সেন্ট্রাল)</span>}
          </div>
        </div>

        {/* স্ট্যাটিসটিক্স কার্ডস */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">মোট অর্ডার</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">০ টি</h3>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">সক্রিয় বিক্রেতা (Seller)</p>
            <h3 className="text-2xl font-bold text-green-600 mt-1">০ জন</h3>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">ডেলিভারি রাইডার</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">০ জন</h3>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">পেন্ডিং অনুমোদন</p>
            <h3 className="text-2xl font-bold text-orange-500 mt-1">০ টি</h3>
          </div>
        </div>

        {/* সাম্প্রতিক কার্যক্রমের জায়গা */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">সাম্প্রতিক অর্ডার ও কার্যক্রম</h3>
          <p className="text-gray-500 text-sm">আপনার এলাকার ডাটা এখানে লোড হবে...</p>
        </div>

      </main>
    </div>
  );
}
