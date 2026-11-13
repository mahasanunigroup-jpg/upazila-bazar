"use client";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Truck, Store, Phone, MapPin } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

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
    // ডাটাবেসের 'processing' স্ট্যাটাস এলেও যেন 'গৃহীত' (step 1) দেখায়
    const normalizedStatus = status === "processing" ? "accepted" : status;
    const steps = ["pending", "accepted", "shipped", "delivered"];
    const idx = steps.indexOf(normalizedStatus);
    return idx === -1 ? 0 : idx;
  };

  const toggleDetails = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  if (loading) return <div className="text-center p-12 text-emerald-600 animate-pulse">লোড হচ্ছে...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">আমার অর্ডার সমূহ (উপজেলা বাজার)</h1>
      {orders.map((order) => {
        const currentStep = getStatusStep(order.status);
        const isExpanded = expandedOrderId === order.id;

        return (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="flex justify-between border-b pb-4 mb-6 text-sm text-gray-600">
              <div>
                <p>অর্ডার আইডি</p>
                <p className="font-bold text-emerald-600 text-base">{order.id}</p>
              </div>
              <div className="text-right">
                <p>অর্ডারের তারিখ</p>
                <p className="font-medium text-gray-800 text-base">{order.date}</p>
              </div>
            </div>

            {/* স্টেপার (একদম আগের মতোই রাখা হয়েছে) */}
            <div className="mb-8 relative flex items-center justify-between w-full px-2">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 -z-0">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
              {["পেন্ডিং", "গৃহীত", "পাঠানো হয়েছে", "ডেলিভার্ড"].map((label, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      currentStep >= idx ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {idx + 1}
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
                  <div key={idx} className="flex justify-between py-0.5">
                    <span>
                      {item.name} ({item.qty})
                    </span>
                    <span className="font-medium text-gray-800">{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="md:text-right flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">পেমেন্ট পদ্ধতি:</h3>
                  <p>{order.paymentMethod}</p>
                </div>
                <div className="mt-3 text-base">
                  সর্বমোট মূল্য: <span className="text-xl font-bold text-gray-900">{order.total}</span>
                </div>
              </div>
            </div>

            {/* রাইডার ও সেলার বিস্তারিত দেখার বাটন */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => toggleDetails(order.id)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/80 py-2.5 px-4 rounded-lg transition cursor-pointer"
              >
                {isExpanded ? (
                  <>
                    বিস্তারিত তথ্য বন্ধ করুন <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    রাইডার ও বিক্রেতার বিস্তারিত দেখুন <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* ক্লিক করলে নিচে রাইডার ও সেলারের তথ্য দেখাবে */}
              {isExpanded && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-emerald-50/30 p-4 rounded-xl border border-emerald-100">
                  {/* রাইডার ডিটেইলস */}
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 mb-2 text-sm">
                      <Truck className="w-4 h-4 text-emerald-600" /> ডেলিভারি রাইডার
                    </h4>
                    {order.rider ? (
                      <div className="space-y-1 text-gray-600">
                        <p>
                          <span className="font-semibold text-gray-800">নাম:</span> {order.rider.name}
                        </p>
                        <p className="flex items-center gap-1">
                          <span className="font-semibold text-gray-800">ফোন:</span>
                          <a
                            href={`tel:${order.rider.phone}`}
                            className="text-blue-600 underline inline-flex items-center gap-0.5 font-medium"
                          >
                            <Phone className="w-3 h-3" /> {order.rider.phone}
                          </a>
                        </p>
                        {order.rider.upazila && (
                          <p>
                            <span className="font-semibold text-gray-800">এলাকা:</span>{" "}
                            {order.rider.upazila}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-amber-600 font-medium">
                        এখনো কোনো রাইডার অ্যাসাইন করা হয়নি।
                      </p>
                    )}
                  </div>

                  {/* সেলার / দোকানের ডিটেইলস */}
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 mb-2 text-sm">
                      <Store className="w-4 h-4 text-emerald-600" /> বিক্রেতা ও ডেলিভারি ঠিকানা
                    </h4>
                    <div className="space-y-1 text-gray-600">
                      <p>
                        <span className="font-semibold text-gray-800">দোকান:</span>{" "}
                        {order.shops ? order.shops.join(", ") : "উপজেলা ভেরিফায়েড স্টোর"}
                      </p>
                      <p className="flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{order.customerAddress || "ঠিকানা দেওয়া নেই"}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
