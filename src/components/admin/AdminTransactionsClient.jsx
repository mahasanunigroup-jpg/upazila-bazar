// src/components/admin/AdminTransactionsClient.jsx
'use client';

import { useState } from 'react';

export default function AdminTransactionsClient({ transactions, summary }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'COD_HANDOVER' | 'SELLER_PAYOUT'
  const [viewSignature, setViewSignature] = useState(null);

  // নাম, আইডি বা TrxID দিয়ে রিয়েল-টাইম সার্চ ও ফিল্টার
  const filteredData = transactions.filter((item) => {
    const matchesType = typeFilter === 'ALL' ? true : item.type === typeFilter;
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      item.fromName.toLowerCase().includes(query) ||
      item.toName.toLowerCase().includes(query) ||
      item.reference.toLowerCase().includes(query) ||
      item.method.toLowerCase().includes(query);

    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ১. সামারি কার্ডস */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">রাইডার থেকে সেলার (Verified COD)</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
            ৳{summary.totalCodVerified.toLocaleString()}
          </h3>
          <p className="text-xs text-gray-400 mt-1">সেলার সিগনেচার ও অ্যাডমিন ভেরিফায়েড</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">সেলারকে মোট পেআউট (Paid)</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-1">
            ৳{summary.totalSellerPaid.toLocaleString()}
          </h3>
          <p className="text-xs text-gray-400 mt-1">bKash/Nagad/Bank-এ পরিশোধিত</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">সর্বমোট লেনদেন সংখ্যা</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mt-1">
            {summary.totalCount} টি
          </h3>
          <p className="text-xs text-gray-400 mt-1">সকল রেকর্ড সংরক্ষিত আছে</p>
        </div>
      </div>

      {/* ২. সার্চ ও ফিল্টার বার */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between gap-3 pb-4 border-b mb-5">
          {/* ফিল্টার বাটন */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: '📋 সব লেনদেন' },
              { id: 'COD_HANDOVER', label: '🛵 রাইডার → সেলার (COD)' },
              { id: 'SELLER_PAYOUT', label: '💸 সেলার উইথড্রয়াল' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                  typeFilter === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* সার্চ ইনপুট */}
          <input
            type="text"
            placeholder="রাইডার, সেলারের নাম বা TrxID খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-72 border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* ৩. মাস্টার লেনদেন টেবিল */}
        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            কোনো লেনদেনের তথ্য পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase">
                  <th className="py-3 px-3">তারিখ ও ধরন</th>
                  <th className="py-3 px-3">কে দিয়েছে (From)</th>
                  <th className="py-3 px-3">কে পেয়েছে (To)</th>
                  <th className="py-3 px-3">পরিমাণ</th>
                  <th className="py-3 px-3">মাধ্যম ও নোট</th>
                  <th className="py-3 px-3">প্রমাণ / সিগনেচার</th>
                  <th className="py-3 px-3">স্ট্যাটাস ও অ্যাডমিন</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          item.type === 'COD_HANDOVER'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {item.type === 'COD_HANDOVER' ? 'COD হ্যান্ডওভার' : 'সেলার পেআউট'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                    </td>

                    <td className="py-3.5 px-3 font-medium text-gray-800">{item.fromName}</td>
                    <td className="py-3.5 px-3 font-semibold text-emerald-700">{item.toName}</td>
                    <td className="py-3.5 px-3 font-bold text-gray-900 text-base">
                      ৳{item.amount.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-3">
                      <p className="text-xs font-semibold text-gray-700">{item.method}</p>
                      <p className="text-xs text-gray-500">{item.reference}</p>
                    </td>

                    <td className="py-3.5 px-3">
                      {item.signature ? (
                        <button
                          onClick={() => setViewSignature(item)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-2.5 py-1 rounded border"
                        >
                          ✍️ সিগনেচার দেখুন
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">প্রযোজ্য নয়</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.status === 'admin_verified' || item.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status === 'admin_verified' && 'ভেরিফায়েড'}
                        {item.status === 'approved' && 'পেইড (Paid)'}
                        {item.status === 'seller_approved' && 'সেলার স্বাক্ষরিত'}
                        {item.status === 'pending_seller' && 'সেলার পেন্ডিং'}
                        {item.status === 'pending' && 'অপেক্ষমাণ'}
                        {item.status === 'rejected' && 'বাতিল'}
                      </span>
                      <p className="text-[11px] text-gray-500 mt-1">অ্যাডমিন: {item.verifiedBy}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* সিগনেচার জুম মডাল */}
      {viewSignature && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl text-center">
            <h4 className="font-bold text-gray-900">সেলারের ডিজিটাল সিগনেচার</h4>
            <p className="text-xs text-gray-500 mt-1">
              {viewSignature.toName} — পরিমাণ: ৳{viewSignature.amount}
            </p>
            <div className="my-4 p-3 border rounded-xl bg-gray-50 flex justify-center">
              <img src={viewSignature.signature} alt="Signature" className="max-h-32 object-contain" />
            </div>
            <button
              onClick={() => setViewSignature(null)}
              className="w-full bg-slate-900 text-white text-xs font-semibold py-2.5 rounded-lg"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
