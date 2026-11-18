// src/components/admin/AdminRiderCashClient.jsx
'use client';

import { useState } from 'react';

export default function AdminRiderCashClient({ initialHandovers, adminName }) {
  const [handovers, setHandovers] = useState(initialHandovers);
  const [filter, setFilter] = useState('seller_approved'); // যেগুলো সেলার সিগনেচার দিয়েছে সেগুলো আগে দেখাবে
  const [loadingId, setLoadingId] = useState(null);

  const filteredList = handovers.filter((item) =>
    filter === 'all' ? true : item.status === filter
  );

  const handleAdminVerify = async (handoverId, action) => {
    setLoadingId(handoverId);
    try {
      const res = await fetch('/api/rider/cash-handover', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handoverId, action, adminName }),
      });

      const result = await res.json();
      if (result.success) {
        setHandovers((prev) =>
          prev.map((item) =>
            item._id === handoverId
              ? {
                  ...item,
                  status: action === 'admin_verify' ? 'admin_verified' : 'rejected',
                  verifiedByAdmin: adminName,
                }
              : item
          )
        );
        alert(result.message);
      } else {
        alert(result.message);
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <div className="flex flex-wrap gap-2 border-b pb-4 mb-5">
        {[
          { id: 'seller_approved', label: '✍️ সেলার অ্যাপ্রুভড (ভেরিফিকেশন বাকি)' },
          { id: 'pending_seller', label: '⏳ সেলারের সিগনেচার বাকি' },
          { id: 'admin_verified', label: '✅ ভেরিফায়েড ও মাইনাসকৃত' },
          { id: 'all', label: '📋 সব' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              filter === tab.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase">
              <th className="py-3 px-4">রাইডার ও সেলার</th>
              <th className="py-3 px-4">পরিমাণ</th>
              <th className="py-3 px-4">সেলারের সিগনেচার</th>
              <th className="py-3 px-4">স্ট্যাটাস</th>
              <th className="py-3 px-4 text-right">অ্যাডমিন অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {filteredList.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-gray-900">রাইডার: {item.riderName}</p>
                  <p className="text-xs text-emerald-700 font-medium">সেলার: {item.sellerName}</p>
                  <p className="text-xs text-gray-400">{item.createdAt}</p>
                </td>
                <td className="py-3.5 px-4 font-bold text-gray-900 text-base">৳{item.amount.toLocaleString()}</td>
                <td className="py-3.5 px-4">
                  {item.sellerSignature ? (
                    <img
                      src={item.sellerSignature}
                      alt="Seller Signature"
                      className="h-12 w-28 object-contain border rounded bg-gray-50 p-1"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">সিগনেচার নেই</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  {item.status === 'seller_approved' && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                      সেলার স্বাক্ষরিত
                    </span>
                  )}
                  {item.status === 'admin_verified' && (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                      ভেরিফায়েড ও মাইনাস হয়েছে
                    </span>
                  )}
                  {item.status === 'pending_seller' && (
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                      সেলার পেন্ডিং
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  {item.status === 'seller_approved' ? (
                    <div className="flex justify-end gap-2">
                      <button
                        disabled={loadingId === item._id}
                        onClick={() => {
                          if (confirm('সিগনেচার যাচাই করে রাইডারের ব্যালেন্স থেকে টাকা মাইনাস করতে চান?')) {
                            handleAdminVerify(item._id, 'admin_verify');
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                      >
                        Approve & মাইনাস
                      </button>
                      <button
                        disabled={loadingId === item._id}
                        onClick={() => handleAdminVerify(item._id, 'reject')}
                        className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
