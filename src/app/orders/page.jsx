"use client";
import { useState, useEffect } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const getStatusStep = (status) => {
    const steps = ["pending", "accepted", "shipped", "delivered"];
    return steps.indexOf(status);
  };

  if (loading) return <div className="text-center p-12 text-emerald-600 animate-pulse">লোড হচ্ছে...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">আমার অর্ডার সমূহ (উপজেলা বাজার)</h1>
      {orders.map((order) => {
        const currentStep = getStatusStep(order.status);
        return (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="flex justify-between border-b pb-4 mb-6 text-sm text-gray-600">
              <div><p>অর্ডার আইডি</p><p className="font-bold text-emerald-600 text-base">{order.id}</p></div>
              <div className="text-right"><p>অর্ডারের তারিখ</p><p className="font-medium text-gray-800 text-base">{order.date}</p></div>
            </div>

            {/* স্টেপার */}
            <div className="mb-8 relative flex items-center justify-between w-full px-2">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 -z-0">
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(currentStep / 3) * 100}%` }} />
              </div>
              {["পেন্ডিং", "গৃহীত", "পাঠানো হয়েছে", "ডেলিভার্ড"].map((label, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= idx ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                    {idx + 1} {/* 🚀 এখানে ফিক্স করা হলো, এখন ৪ দেখাবে */}
                  </div>
                  <p className="text-xs mt-2 font-medium text-gray-600">{label}</p>
                </div>
              ))}
            </div>

            {/* আইটেম ও পেমেন্ট */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">আইটেম সমূহ:</h3>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-0.5"><span>{item.name} ({item.qty})</span><span className="font-medium text-gray-800">{item.price}</span></div>
                ))}
              </div>
              <div className="md:text-right flex flex-col justify-between">
                <div><h3 className="font-bold text-gray-800 mb-1">পেমেন্ট পদ্ধতি:</h3><p>{order.paymentMethod}</p></div>
                <div className="mt-3 text-base">সর্বমোট মূল্য: <span className="text-xl font-bold text-gray-900">{order.total}</span></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
