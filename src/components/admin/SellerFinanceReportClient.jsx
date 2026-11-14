"use client";

import { useState, useMemo } from "react";

export default function SellerFinanceReportClient({ orders, commissionPercent }) {
  const [period, setPeriod] = useState("daily"); // 'daily' | 'monthly' | 'yearly' | 'all'

  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      if (period === "daily") {
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }
      if (period === "monthly") {
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }
      if (period === "yearly") {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [orders, period]);

  const totalSales = filteredOrders.reduce((sum, o) => sum + o.sales, 0);
  const totalCommission = Math.round((totalSales * commissionPercent) / 100);
  const netPayable = totalSales - totalCommission;

  const periodLabels = {
    daily: "আজকের (Daily)",
    monthly: "চলতি মাসের (Monthly)",
    yearly: "চলতি বছরের (Yearly)",
    all: "সর্বমোট (All Time)",
  };

  return (
    <div className="space-y-6">
      {/* সময় ফিল্টার ট্যাব */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "daily", label: "📅 আজকের (Daily)" },
          { key: "monthly", label: "🗓️ এই মাসের (Monthly)" },
          { key: "yearly", label: "📆 এই বছরের (Yearly)" },
          { key: "all", label: "📊 সর্বমোট (All Time)" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setPeriod(tab.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              period === tab.key
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ৪টি সামারি কার্ড */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">{periodLabels[period]} অর্ডার</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {filteredOrders.length} টি
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">{periodLabels[period]} বিক্রি</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            ৳{totalSales.toLocaleString("bn-BD")}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-200 bg-emerald-50/30">
          <p className="text-xs text-emerald-700">
            প্ল্যাটফর্ম কমিশন ({commissionPercent}%)
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            ৳{totalCommission.toLocaleString("bn-BD")}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">সেলার নিট পাওনা</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            ৳{netPayable.toLocaleString("bn-BD")}
          </p>
        </div>
      </div>

      {/* অর্ডার তালিকা টেবিল */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-sm">
            এই সময়ের মধ্যে কোনো ডেলিভারড অর্ডার পাওয়া যায়নি।
          </p>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600">
                <th className="py-3 px-4">অর্ডার আইডি</th>
                <th className="py-3 px-4">তারিখ ও সময়</th>
                <th className="py-3 px-4">ক্রেতা</th>
                <th className="py-3 px-4">মোট বিক্রি</th>
                <th className="py-3 px-4">কমিশন ({commissionPercent}%)</th>
                <th className="py-3 px-4 text-right">নিট পাওনা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((o) => {
                const comm = Math.round((o.sales * commissionPercent) / 100);
                const net = o.sales - comm;
                return (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      #{o.orderId}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString("bn-BD", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{o.customerName}</td>
                    <td className="py-3 px-4 font-medium">৳{o.sales}</td>
                    <td className="py-3 px-4 text-emerald-600">৳{comm}</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-600">
                      ৳{net}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
