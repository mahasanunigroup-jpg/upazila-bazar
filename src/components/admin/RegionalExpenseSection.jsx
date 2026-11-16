'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLE_NAMES = {
  super_admin: 'সুপার অ্যাডমিন',
  admin: 'সুপার অ্যাডমিন',
  division_admin: 'বিভাগীয় অ্যাডমিন',
  district_admin: 'জেলা অ্যাডমিন',
  upazila_admin: 'উপজেলা অ্যাডমিন',
  union_admin: 'ইউনিয়ন অ্যাডমিন',
};

export default function RegionalExpenseSection({ initialExpenses, isSuper }) {
  const router = useRouter();
  const [expenses, setExpenses] = useState(initialExpenses || []);
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, amount, partyName, partyPhone, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setTitle('');
      setAmount('');
      setPartyName('');
      setPartyPhone('');
      setNote('');
      alert(data.message);
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (expenseId, status) => {
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenseId, status }),
      });
      if (!res.ok) throw new Error('আপডেট ব্যর্থ হয়েছে');

      setExpenses((prev) =>
        prev.map((ex) => (ex._id === expenseId ? { ...ex, status } : ex))
      );
      router.refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenseId: editingItem._id,
          title: editingItem.title,
          partyName: editingItem.partyName,
          amount: Number(editingItem.amount),
          note: editingItem.note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setExpenses((prev) =>
        prev.map((ex) => (ex._id === editingItem._id ? { ...ex, ...data.expense } : ex))
      );
      setEditingItem(null);
      router.refresh();
    } catch (err) {
      alert(err.message);
    }
  };
  const handlePrintVoucher = (item) => {
    const printWindow = window.open('', '_blank', 'width=800,height=650');
    const dateStr = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('bn-BD')
      : new Date().toLocaleDateString('bn-BD');
    printWindow.document.write(`
      <html>
        <head>
          <title>Voucher - ${item.partyName}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1f2937; }
            .box { border: 2px solid #059669; border-radius: 12px; padding: 30px; max-width: 650px; margin: auto; }
            .header { text-align: center; border-bottom: 2px dashed #d1d5db; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #059669; font-size: 24px; }
            .badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; margin-top: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
            td, th { border: 1px solid #e5e7eb; padding: 10px 12px; text-align: left; }
            th { background: #f9fafb; width: 35%; }
            .total { font-size: 18px; font-weight: bold; color: #059669; }
            .sign { display: flex; justify-content: space-between; margin-top: 60px; font-size: 13px; }
            .sign div { border-top: 1px solid #374151; padding-top: 6px; width: 180px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="box">
            <div class="header">
              <h1>উপজেলা বাজার (Upazila Bazar)</h1>
              <p>অফিশিয়াল স্যালারি ও ব্যয় ভাউচার (Salary / Payment Sheet)</p>
              <span class="badge">✅ অনুমোদিত (APPROVED BY SUPER ADMIN)</span>
            </div>
            <table>
              <tr><th>ভাউচার আইডি</th><td>#${item._id.slice(-8).toUpperCase()}</td></tr>
              <tr><th>তারিখ</th><td>${dateStr}</td></tr>
              <tr><th>প্রাপকের নাম</th><td><strong>${item.partyName}</strong></td></tr>
              <tr><th>মোবাইল নম্বর</th><td>${item.partyPhone || '—'}</td></tr>
              <tr><th>বিবরণ</th><td>${item.title}</td></tr>
              <tr><th>নোট / মাধ্যম</th><td>${item.note || '—'}</td></tr>
              <tr><th>এন্ট্রি করেছেন</th><td>${item.creatorName}</td></tr>
              <tr><th>মোট টাকা</th><td class="total">৳ ${Number(item.amount).toLocaleString('bn-BD')} /-</td></tr>
            </table>
            <div class="sign">
              <div>প্রাপকের স্বাক্ষর</div>
              <div>অনুমোদনকারী (সুপার অ্যাডমিন)</div>
            </div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 space-y-5">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-gray-800">
          📒 আঞ্চলিক আয়-ব্যয় লেজার ও অটো-রিপোর্ট
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          যেকোনো আয় বা ব্যয় এন্ট্রি করলে প্রাপক/দাতা ও অ্যাডমিনের বিস্তারিত তথ্যসহ সরাসরি সুপার অ্যাডমিনের কাছে চলে যাবে
        </p>
      </div>

      {/* এডিট পপআপ মোডাল */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-xl p-5 max-w-md w-full space-y-3 shadow-xl">
            <h3 className="font-bold text-gray-800 text-base border-b pb-2">✏️ লেনদেন / স্যালারি এডিট করুন</h3>
            <div>
              <label className="text-xs font-semibold text-gray-600">খাতের নাম</label>
              <input
                type="text"
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-lg mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">প্রাপকের নাম</label>
              <input
                type="text"
                value={editingItem.partyName}
                onChange={(e) => setEditingItem({ ...editingItem, partyName: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-lg mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">টাকার পরিমাণ (৳)</label>
              <input
                type="number"
                value={editingItem.amount}
                onChange={(e) => setEditingItem({ ...editingItem, amount: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-lg mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">নোট</label>
              <input
                type="text"
                value={editingItem.note}
                onChange={(e) => setEditingItem({ ...editingItem, note: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-lg mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-1.5 text-xs bg-gray-100 rounded-lg">
                বাতিল
              </button>
              <button type="submit" className="px-4 py-1.5 text-xs bg-emerald-600 text-white font-bold rounded-lg">
                সেভ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* নতুন আয়/ব্যয় এন্ট্রি ফর্ম */}
      <form
        onSubmit={handleAddTransaction}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 bg-gray-50 p-3.5 sm:p-4 rounded-xl border"
      >
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 text-sm font-semibold border rounded-lg bg-white"
        >
          <option value="expense">💸 ব্যয় (খরচ)</option>
          <option value="income">💰 অতিরিক্ত আয়</option>
        </select>

        <input
          type="text"
          placeholder="খাতের নাম (যেমন: রাইডার পেমেন্ট)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="px-3 py-2 text-sm border rounded-lg bg-white"
        />

        <input
          type="text"
          placeholder={type === 'expense' ? 'যাকে দিচ্ছেন তার নাম *' : 'যার থেকে নিচ্ছেন তার নাম *'}
          value={partyName}
          onChange={(e) => setPartyName(e.target.value)}
          required
          className="px-3 py-2 text-sm border rounded-lg bg-white"
        />

        <input
          type="text"
          placeholder="প্রাপক/দাতার ফোন নম্বর"
          value={partyPhone}
          onChange={(e) => setPartyPhone(e.target.value)}
          className="px-3 py-2 text-sm border rounded-lg bg-white"
        />

        <input
          type="number"
          placeholder="টাকার পরিমাণ (৳) *"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="1"
          className="px-3 py-2 text-sm border rounded-lg bg-white"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition cursor-pointer disabled:opacity-50"
        >
          {loading ? 'পাঠানো হচ্ছে...' : '+ জমা দিন'}
        </button>

        <input
          type="text"
          placeholder="বিস্তারিত মন্তব্য বা ভাউচার নম্বর (ঐচ্ছিক)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="sm:col-span-2 lg:col-span-6 px-3 py-2 text-xs border rounded-lg bg-white"
        />
      </form>
      {/* 📱 মোবাইল ভিউ: স্ক্রলবার ছাড়াই সুন্দর কার্ড ডিজাইন */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {expenses.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400">
            এখনো কোনো আয়-ব্যয়ের লেনদেন রেকর্ড করা হয়নি
          </p>
        ) : (
          expenses.map((ex) => {
            const areaText = [ex.union, ex.upazila, ex.district, ex.division]
              .filter(Boolean)
              .join(', ');

            return (
              <div key={ex._id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/40 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ex.type === 'income'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {ex.type === 'income' ? 'আয়' : 'ব্যয়'}
                    </span>
                    <h4 className="font-bold text-gray-800 text-sm mt-1">{ex.title}</h4>
                    {ex.note && <p className="text-xs text-gray-500">নোট: {ex.note}</p>}
                  </div>

                  <p className={`text-base font-bold shrink-0 ${ex.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {ex.type === 'income' ? '+' : '-'} ৳{Number(ex.amount).toLocaleString('bn-BD')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400">এন্ট্রি করেছেন:</p>
                    <p className="font-semibold text-gray-800">{ex.creatorName}</p>
                    <p className="text-[11px] text-indigo-600">{ROLE_NAMES[ex.creatorRole] || ex.creatorRole}</p>
                    {areaText && <p className="text-[10px] text-gray-500">📍 {areaText}</p>}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">প্রাপক / দাতা:</p>
                    <p className="font-semibold text-gray-800">{ex.partyName}</p>
                    {ex.partyPhone && <p className="text-[11px] text-gray-500">📞 {ex.partyPhone}</p>}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  <div>
                    {ex.status === 'approved' ? (
                      <span className="px-2.5 py-0.5 text-[11px] bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                        ✅ অনুমোদিত
                      </span>
                    ) : ex.status === 'rejected' ? (
                      <span className="px-2.5 py-0.5 text-[11px] bg-red-100 text-red-700 rounded-full font-semibold">
                        বাতিলকৃত
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-[11px] bg-amber-100 text-amber-700 rounded-full font-semibold">
                        ⏳ পেন্ডিং
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ex.status === 'approved' && (
                      <button
                        onClick={() => handlePrintVoucher(ex)}
                        className="px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg"
                      >
                        🖨️ প্রিন্ট
                      </button>
                    )}
                    {isSuper && (
                      <>
                        {ex.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(ex._id, 'approved')}
                            className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
                          >
                            ✅ অ্যাপ্রুভ
                          </button>
                        )}
                        <button
                          onClick={() => setEditingItem(ex)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg"
                        >
                          ✏️ এডিট
                        </button>
                        {ex.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(ex._id, 'rejected')}
                            className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-lg"
                          >
                            বাতিল
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* 💻 ডেস্কটপ ভিউ: পরিচ্ছন্ন টেবিল */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 text-xs">
              <th className="py-3 px-3">তারিখ ও খাত</th>
              <th className="py-3 px-3">যে অ্যাডমিন এন্ট্রি করেছেন</th>
              <th className="py-3 px-3">যাকে দেওয়া / যার থেকে নেওয়া হয়েছে</th>
              <th className="py-3 px-3">পরিমাণ</th>
              <th className="py-3 px-3">অবস্থা</th>
              <th className="py-3 px-3 text-right">অ্যাকশন ও প্রিন্ট</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-6 text-center text-xs text-gray-400">
                  এখনো কোনো আয়-ব্যয়ের লেনদেন রেকর্ড করা হয়নি
                </td>
              </tr>
            ) : (
              expenses.map((ex) => {
                const areaText = [ex.union, ex.upazila, ex.district, ex.division]
                  .filter(Boolean)
                  .join(', ');

                return (
                  <tr key={ex._id} className="hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          ex.type === 'income'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {ex.type === 'income' ? 'আয়' : 'ব্যয়'}
                      </span>
                      <p className="font-semibold text-gray-800 mt-1">{ex.title}</p>
                      {ex.note && <p className="text-xs text-gray-500">নোট: {ex.note}</p>}
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-semibold text-gray-800">{ex.creatorName}</p>
                      <p className="text-xs text-indigo-600 font-medium">
                        {ROLE_NAMES[ex.creatorRole] || ex.creatorRole}
                      </p>
                      <p className="text-[11px] text-gray-500">📍 {areaText || 'সেন্ট্রাল'}</p>
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-semibold text-gray-800">{ex.partyName}</p>
                      {ex.partyPhone && <p className="text-xs text-gray-500">📞 {ex.partyPhone}</p>}
                    </td>

                    <td className={`py-3 px-3 font-bold whitespace-nowrap ${ex.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {ex.type === 'income' ? '+' : '-'} ৳{Number(ex.amount).toLocaleString('bn-BD')}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {ex.status === 'approved' ? (
                        <span className="px-2.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                          ✅ অনুমোদিত
                        </span>
                      ) : ex.status === 'rejected' ? (
                        <span className="px-2.5 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-semibold">
                          বাতিলকৃত
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full font-semibold">
                          ⏳ পেন্ডিং
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {ex.status === 'approved' && (
                          <button
                            onClick={() => handlePrintVoucher(ex)}
                            className="px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 whitespace-nowrap cursor-pointer"
                          >
                            🖨️ প্রিন্ট
                          </button>
                        )}
                        {isSuper && (
                          <>
                            {ex.status !== 'approved' && (
                              <button
                                onClick={() => handleStatusChange(ex._id, 'approved')}
                                className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700 whitespace-nowrap cursor-pointer"
                              >
                                ✅ অ্যাপ্রুভ
                              </button>
                            )}
                            <button
                              onClick={() => setEditingItem(ex)}
                              className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded hover:bg-blue-100 whitespace-nowrap cursor-pointer"
                            >
                              ✏️ এডিট
                            </button>
                            {ex.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatusChange(ex._id, 'rejected')}
                                className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded hover:bg-red-100 whitespace-nowrap cursor-pointer"
                              >
                                বাতিল
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
