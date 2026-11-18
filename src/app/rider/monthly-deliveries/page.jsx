// src/app/rider/monthly-deliveries/page.jsx
'use client';

import { useEffect, useState } from 'react';

export default function MonthlyDeliveriesDashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDay, setFilterDay] = useState('ALL');
  const [deliveredIds, setDeliveredIds] = useState({});

  // সব অ্যাক্টিভ সাবস্ক্রিপশন লোড করা
  useEffect(() => {
    async function fetchDeliveries() {
      try {
        const res = await fetch('/api/subscriptions?role=rider');
        const result = await res.json();
        if (result.success) {
          setSubscriptions(result.data);
        }
      } catch (err) {
        console.error('ডেলিভারি লিস্ট লোড হয়নি:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDeliveries();
  }, []);

  // আজকের তারিখ
  const todayDate = new Date().getDate();

  // ফিল্টার করা লিস্ট (শুধু ACTIVE গুলো ডেলিভারি হবে)
  const filteredList = subscriptions.filter((sub) => {
    if (filterDay === 'TODAY') return sub.deliveryDayOfMonth === todayDate;
    if (filterDay === 'ACTIVE_ONLY') return sub.status === 'ACTIVE';
    return true;
  });

  const markAsDelivered = (id) => {
    setDeliveredIds((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* হেডার */}
        <div className="bg-emerald-800 text-white p-6 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              মাসিক বাজার প্যাকিং ও রাইডার ডেলিভারি লিস্ট
            </h1>
            <p className="text-emerald-100 text-xs md:text-sm mt-1">
              সেলার এখানে পণ্যের তালিকা দেখে প্যাক করবেন এবং রাইডার ঠিকানায় পৌঁছে দেবেন।
            </p>
          </div>
          <div className="bg-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold">
            মোট সাবস্ক্রাইবার: {subscriptions.length} জন
          </div>
        </div>

        {/* ফিল্টার বাটন */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterDay('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
              filterDay === 'ALL'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700 border'
            }`}
          >
            সব সাবস্ক্রিপশন ({subscriptions.length})
          </button>
          <button
            onClick={() => setFilterDay('ACTIVE_ONLY')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
              filterDay === 'ACTIVE_ONLY'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700 border'
            }`}
          >
            ডেলিভারি যোগ্য (Active)
          </button>
          <button
            onClick={() => setFilterDay('TODAY')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
              filterDay === 'TODAY'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700 border'
            }`}
          >
            আজকের ডেলিভারি ({todayDate} তারিখ)
          </button>
        </div>

        {/* লিস্ট ভিউ */}
        {loading ? (
          <p className="text-center py-10 text-gray-500">লোড হচ্ছে...</p>
        ) : filteredList.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-500 border">
            এই ক্যাটাগরিতে কোনো ডেলিভারি পাওয়া যায়নি।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredList.map((sub) => {
              const isDelivered = deliveredIds[sub._id];
              const isHold = sub.status !== 'ACTIVE';

              return (
                <div
                  key={sub._id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between ${
                    isHold ? 'opacity-60 border-red-200' : 'border-gray-200'
                  }`}
                >
                  <div>
                    {/* স্ট্যাটাস ও ডেলিভারি তারিখ */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                        প্রতি মাসের {sub.deliveryDayOfMonth} তারিখ
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          sub.status === 'ACTIVE'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {sub.status === 'ACTIVE'
                          ? 'প্যাকিং ও ডেলিভারি করুন'
                          : 'বন্ধ/স্কিপ (পাঠাবেন না)'}
                      </span>
                    </div>

                    {/* কাস্টমারের তথ্য (রাইডারের জন্য) */}
                    <div className="bg-gray-50 p-3 rounded-xl mb-4 text-sm space-y-1">
                      <p className="font-bold text-gray-900 text-base">
                        {sub.customerInfo?.name || 'নাম নেই'}
                      </p>
                      <p className="text-gray-700">
                        📞 <a href={`tel:${sub.customerInfo?.phone}`} className="text-emerald-700 font-semibold underline">{sub.customerInfo?.phone}</a>
                      </p>
                      <p className="text-gray-700">
                        📍 {sub.customerInfo?.address}
                      </p>
                    </div>

                    {/* পণ্যের তালিকা (সেলারের প্যাকিংয়ের জন্য) */}
                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                        প্যাকেজ: {sub.packageName} (মোট ৳{sub.totalPrice})
                      </p>
                      <ul className="text-xs text-gray-700 space-y-1 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                        {sub.items?.map((item, i) => (
                          <li key={i} className="flex justify-between">
                            <span>• {item.name}</span>
                            <span className="font-semibold">
                              {item.quantity} {item.unit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* রাইডার অ্যাকশন বাটন */}
                  {!isHold && (
                    <button
                      onClick={() => markAsDelivered(sub._id)}
                      disabled={isDelivered}
                      className={`w-full py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer ${
                        isDelivered
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isDelivered
                        ? '✓ এই মাসের ডেলিভারি সম্পন্ন'
                        : 'ডেলিভারি সম্পন্ন মার্ক করুন'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
