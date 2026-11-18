// src/components/MonthlyBazarClient.jsx
'use client';

import { useState } from 'react';

const DELIVERY_DAYS = Array(28).fill(0).map((_, i) => i + 1);

export default function MonthlyBazarClient({ readymadePacks, catalogItems }) {
  const [activeTab, setActiveTab] = useState('READYMADE');
  const [customCart, setCustomCart] = useState({});
  const [deliveryDay, setDeliveryDay] = useState(5);
  const [submittingId, setSubmittingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // কাস্টমারের তথ্য স্টেট
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
  });

  // সাবস্ক্রিপশন খোঁজার জন্য ফোন নম্বর
  const [searchPhone, setSearchPhone] = useState('');
  const [searching, setSearching] = useState(false);

  // অ্যাক্টিভ সাবস্ক্রিপশন স্টেট
  const [mySubscription, setMySubscription] = useState(null);

  const updateCustomQty = (item, delta) => {
    setCustomCart((prev) => {
      const currentQty = prev[item.id]?.quantity || 0;
      const newQty = Math.max(0, currentQty + delta);
      if (newQty === 0) {
        const updated = { ...prev };
        delete updated[item.id];
        return updated;
      }
      return {
        ...prev,
        [item.id]: { ...item, quantity: newQty },
      };
    });
  };

  const customItemsList = Object.values(customCart);
  const customTotal = customItemsList.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // নতুন সাবস্ক্রিপশন কনফার্ম হ্যান্ডলার
  const handleSubscribe = async (pkgData, packId) => {
    if (submittingId !== null) return;

    // ভ্যালিডেশন চেক
    if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.address.trim()) {
      alert('দয়া করে আপনার নাম, মোবাইল নম্বর এবং ডেলিভারি ঠিকানা পূরণ করুন।');
      return;
    }

    setSubmittingId(packId);

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerInfo,
          ...pkgData,
          deliveryDayOfMonth: deliveryDay,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setMySubscription({
          ...result.data,
          nextDeliveryDate: `প্রতি মাসের ${deliveryDay} তারিখ`,
        });
        setActiveTab('MANAGE');
      } else {
        alert(result.message || 'সাবস্ক্রিপশন সেভ করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      alert('সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে।');
    } finally {
      setSubmittingId(null);
    }
  };

  // ফোন নম্বর দিয়ে সাবস্ক্রিপশন খুঁজে বের করা
  const handleFindSubscription = async (e) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/subscriptions?phone=${encodeURIComponent(searchPhone.trim())}`);
      const result = await res.json();
      if (result.success && result.data) {
        setMySubscription({
          ...result.data,
          nextDeliveryDate: `প্রতি মাসের ${result.data.deliveryDayOfMonth} তারিখ`,
        });
      } else {
        alert('এই মোবাইল নম্বরে কোনো সাবস্ক্রিপশন পাওয়া যায়নি।');
      }
    } finally {
      setSearching(false);
    }
  };

  // পজ / স্কিপ / রিজিউম হ্যান্ডলার
  const handleSubscriptionAction = async (action) => {
    if (actionLoading || !mySubscription?._id) return;
    setActionLoading(true);

    try {
      setMySubscription((prev) => ({
        ...prev,
        status:
          action === 'PAUSE'
            ? 'PAUSED'
            : action === 'SKIP_MONTH'
            ? 'SKIPPED_NEXT_MONTH'
            : 'ACTIVE',
      }));

      await fetch('/api/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: mySubscription._id,
          action,
        }),
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {/* নেভিগেশন ট্যাব */}
      <div className="bg-white rounded-xl shadow-sm p-1.5 flex flex-wrap gap-1 mb-6 border border-gray-100">
        <button
          type="button"
          onClick={() => setActiveTab('READYMADE')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition cursor-pointer ${
            activeTab === 'READYMADE'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          রেডিমেড প্যাক
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('CUSTOM')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition cursor-pointer ${
            activeTab === 'CUSTOM'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          কাস্টম বান্ডেল তৈরি
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('MANAGE')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition cursor-pointer ${
            activeTab === 'MANAGE'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          আমার সাবস্ক্রিপশন
        </button>
      </div>
      {/* কাস্টমারের তথ্য ও ডেলিভারি তারিখ ফর্ম */}
      {activeTab !== 'MANAGE' && (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                প্রতি মাসে কোন তারিখে বাজার পেতে চান?
              </h3>
              <p className="text-xs text-gray-500">
                নির্বাচিত তারিখের সকাল ১০টার মধ্যে ডেলিভারি পৌঁছে যাবে।
              </p>
            </div>
            <select
              value={deliveryDay}
              onChange={(e) => setDeliveryDay(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {DELIVERY_DAYS.map((day) => (
                <option key={day} value={day}>
                  প্রতি মাসের {day} তারিখ
                </option>
              ))}
            </select>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 text-sm mb-3">
              ডেলিভারি গ্রহীতার তথ্য দিন <span className="text-red-500">*</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="আপনার পূর্ণ নাম (যেমন: রহিম উদ্দিন)"
                value={customerInfo.name}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, name: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="tel"
                placeholder="মোবাইল নম্বর (যেমন: 017XXXXXXXX)"
                value={customerInfo.phone}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, phone: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="পূর্ণ ঠিকানা (গ্রাম/মহল্লা, ওয়ার্ড, উপজেলা)"
                value={customerInfo.address}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, address: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ট্যাব ১: রেডিমেড ফ্যামিলি প্যাক */}
      {activeTab === 'READYMADE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {readymadePacks.map((pack, index) => {
            const uniquePackKey = pack.id || `pack_${index}`;
            const isThisSubmitting = submittingId === uniquePackKey;

            return (
              <div
                key={uniquePackKey}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:border-emerald-400 transition"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-gray-800">
                      {pack.name}
                    </h2>
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
                      {pack.badge}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-extrabold text-emerald-700">
                      ৳{pack.discountPrice}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      ৳{pack.regularPrice}
                    </span>
                    <span className="text-xs text-emerald-600 font-medium">
                      (সাশ্রয় ৳{pack.regularPrice - pack.discountPrice})
                    </span>
                  </div>

                  <ul className="space-y-2 border-t border-gray-100 pt-4 mb-6 text-sm text-gray-600">
                    {pack.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>✓ {item.name}</span>
                        <span className="font-medium text-gray-800">
                          {item.quantity} {item.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={isThisSubmitting}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubscribe(
                      {
                        packageType: 'READYMADE',
                        packageName: pack.name,
                        items: pack.items,
                        totalPrice: pack.discountPrice,
                      },
                      uniquePackKey
                    );
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition cursor-pointer disabled:opacity-60"
                >
                  {isThisSubmitting
                    ? 'প্রসেস হচ্ছে...'
                    : 'মাসিক সাবস্ক্রাইব করুন'}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {/* ট্যাব ২: কাস্টম বান্ডেল বিল্ডার */}
      {activeTab === 'CUSTOM' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {catalogItems.map((item) => {
              const qty = customCart[item.id]?.quantity || 0;
              return (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      ৳{item.price} / {item.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateCustomQty(item, -1)}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-semibold text-sm">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCustomQty(item, 1)}
                      className="w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 font-bold text-emerald-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 h-fit sticky top-4">
            <h3 className="font-bold text-gray-800 text-lg mb-3 border-b pb-2">
              আপনার কাস্টম বান্ডেল
            </h3>
            {customItemsList.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">
                বাম পাশ থেকে প্রয়োজনীয় বাজার যোগ করুন।
              </p>
            ) : (
              <>
                <ul className="space-y-2 text-sm mb-4 max-h-60 overflow-y-auto">
                  {customItemsList.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between text-gray-700"
                    >
                      <span>
                        {item.name} ({item.quantity} {item.unit})
                      </span>
                      <span className="font-semibold">
                        ৳{item.price * item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="border-t pt-3 flex justify-between font-bold text-gray-900 mb-4">
                  <span>মোট মাসিক বিল</span>
                  <span className="text-emerald-700">৳{customTotal}</span>
                </div>
                <button
                  type="button"
                  disabled={submittingId === 'CUSTOM_PACK'}
                  onClick={() =>
                    handleSubscribe(
                      {
                        packageType: 'CUSTOM',
                        packageName: 'কাস্টম ফ্যামিলি বান্ডেল',
                        items: customItemsList,
                        totalPrice: customTotal,
                      },
                      'CUSTOM_PACK'
                    )
                  }
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition cursor-pointer disabled:opacity-60"
                >
                  {submittingId === 'CUSTOM_PACK'
                    ? 'প্রসেস হচ্ছে...'
                    : 'কাস্টম সাবস্ক্রিপশন চালু করুন'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ট্যাব ৩: সাবস্ক্রিপশন ম্যানেজমেন্ট */}
      {activeTab === 'MANAGE' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* মোবাইল নম্বর দিয়ে সাবস্ক্রিপশন খোঁজার বক্স */}
          <form
            onSubmit={handleFindSubscription}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-2"
          >
            <input
              type="tel"
              placeholder="আপনার মোবাইল নম্বর দিয়ে সাবস্ক্রিপশন খুঁজুন..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={searching}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
            >
              {searching ? 'খোঁজা হচ্ছে...' : 'খুঁজুন'}
            </button>
          </form>

          {!mySubscription ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500 text-sm">
              আপনার কোনো সক্রিয় সাবস্ক্রিপশন লোড করা নেই। উপরে মোবাইল নম্বর দিয়ে খুঁজুন অথবা নতুন প্যাকেজ সাবস্ক্রাইব করুন।
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-4 mb-4">
                <div>
                  <span className="text-xs text-gray-500">সক্রিয় প্যাকেজ</span>
                  <h2 className="text-xl font-bold text-gray-800">
                    {mySubscription.packageName}
                  </h2>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    mySubscription.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : mySubscription.status === 'PAUSED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {mySubscription.status === 'ACTIVE' && 'চালু আছে (Active)'}
                  {mySubscription.status === 'PAUSED' && 'সাময়িক বন্ধ (Paused)'}
                  {mySubscription.status === 'SKIPPED_NEXT_MONTH' &&
                    'আগামী মাস স্কিপ করা হয়েছে'}
                </span>
              </div>

              {/* কাস্টমারের ঠিকানা ও তথ্য */}
              {mySubscription.customerInfo && (
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5 mb-4 text-sm space-y-1">
                  <p className="text-gray-800">
                    <strong>গ্রহীতা:</strong> {mySubscription.customerInfo.name} ({mySubscription.customerInfo.phone})
                  </p>
                  <p className="text-gray-700">
                    <strong>ঠিকানা:</strong> {mySubscription.customerInfo.address}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl mb-6 text-sm">
                <div>
                  <p className="text-gray-500">মাসিক বিল</p>
                  <p className="font-bold text-gray-800 text-base">
                    ৳{mySubscription.totalPrice}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">পরবর্তী ডেলিভারি</p>
                  <p className="font-bold text-gray-800 text-base">
                    {mySubscription.status === 'PAUSED'
                      ? 'পজ করা আছে'
                      : mySubscription.nextDeliveryDate}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {mySubscription.status === 'ACTIVE' ? (
                  <>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleSubscriptionAction('SKIP_MONTH')}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-4 rounded-xl transition text-sm cursor-pointer disabled:opacity-50"
                    >
                      আগামী মাস স্কিপ (Skip) করুন
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleSubscriptionAction('PAUSE')}
                      className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2.5 px-4 rounded-xl transition text-sm cursor-pointer disabled:opacity-50"
                    >
                      সাবস্ক্রিপশন পজ (Pause) করুন
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleSubscriptionAction('RESUME')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition text-sm cursor-pointer disabled:opacity-50"
                  >
                    আবার সাবস্ক্রিপশন চালু (Resume) করুন
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
