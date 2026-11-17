"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UniversalPrintButtons from "@/components/invoice/UniversalPrintButtons";

export default function RiderOrdersView({ orders = [] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [dateFilter, setDateFilter] = useState("all"); // 'today', 'month', 'all'
  const [loadingId, setLoadingId] = useState(null);

  // তারিখ অনুযায়ী ফিল্টার ফাংশন
  const filterByDate = (order) => {
    if (dateFilter === "all") return true;
    const orderDate = new Date(order.deliveryDateRaw);
    const now = new Date();

    if (dateFilter === "today") {
      return (
        orderDate.getDate() === now.getDate() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }
    if (dateFilter === "month") {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  };

  const filteredOrders = orders.filter(filterByDate);

  const activeOrders = filteredOrders.filter((o) => {
    const status = (o.deliveryStatus || "").toLowerCase();
    return status !== "delivered" && status !== "cancelled";
  });

  const completedOrders = filteredOrders.filter(
    (o) => (o.deliveryStatus || "").toLowerCase() === "delivered"
  );

  // রাইডারের মোট ইনকাম ও মোট কালেক্টেড ক্যাশ হিসাব
  const totalRiderIncome = completedOrders.reduce(
    (sum, o) => sum + (Number(o.rider_earning) || 0),
    0
  );
  const totalCollectedCash = completedOrders.reduce(
    (sum, o) => sum + (Number(o.total_amount) || 0),
    0
  );

  const displayedOrders =
    activeTab === "active" ? activeOrders : completedOrders;

  const handleStatusUpdate = async (orderId, newStatus) => {
    setLoadingId(orderId);
    try {
      const res = await fetch("/api/rider/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, deliveryStatus: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "স্ট্যাটাস আপডেট ব্যর্থ হয়েছে!");
      } else {
        router.refresh();
      }
    } catch (error) {
      alert("সার্ভারে সংযোগ দেওয়া যাচ্ছে না!");
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "assigned":
        return { text: "রাইডার অ্যাসাইনড", color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "picked_up":
        return { text: "পার্সেল পিকআপ হয়েছে", color: "bg-amber-50 text-amber-700 border-amber-200" };
      case "on_the_way":
        return { text: "পথে আছে", color: "bg-purple-50 text-purple-700 border-purple-200" };
      case "delivered":
        return { text: "ডেলিভারি সম্পন্ন", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      default:
        return { text: status, color: "bg-gray-100 text-gray-700 border-gray-200" };
    }
  };

  return (
    <div className="space-y-6">
      {/* ১. টপ হেডার ও তারিখ ফিল্টার */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            রাইডার ডেলিভারি ও আয়ের হিসাব
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            তারিখ ও সেলার অনুযায়ী আপনার ডেলিভারি ও ইনকামের বিস্তারিত রিপোর্ট
          </p>
        </div>

        {/* তারিখ ফিল্টার বাটন */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl self-start">
          {[
            { id: "today", label: "আজ (Today)" },
            { id: "month", label: "এই মাস (Month)" },
            { id: "all", label: "সর্বমোট (All)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDateFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                dateFilter === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ২. ৪টি স্ট্যাটাস ও ইনকাম সামারি কার্ড */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-700">আপনার মোট ইনকাম</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              ৳{totalRiderIncome}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">ডেলিভারি ফি বাবদ আয়</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center text-xl">
            💵
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">সম্পন্ন ডেলিভারি</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {completedOrders.length} টি
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">সফল ডেলিভারি সংখ্যা</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center text-xl">
            ✅
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">চলমান ডেলিভারি</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {activeOrders.length} টি
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">পথে বা পিকআপ বাকি</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center text-xl">
            🛵
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">মোট ক্যাশ কালেকশন</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              ৳{totalCollectedCash}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">পণ্যের মোট মূল্য</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-xl">
            🏦
          </div>
        </div>
      </div>

      {/* ৩. ট্যাব বাটনসমূহ */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "active"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          চলমান ডেলিভারি ({activeOrders.length})
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "completed"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          সম্পন্ন ডেলিভারি ও আয়ের বিবরণ ({completedOrders.length})
        </button>
      </div>
      {/* ৪. অর্ডার ও আয়ের তালিকা */}
      {displayedOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 text-base">
            এই সময়সীমায় কোনো ডেলিভারি পাওয়া যায়নি।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayedOrders.map((order) => {
            const badge = getStatusBadge(order.deliveryStatus);
            const sellerNames = [
              ...new Set(order.items.map((i) => i.shopName).filter(Boolean)),
            ].join(", ");

            return (
              <div
                key={order._id}
                className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-200 transition-all"
              >
                {/* কার্ড হেডার: অর্ডার আইডি, তারিখ, সেলার ও স্ট্যাটাস */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-bold text-emerald-700 text-base">
                        #{order.orderId}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.color}`}
                      >
                        {badge.text}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-md">
                        📅 {order.deliveryDateFormatted}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-600">
                      🏪 সেলার: <span className="text-gray-900 font-semibold">{sellerNames || "উপজেলা স্টোর"}</span>
                    </p>
                  </div>

                  {/* ডান পাশে পণ্যের বিল ও রাইডারের ইনকাম */}
                  <div className="flex items-center gap-4 text-right">
                    <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                      <span className="text-[11px] text-emerald-700 block font-medium">
                        আপনার ইনকাম
                      </span>
                      <span className="text-base font-bold text-emerald-700">
                        +৳{order.rider_earning}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-gray-500 block">
                        কাস্টমার বিল (COD)
                      </span>
                      <span className="text-lg font-bold text-gray-800">
                        ৳{order.total_amount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* কাস্টমার ও পণ্যের বিস্তারিত */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="bg-gray-50 p-3.5 rounded-xl space-y-1.5">
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      ক্রেতার তথ্য ও ঠিকানা
                    </p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {order.customer_name}
                    </p>
                    <p className="text-xs text-gray-600">
                      📍 {order.customer_address}
                      {order.upazila ? `, ${order.upazila}` : ""}
                      {order.district ? `, ${order.district}` : ""}
                    </p>
                    {order.customer_phone && (
                      <div className="pt-1 flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-700">
                          📞 {order.customer_phone}
                        </span>
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md font-medium transition"
                        >
                          কল করুন
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-3.5 rounded-xl space-y-1.5">
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      পার্সেল ও পণ্যের মূল্য ({order.items.length} টি আইটেম)
                    </p>
                    <ul className="space-y-1">
                      {order.items.map((item) => (
                        <li
                          key={item._id}
                          className="text-xs text-gray-700 flex justify-between"
                        >
                          <span>
                            • {item.name} ({item.qty} টি) — <span className="text-gray-500">{item.shopName}</span>
                          </span>
                          <span className="font-semibold text-gray-800">
                            ৳{item.price * item.qty}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* অ্যাকশন বাটন + মিনি প্রিন্টার (POS) প্রিন্ট বাটন */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3">
                  {/* এক ক্লিকে মিনি প্রিন্টার রিসিপ্ট বাটন */}
                  <UniversalPrintButtons order={order} role="rider" />

                  {activeTab === "active" && (
                    <>
                      {(order.deliveryStatus || "").toLowerCase() === "assigned" && (
                        <button
                          disabled={loadingId === order._id}
                          onClick={() => handleStatusUpdate(order._id, "picked_up")}
                          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                        >
                          {loadingId === order._id ? "আপডেট হচ্ছে..." : "📦 পার্সেল পিকআপ করেছি"}
                        </button>
                      )}

                      {["picked_up", "on_the_way"].includes(
                        (order.deliveryStatus || "").toLowerCase()
                      ) && (
                        <button
                          disabled={loadingId === order._id}
                          onClick={() => handleStatusUpdate(order._id, "delivered")}
                          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                        >
                          {loadingId === order._id
                            ? "আপডেট হচ্ছে..."
                            : "✅ ডেলিভারি সম্পন্ন হয়েছে"}
                        </button>
                      )}
                    </>
                  )}
                </div>

                {order.feedback && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-amber-800">
                      ⭐ কাস্টমার রেটিং: {order.feedback.riderRating} / 5
                    </span>
                    {order.feedback.riderComment && (
                      <span className="text-gray-700 italic">
                        "{order.feedback.riderComment}"
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
