// components/seller/WalletClient.jsx
'use client';

import { useState } from 'react';

export default function WalletClient({ initialWallet, initialHistory }) {
  const [wallet, setWallet] = useState(initialWallet);
  const [history, setHistory] = useState(initialHistory);
  
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bKash');
  const [accountDetails, setAccountDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const numAmount = Number(amount);
    if (numAmount < 500) {
      setErrorMsg('সর্বনিম্ন ৫০০ টাকা উত্তোলন করতে পারবেন।');
      return;
    }
    if (numAmount > wallet.availableBalance) {
      setErrorMsg('আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/seller/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: wallet.sellerId,
          amount: numAmount,
          method,
          accountDetails,
        }),
      });

      const result = await res.json();
      if (result.success) {
        // UI তাৎক্ষণিক আপডেট (Optimistic UI)
        setWallet((prev) => ({
          ...prev,
          availableBalance: prev.availableBalance - numAmount,
        }));

        const newRecord = {
          _id: Date.now().toString(),
          amount: numAmount,
          method,
          accountDetails,
          status: 'pending',
          transactionId: '-',
          createdAt: 'আজ',
        };
        setHistory([newRecord, ...history]);
        setAmount('');
        setAccountDetails('');
        alert('উইথড্রয়াল রিকোয়েস্ট সফলভাবে জমা হয়েছে!');
      } else {
        setErrorMsg(result.message || 'সমস্যা হয়েছে, আবার চেষ্টা করুন।');
      }
    } catch (err) {
      setErrorMsg('সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ১. ব্যালেন্স ওভারভিউ কার্ডস */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-sm">
          <p className="text-emerald-100 text-sm font-medium">উত্তোলনযোগ্য ব্যালেন্স</p>
          <h2 className="text-3xl font-extrabold mt-2">৳{wallet.availableBalance.toLocaleString()}</h2>
          <p className="text-xs text-emerald-100 mt-2">যেকোনো সময় উইথড্র করতে পারবেন</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">পেন্ডিং ব্যালেন্স (ডেলিভারি চলমান)</p>
          <h2 className="text-3xl font-bold text-amber-600 mt-2">৳{wallet.pendingBalance.toLocaleString()}</h2>
          <p className="text-xs text-gray-400 mt-2">কাস্টমার পণ্য বুঝে পেলে যুক্ত হবে</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">মোট উত্তোলিত আয়</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">৳{wallet.totalWithdrawn.toLocaleString()}</h2>
          <p className="text-xs text-gray-400 mt-2">সর্বমোট সফল পেআউট</p>
        </div>
      </div>

      {/* ২. উইথড্রয়াল ফর্ম ও হিস্ট্রি গ্রিড */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* বাম পাশ: উইথড্রয়াল রিকোয়েস্ট ফর্ম */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mb-4">টাকা উত্তোলন (Withdraw)</h3>
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">পেমেন্ট মাধ্যম নির্বাচন করুন</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-emerald-500"
              >
                <option value="bKash">bKash (বিকাশ)</option>
                <option value="Nagad">Nagad (নগদ)</option>
                <option value="Rocket">Rocket (রকেট)</option>
                <option value="Bank">Bank Transfer (ব্যাংক অ্যাকাউন্ট)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {method === 'Bank' ? 'ব্যাংকের নাম, শাখা ও অ্যাকাউন্ট নম্বর' : `${method} পার্সোনাল/এজেন্ট নম্বর`}
              </label>
              <input
                type="text"
                required
                placeholder={method === 'Bank' ? 'যেমন: ইসলামী ব্যাংক, ভৈরব শাখা, A/C: 2050...' : '01XXXXXXXXX'}
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">টাকার পরিমাণ (সর্বনিম্ন ৳৫০০)</label>
              <input
                type="number"
                required
                min="500"
                max={wallet.availableBalance}
                placeholder="যেমন: 2000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || wallet.availableBalance < 500}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-lg text-sm transition"
            >
              {loading ? 'প্রসেসিং হচ্ছে...' : 'উইথড্র রিকোয়েস্ট পাঠান'}
            </button>
          </form>
        </div>

        {/* ডান পাশ: উইথড্রয়াল হিস্ট্রি টেবিল */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mb-4">উইথড্রয়াল হিস্ট্রি</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-xs text-gray-500 uppercase bg-gray-50">
                  <th className="py-3 px-3">তারিখ</th>
                  <th className="py-3 px-3">মাধ্যম ও অ্যাকাউন্ট</th>
                  <th className="py-3 px-3">পরিমাণ</th>
                  <th className="py-3 px-3">TrxID</th>
                  <th className="py-3 px-3">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {history.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{item.createdAt}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-gray-800">{item.method}</span>
                      <p className="text-xs text-gray-500">{item.accountDetails}</p>
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-900">৳{item.amount}</td>
                    <td className="py-3 px-3 text-xs font-mono text-gray-600">{item.transactionId}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status === 'approved' && 'সফল (Paid)'}
                        {item.status === 'pending' && 'অপেক্ষমাণ (Pending)'}
                        {item.status === 'rejected' && 'বাতিল (Rejected)'}
                      </span>
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
