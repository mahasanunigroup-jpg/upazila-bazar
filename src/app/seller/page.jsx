// /src/app/seller/page.jsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function SellerOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/seller/stats");
        
        // 🚀 ফিক্স: রেসপন্স টাইপ JSON কিনা কঠোরভাবে চেক করা
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const statsData = await res.json();
          if (statsData.success) {
            setData(statsData);
          }
        } else {
          console.warn("API returned non-JSON response (Likely a redirect or HTML error page).");
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-xl font-semibold text-emerald-600 animate-pulse">ড্যাশবোর্ড লোড হচ্ছে...</p>
      </div>
    );
  }

  // ডাটাবেজে ডাটা না থাকলে সেফ ফলব্যাক অবজেক্ট রেন্ডার হবে
  const stats = data?.stats || { dailySales: 0, dailyOrders: 0, monthlySales: 0, monthlyOrders: 0, yearlySales: 0, yearlyOrders: 0 };
  const commission = data?.commission || { percentage: 10, adminShare: 0, sellerShare: 0 };

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-5xl mx-auto space-y-6">
      
      {/* হেডার ব্যানার */}
      <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
        <h1 className="text-2xl font-bold text-gray-800">দোকানদার ড্যাশবোর্ড (ওভারভিউ)</h1>
        <p className="text-xs text-orange-600 mt-1">বাজার এরিয়া: Savar, Dhaka</p>
      </div>

      {/* সেলস সামারি গ্রিড */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Daily */}
        <div className="bg-white p-5 rounded-xl shadow-sm border-t-4 border-amber-500 space-y-2">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">আজকের বিবরণ (DAILY)</p>
          <div className="flex justify-between items-baseline">
            <p className="text-2xl font-bold text-gray-900">৳{Number(stats.dailySales).toLocaleString()}</p>
            <p className="text-sm text-gray-500 font-medium">{stats.dailyOrders} টি অর্ডার</p>
          </div>
        </div>

        {/* Monthly */}
        <div className="bg-white p-5 rounded-xl shadow-sm border-t-4 border-emerald-500 space-y-2">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">চলতি মাস (MONTHLY)</p>
          <div className="flex justify-between items-baseline">
            <p className="text-2xl font-bold text-gray-900">৳{Number(stats.monthlySales).toLocaleString()}</p>
            <p className="text-sm text-gray-500 font-medium">{stats.monthlyOrders} টি অর্ডার</p>
          </div>
        </div>

        {/* Yearly */}
        <div className="bg-white p-5 rounded-xl shadow-sm border-t-4 border-blue-500 space-y-2">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">এই বছরের বিবরণ (YEARLY)</p>
          <div className="flex justify-between items-baseline">
            <p className="text-2xl font-bold text-gray-900">৳{Number(stats.yearlySales).toLocaleString()}</p>
            <p className="text-sm text-gray-500 font-medium">{stats.yearlyOrders} টি অর্ডার</p>
          </div>
        </div>

      </div>

      {/* রেভিনিউ শেয়ারিং */}
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          📊 চলতি মাসের রেভিনিউ শেয়ারিং (এডমিন কমিশন: {commission.percentage}%)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <p className="text-xs text-red-600 font-semibold">ওয়েবসাইট এডমিন লভ্যাংশ</p>
            <p className="text-2xl font-bold text-red-700 mt-1">৳{Number(commission.adminShare).toLocaleString()}</p>
            <p className="text-[10px] text-red-500 mt-1">*এটি প্ল্যাটফর্ম ফি হিসেবে অটো-ডিডাক্টেড হবে।</p>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <p className="text-xs text-emerald-600 font-semibold">দোকানদারের নিজস্ব নীট আয়</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">৳{Number(commission.sellerShare).toLocaleString()}</p>
            <p className="text-[10px] text-emerald-500 mt-1">*কমিশন বাদে আপনার অ্যাকাউন্টে স্থানান্তরিত হবে।</p>
          </div>
        </div>
      </div>

      {/* নেভিগেশন লিংক */}
      <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-gray-600 text-sm">আপনার দোকানের ইনভেন্টরি, স্টক এবং নতুন প্রোডাক্ট যোগ করতে চান?</p>
        <Link 
          href="/seller/products" 
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition shadow-sm"
        >
          📦 প্রোডাক্ট ম্যানেজমেন্টে যান
        </Link>
      </div>

    </div>
  );
}
