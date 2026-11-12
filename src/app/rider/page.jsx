"use client";
import { useState, useEffect } from "react";

export default function RiderDashboard() {
  const [riderInfo, setRiderInfo] = useState({ name: "Hasan3", area: "Savar, Dhaka" });
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRiderData() {
      try {
        const res = await fetch("/api/rider");
        const data = await res.json();
        if (data.success) {
          setRiderInfo(data.rider);
          setActiveDeliveries(data.activeDeliveries);
          setAvailableOrders(data.availableOrders);
        }
      } catch (error) {
        console.error(error);
      } finally { setLoading(false); }
    }
    fetchRiderData();
  }, []);

  // 🚀 বাটন ক্লিক হ্যান্ডলার: উপলব্ধ অর্ডার থেকে চলমান অর্ডারে ট্রান্সফার লজিক
  const handleAcceptOrder = (order) => {
    const newActive = {
      id: order.id,
      customer: "নতুন কাস্টমার", // মক নেম
      address: order.area,
      item: "অর্ডারকৃত মালামাল",
      status: "In Progress"
    };
    setActiveDeliveries([...activeDeliveries, newActive]);
    setAvailableOrders(availableOrders.filter((o) => o.id !== order.id));
  };

  if (loading) return <div className="p-8 text-center text-emerald-600 animate-pulse">লোড হচ্ছে...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="bg-emerald-600 p-6 text-white">
          <h1 className="text-2xl font-bold">রাইডার ডেলিভারি ড্যাশবোর্ড 🚴‍♂️</h1>
          <p className="mt-2 text-sm">স্বাগতম, {riderInfo.name} | এলাকা: {riderInfo.area}</p>
        </div>
        <div className="p-4 space-y-6">
          {/* চলমান */}
          <div>
            <h2 className="text-base font-bold text-orange-600 mb-2">📦 আপনার চলমান ডেলিভারিসমূহ ({activeDeliveries.length})</h2>
            {activeDeliveries.length === 0 ? (
              <div className="border p-4 rounded-lg text-center text-sm text-gray-400">কোনো চলমান ডেলিভারি নেই।</div>
            ) : (
              activeDeliveries.map((d) => (
                <div key={d.id} className="border border-orange-200 bg-orange-50 p-3 rounded-lg flex justify-between items-center mb-2">
                  <div className="text-xs text-gray-600"><p className="font-bold text-gray-800 text-sm">{d.customer}</p><p>{d.address}</p><p className="text-emerald-600 mt-1">{d.item}</p></div>
                  <span className="bg-orange-500 text-white text-[10px] px-2 py-1 rounded font-bold">{d.status}</span>
                </div>
              ))
            )}
          </div>
          {/* উপলব্ধ */}
          <div>
            <h2 className="text-base font-bold text-gray-800 mb-2">🔔 নতুন উপলব্ধ অর্ডারসমূহ ({availableOrders.length})</h2>
            {availableOrders.map((order) => (
              <div key={order.id} className="border p-3 rounded-lg flex justify-between items-center bg-gray-50 mb-2">
                <div className="text-xs text-gray-600"><p className="text-sm font-bold text-gray-700">{order.shop}</p><p>লোকেশন: {order.area}</p><p className="text-emerald-600 font-bold mt-1">বিল: {order.payment}</p></div>
                <button onClick={() => handleAcceptOrder(order)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded font-medium transition">
                  গ্রহণ করুন
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
