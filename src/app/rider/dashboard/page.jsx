// src/app/rider/dashboard/page.jsx
'use client';
import { useState, useEffect } from 'react';

export default function RiderDashboard() {
  const [riderInfo, setRiderInfo] = useState(null);
  const [openOrders, setOpenOrders] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role === 'rider') {
        setRiderInfo(parsedUser);
        loadDashboardData(parsedUser);
      } else {
        setMessage("দুঃখিত, আপনি ডেলিভারি ম্যান (Rider) নন।");
        setLoading(false);
      }
    } else {
      setMessage("অনুগ্রহ করে আগে লগইন করুন।");
      setLoading(false);
    }
  }, []);

  const loadDashboardData = async (user) => {
    const rId = user.id || user._id;
    try {
      // ১. ওপেন অর্ডার লোড করা
      const resOpen = await fetch(`/api/orders/rider?upazila=${user.upazila}`);
      const dataOpen = await resOpen.json();
      if (dataOpen.orders) setOpenOrders(dataOpen.orders);

      // ২. রাইডারের নিজের অ্যাক্টিভ ডেলিভারি লোড করা
      const resActive = await fetch(`/api/orders/my-deliveries?riderId=${rId}`);
      const dataActive = await resActive.json();
      if (dataActive.orders) setActiveDeliveries(dataActive.orders);

      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  // অর্ডার অ্যাক্সেপ্ট করার ফাংশন
  const handleAcceptOrder = async (orderId) => {
    const rId = riderInfo.id || riderInfo._id;
    const res = await fetch('/api/orders/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, riderId: rId })
    });

    const data = await res.json();
    if (res.ok) {
      alert("অর্ডারটি সফলভাবে আপনার তালিকায় যুক্ত হয়েছে!");
      loadDashboardData(riderInfo); // ড্যাশবোর্ড রিফ্রেশ করা
    } else {
      alert("ভুল: " + data.error);
    }
  };

  // ডেলিভারি কমপ্লিট করার ফাংশন
  const handleCompleteDelivery = async (orderId) => {
    const res = await fetch('/api/orders/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      loadDashboardData(riderInfo); // ড্যাশবোর্ড রিফ্রেশ করা
    } else {
      alert("ভুল: " + data.error);
    }
  };

  if (loading) return <div className="text-center mt-20 text-lg font-semibold">ড্যাশবোর্ড লোড হচ্ছে...</div>;
  if (!riderInfo) return <div className="text-center mt-20 text-red-600 font-bold bg-red-50 p-4 max-w-md mx-auto rounded border">{message}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-50 min-h-screen rounded-lg shadow-sm">
      <div className="bg-green-600 text-white p-6 rounded-lg mb-8 shadow-sm">
        <h1 className="text-2xl font-bold">রাইডার ডেলিভারি ড্যাশবোর্ড 🚴‍♂️</h1>
        <p className="text-sm mt-1 opacity-90">স্বাগতম, <span className="font-bold">{riderInfo.name}</span></p>
        <p className="text-xs mt-0.5 opacity-75">ডিইউটি এলাকা: {riderInfo.upazila}, {riderInfo.district}</p>
      </div>

      {/* সেকশন ১: চলমান ডেলিভারি (Active Deliveries) */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
          <span>📦</span> আপনার চলমান ডেলিভারিসমূহ ({activeDeliveries.length})
        </h2>
        {activeDeliveries.length > 0 ? (
          <div className="space-y-4">
            {activeDeliveries.map((order) => (
              <div key={order._id} className="bg-orange-50/60 p-5 rounded-lg shadow border border-orange-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-xs text-orange-700 font-semibold mb-1">অর্ডার স্ট্যাটাস: প্রসেসিং (Processing)</p>
                  <h3 className="font-bold text-gray-800">গ্রাহক: {order.customerName}</h3>
                  <p className="text-sm text-gray-700">📞 মোবাইল: {order.customerPhone}</p>
                  <p className="text-sm text-gray-600">📍 ঠিকানা: {order.customerAddress}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2 w-full md:w-auto">
                  <span className="text-lg font-black text-gray-950">৳{order.totalAmount}</span>
                  <button 
                    onClick={() => handleCompleteDelivery(order._id)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-4 py-2 rounded transition shadow-sm w-full md:w-auto"
                  >
                    ডেলিভারি সম্পন্ন করুন (Complete)
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-white rounded border text-sm text-gray-500">আপনার কোনো চলমান ডেলিভারি নেই। নিচের তালিকা থেকে অর্ডার গ্রহণ করুন।</div>
        )}
      </div>

      {/* সেকশন ২: ওপেন অর্ডার পুল (Available Orders) */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🔔</span> নতুন উপলব্ধ অর্ডারসমূহ ({openOrders.length})
        </h2>
        {openOrders.length > 0 ? (
          <div className="space-y-4">
            {openOrders.map((order) => (
              <div key={order._id} className="bg-white p-5 rounded-lg shadow border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-xs text-gray-400">#ID: {order._id.substring(18)}</p>
                  <h3 className="font-bold text-gray-800 mt-1">গ্রাহক: {order.customerName}</h3>
                  <p className="text-sm text-gray-600">এলাকা: {order.customerAddress}</p>
                  <div className="mt-2 space-y-1">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-xs text-gray-500">• {item.title} (x{item.quantity})</p>
                    ))}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2 w-full md:w-auto">
                  <span className="text-lg font-black text-gray-900">৳{order.totalAmount}</span>
                  <button 
                    onClick={() => handleAcceptOrder(order._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2 rounded transition shadow-sm w-full md:w-auto"
                  >
                    অর্ডার গ্রহণ করুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded border text-gray-500">আপনার এলাকায় এই মুহূর্তে কোনো নতুন অর্ডার পেন্ডিং নেই।</div>
        )}
      </div>
    </div>
  );
}
