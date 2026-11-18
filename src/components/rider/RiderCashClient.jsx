// src/components/rider/RiderCashClient.jsx
'use client';

import { useState } from 'react';

// ডেমো সেলার তালিকা (বাস্তবে আপনার Seller মডেল থেকে ফেচ করবেন)
const SELLERS_LIST = [
  { id: 'seller_001', name: 'ভৈরব ফ্রেশ বাজার স্টোর' },
  { id: 'seller_002', name: 'মেঘনা অর্গানিক শপ' },
];

export default function RiderCashClient({ initialWallet, initialHistory }) {
  const [wallet] = useState(initialWallet);
  const [history, setHistory] = useState(initialHistory);

  const [selectedSellerId, setSelectedSellerId] = useState(SELLERS_LIST[0].id);
  const [amount, setAmount] = useState('');
  const [referenceNote, setReferenceNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleHandoverSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (numAmount <= 0 || numAmount > wallet.cashInHand) {
      alert('সঠিক টাকার পরিমাণ লিখুন।');
      return;
    }

    const sellerObj = SELLERS_LIST.find((s) => s.id === selectedSellerId);
    setLoading(true);

    try {
      const res = await fetch('/api/rider/cash-handover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riderId: wallet.riderId,
          riderName: wallet.riderName,
          sellerId: sellerObj.id,
          sellerName: sellerObj.name,
          amount: numAmount,
          referenceNote,
        }),
      });

      const result = await res.json();
      if (result.success) {
        const newEntry = {
          _id: Date.now().toString(),
          sellerName: sellerObj.name,
          amount: numAmount,
          referenceNote: referenceNote || '-',
          status: 'pending_seller',
          createdAt: 'আজ',
        };
        setHistory([newEntry, ...history]);
        setAmount('');
        setReferenceNote('');
        alert(result.message);
      } else {
        alert(result.message || 'সমস্যা হয়েছে।');
      }
    } catch (err) {
      alert('সার্ভার এরর হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ১. ক্যাশ সামারি কার্ড */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-amber-600 text-white p-6 rounded-2xl shadow-sm">
          <p className="text-amber-100 text-sm font-medium">হাতে জমা থাকা COD ক্যাশ (বকেয়া)</p>
          <h2 className="text-3xl font-extrabold mt-2">৳{wallet.cashInHand.toLocaleString()}</h2>
          <p className="text-xs text-amber-100 mt-2">সেলারকে বুঝিয়ে দিয়ে অ্যাডমিন ভেরিফাই হলে মাইনাস হবে</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">সর্বমোট সেলারকে পরিশোধিত (Verified)</p>
          <h2 className="text-3xl font-bold text-emerald-600 mt-2">৳{wallet.totalHandedOver.toLocaleString()}</h2>
          <p className="text-xs text-gray-400 mt-2">অ্যাডমিন কর্তৃক ভেরিফায়েড মোট টাকা</p>
        </div>
      </div>

      {/* ২. ক্যাশ জমা দেওয়ার ফর্ম ও হিস্ট্রি */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mb-4">সেলারকে ক্যাশ দিন</h3>
          <form onSubmit={handleHandoverSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">সেলার নির্বাচন করুন</label>
              <select
                value={selectedSellerId}
                onChange={(e) => setSelectedSellerId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              >
                {SELLERS_LIST.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.name} ({seller.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">টাকার পরিমাণ</label>
              <input
                type="number"
                required
                min="1"
                max={wallet.cashInHand}
                placeholder="যেমন: 1500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">অর্ডার নম্বর বা নোট (ঐচ্ছিক)</label>
              <input
                type="text"
                placeholder="যেমন: অর্ডার #1045 এর ক্যাশ"
                value={referenceNote}
                onChange={(e) => setReferenceNote(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || wallet.cashInHand <= 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-lg text-sm transition"
            >
              {loading ? 'পাঠানো হচ্ছে...' : 'সেলারের কাছে রিকোয়েস্ট পাঠান'}
            </button>
          </form>
        </div>

        {/* ডান পাশ: হ্যান্ডওভার হিস্ট্রি */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mb-4">ক্যাশ হ্যান্ডওভার স্ট্যাটাস</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase">
                  <th className="py-3 px-3">তারিখ ও সেলার</th>
                  <th className="py-3 px-3">নোট</th>
                  <th className="py-3 px-3">পরিমাণ</th>
                  <th className="py-3 px-3">বর্তমান ধাপ</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {history.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-gray-900">{item.sellerName || 'সেলার'}</p>
                      <p className="text-xs text-gray-500">{item.createdAt}</p>
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-600">{item.referenceNote}</td>
                    <td className="py-3 px-3 font-bold text-gray-900">৳{item.amount.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      {item.status === 'pending_seller' && (
                        <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                          ১. সেলারের সিগনেচার বাকি
                        </span>
                      )}
                      {item.status === 'seller_approved' && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                          ২. অ্যাডমিন ভেরিফিকেশন বাকি
                        </span>
                      )}
                      {item.status === 'admin_verified' && (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                          ৩. সম্পন্ন ও মাইনাস হয়েছে
                        </span>
                      )}
                      {item.status === 'rejected' && (
                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                          বাতিল
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
