// src/components/admin/SalaryPaymentClient.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLE_LABELS = {
  super_admin: 'সুপার অ্যাডমিন',
  division_admin: 'বিভাগীয় অ্যাডমিন',
  district_admin: 'জেলা অ্যাডমিন',
  upazila_admin: 'উপজেলা অ্যাডমিন',
  union_admin: 'ইউনিয়ন অ্যাডমিন',
  seller: 'সেলার',
  rider: 'ডেলিভারি রাইডার',
};

export default function SalaryPaymentClient({ selectedStaff, initialHistory }) {
  const router = useRouter();
  const [month, setMonth] = useState('নভেম্বর ২০২৬');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePaySalary = async (e) => {
    e.preventDefault();
    if (!selectedStaff) {
      return alert('দয়া করে ইউজার তালিকা থেকে একজন স্টাফ সিলেক্ট করুন');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'expense',
          title: `মাসিক স্যালারি (${month}) - ${ROLE_LABELS[selectedStaff.role] || selectedStaff.role}`,
          amount: Number(amount),
          partyName: `${selectedStaff.name}${selectedStaff.customId ? ` (${selectedStaff.customId})` : ''}`,
          partyPhone: selectedStaff.phone || '',
          note: note || `${month} মাসের স্যালারি পরিশোধ`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(`${selectedStaff.name}-এর স্যালারি সফলভাবে প্রদান করা হয়েছে!`);
      setAmount('');
      setNote('');
      router.refresh();
    } catch (err) {
      alert(err.message || 'স্যালারি প্রদান ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {selectedStaff ? (
        <form
          onSubmit={handlePaySalary}
          className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-emerald-200 space-y-4"
        >
          <div className="border-b pb-3">
            <p className="text-xs text-gray-500">প্রাপকের বিস্তারিত তথ্য:</p>
            <h2 className="text-base sm:text-lg font-bold text-gray-800 flex flex-wrap items-center gap-2 mt-0.5">
              {selectedStaff.name}
              {selectedStaff.customId && (
                <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">
                  {selectedStaff.customId}
                </span>
              )}
            </h2>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              পদবি: {ROLE_LABELS[selectedStaff.role] || selectedStaff.role} • ফোন: {selectedStaff.phone || 'নম্বর নেই'}
            </p>
            {(selectedStaff.division || selectedStaff.district || selectedStaff.upazila || selectedStaff.union) && (
              <p className="text-xs text-gray-500 mt-0.5">
                📍 এলাকা: {[selectedStaff.union, selectedStaff.upazila, selectedStaff.district, selectedStaff.division].filter(Boolean).join(', ')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                কোন মাসের স্যালারি *
              </label>
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                স্যালারির পরিমাণ (৳) *
              </label>
              <input
                type="number"
                placeholder="যেমন: 10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
                className="w-full px-3 py-2 text-sm border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                পেমেন্ট মাধ্যম / নোট
              </label>
              <input
                type="text"
                placeholder="বিকাশ / নগদ / ব্যাংক / ক্যাশ"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'প্রদান করা হচ্ছে...' : '✅ স্যালারি কনফার্ম করুন'}
          </button>
        </form>
      ) : (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs sm:text-sm text-amber-800">
          কোনো স্টাফ সিলেক্ট করা হয়নি। ইউজার তালিকা থেকে নির্দিষ্ট অ্যাডমিন বা রাইডারের নামের পাশে <b>💰 স্যালারি</b> বাটনে ক্লিক করে আসুন।
        </div>
      )}

      {/* স্যালারি প্রদানের ইতিহাস (মোবাইল ও ডেস্কটপ রেসপনসিভ) */}
      <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-base font-bold text-gray-800 mb-3">
          📋 সাম্প্রতিক স্যালারি প্রদানের তালিকা
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-xs text-gray-600">
                <th className="py-2.5 px-3">বিবরণ</th>
                <th className="py-2.5 px-3">প্রাপক</th>
                <th className="py-2.5 px-3">পরিমাণ</th>
                <th className="py-2.5 px-3">প্রদানকারী</th>
                <th className="py-2.5 px-3">তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-5 text-center text-xs text-gray-400">
                    এখনো কোনো স্যালারি প্রদানের রেকর্ড নেই
                  </td>
                </tr>
              ) : (
                initialHistory.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-gray-800">{item.title}</p>
                      {item.note && <p className="text-xs text-gray-500">{item.note}</p>}
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-gray-800">{item.partyName}</p>
                      {item.partyPhone && <p className="text-xs text-gray-500">{item.partyPhone}</p>}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600 whitespace-nowrap">
                      ৳{Number(item.amount).toLocaleString('bn-BD')}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-gray-600">{item.creatorName}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-400 whitespace-nowrap">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('bn-BD') : ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
