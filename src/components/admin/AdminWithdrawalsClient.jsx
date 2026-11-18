// src/components/admin/AdminWithdrawalsClient.jsx
'use client';

import { useState } from 'react';

export default function AdminWithdrawalsClient({ initialWithdrawals }) {
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [filter, setFilter] = useState('pending');
  const [selectedItem, setSelectedItem] = useState(null);
  const [trxId, setTrxId] = useState('');
  const [loadingId, setLoadingId] = useState(null);

  const filteredList = withdrawals.filter((item) =>
    filter === 'all' ? true : item.status === filter
  );

  const handleAction = async (withdrawalId, action, transactionId = '') => {
    setLoadingId(withdrawalId);
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId, action, transactionId }),
      });

      const result = await res.json();
      if (result.success) {
        setWithdrawals((prev) =>
          prev.map((item) =>
            item._id === withdrawalId
              ? {
                  ...item,
                  status: action === 'approve' ? 'approved' : 'rejected',
                  transactionId: action === 'approve' ? transactionId : item.transactionId,
                }
              : item
          )
        );
        setSelectedItem(null);
        setTrxId('');
        alert(result.message);
      } else {
        alert(result.message || 'সমস্যা হয়েছে।');
      }
    } catch (err) {
      alert('সার্ভার এরর হয়েছে।');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      {/* ফিল্টার ট্যাব */}
      <div className="flex flex-wrap gap-2 border-b pb-4 mb-5">
        {[
          { id: 'pending', label: '⏳ অপেক্ষমাণ (Pending)' },
          { id: 'approved', label: '✅ অনুমোদিত (Approved)' },
          { id: 'rejected', label: '❌ বাতিল (Rejected)' },
          { id: 'all', label: '📋 সব রিকোয়েস্ট' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              filter === tab.id
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* রেসপনসিভ টেবিল */}
      {filteredList.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          এই ক্যাটাগরিতে কোনো উইথড্রয়াল রিকোয়েস্ট পাওয়া যায়নি।
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="py-3 px-4">তারিখ ও সেলার</th>
                <th className="py-3 px-4">পেমেন্ট মাধ্যম ও নম্বর</th>
                <th className="py-3 px-4">পরিমাণ</th>
                <th className="py-3 px-4">স্ট্যাটাস / TrxID</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {filteredList.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-gray-900">{item.sellerId}</p>
                    <p className="text-xs text-gray-500">{item.createdAt}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block bg-gray-100 text-gray-800 text-xs font-bold px-2 py-0.5 rounded">
                      {item.method}
                    </span>
                    <p className="text-xs text-gray-600 mt-1">{item.accountDetails}</p>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-900 text-base">
                    ৳{item.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    {item.status === 'pending' && (
                      <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                        অপেক্ষমাণ
                      </span>
                    )}
                    {item.status === 'approved' && (
                      <div>
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                          পেইড (Paid)
                        </span>
                        <p className="text-xs font-mono text-gray-600 mt-1">Trx: {item.transactionId}</p>
                      </div>
                    )}
                    {item.status === 'rejected' && (
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                        বাতিল ও রিফান্ডেড
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {item.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={loadingId === item._id}
                          onClick={() => {
                            setSelectedItem(item);
                            setTrxId('');
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          Approve
                        </button>
                        <button
                          disabled={loadingId === item._id}
                          onClick={() => {
                            if (confirm('আপনি কি নিশ্চিতভাবে এই রিকোয়েস্টটি বাতিল করে টাকা সেলারকে ফেরত দিতে চান?')) {
                              handleAction(item._id, 'reject');
                            }
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">সম্পন্ন</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approve করার জন্য TrxID ইনপুট মডাল */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">পেআউট অনুমোদন (Approve)</h3>
            <p className="text-xs text-gray-600 mt-1">
              <strong>{selectedItem.method}</strong> ({selectedItem.accountDetails}) নম্বরে{' '}
              <strong>৳{selectedItem.amount}</strong> পাঠানোর পর নিচে Transaction ID দিন।
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Transaction ID (TrxID) *
              </label>
              <input
                type="text"
                placeholder="যেমন: BKH89A72XC"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                বন্ধ করুন
              </button>
              <button
                disabled={!trxId.trim() || loadingId === selectedItem._id}
                onClick={() => handleAction(selectedItem._id, 'approve', trxId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 rounded-lg"
              >
                {loadingId === selectedItem._id ? 'সেভ হচ্ছে...' : 'কনফার্ম ও পেইড করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
