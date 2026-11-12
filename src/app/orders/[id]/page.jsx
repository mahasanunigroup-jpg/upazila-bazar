"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { Package, Truck, CheckCircle2, Clock, ShoppingBag, MapPin, User, Loader2 } from "lucide-react";

function TrackingContent() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
    const interval = setInterval(fetchOrderData, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;
  if (!order) return <div className="text-center py-20 text-red-500 font-bold">অর্ডারটি পাওয়া যায়নি!</div>;

  const steps = [
    { id: "pending", label: "অর্ডার গৃহীত হয়েছে", icon: Clock },
    { id: "processing", label: "প্যাকিং চলছে", icon: Package },
    { id: "shipped", label: "ডেলিভারির জন্য বের হয়েছে", icon: Truck },
    { id: "delivered", label: "ডেলিভারি সম্পন্ন", icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-green-600 p-6 text-white sm:flex sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">অর্ডার ট্র্যাকিং</h1>
            <p className="text-green-100 text-sm mt-1">অর্ডার আইডি: #{order.orderId || order._id}</p>
          </div>
          <div className="mt-4 sm:mt-0 bg-green-700 px-4 py-2 rounded-full text-sm font-semibold">
            তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0 md:space-x-4 pt-4">
            <div className="hidden md:block absolute top-1/2 left-4 right-4 h-1 bg-gray-200 -translate-y-1/2 z-0" />
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.id} className="flex md:flex-col items-center w-full md:w-auto relative z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isCompleted ? "bg-green-600 border-green-200 text-white" : "bg-white border-gray-200 text-gray-400"} ${isCurrent ? "ring-4 ring-green-100 scale-110" : ""}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="ml-4 md:ml-0 md:mt-3 text-left md:text-center">
                    <p className={`text-sm font-bold ${isCompleted ? "text-green-600" : "text-gray-500"}`}>{step.label}</p>
                    {isCurrent && <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded mt-0.5 font-medium animate-pulse">চলমান</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <hr className="border-gray-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="flex items-center text-gray-700 font-bold mb-3"><User className="w-5 h-5 mr-2 text-green-600" /> কাস্টমার বিবরণ</h3>
              <p className="text-sm text-gray-600 font-semibold">{order.customer_name}</p>
              <p className="text-sm text-gray-500 mt-1">মোবাইল: {order.customer_phone}</p>
              <p className="text-sm text-gray-500 mt-1">পেমেন্ট: {order.payment_method}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="flex items-center text-gray-700 font-bold mb-3"><MapPin className="w-5 h-5 mr-2 text-green-600" /> ডেলিভারি ঠিকানা</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{order.customer_address}</p>
            </div>
          </div>

          <div>
            <h3 className="flex items-center text-gray-700 font-bold mb-4"><ShoppingBag className="w-5 h-5 mr-2 text-green-600" /> পণ্যের তালিকা</h3>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                    <th className="p-4">পণ্যের নাম</th>
                    <th className="p-4 text-center">পরিমাণ</th>
                    <th className="p-4 text-right">মূল্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="p-4 font-medium">{item.name}</td>
                      <td className="p-4 text-center">{item.qty} টি</td>
                      <td className="p-4 text-right font-semibold">{item.price}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold text-gray-800">
                    <td colSpan="2" className="p-4 text-right">সর্বমোট:</td>
                    <td className="p-4 text-right text-green-600 text-base">{order.total_amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>}>
      <TrackingContent />
    </Suspense>
  );
}
