"use client";

import { useState, useMemo } from "react";
import SellerOrderCard from "@/components/seller/SellerOrderCard";
import { ShoppingBag, CheckCircle2, Clock, Banknote, Calendar } from "lucide-react";

export default function SellerOrdersView({ orders, riders }) {
  const [activeTab, setActiveTab] = useState("active");
  const [dateFilter, setDateFilter] = useState("today");

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const dateFilteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      if (dateFilter === "today") return orderDate.toDateString() === todayStr;
      if (dateFilter === "month")
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      if (dateFilter === "year") return orderDate.getFullYear() === currentYear;
      return true;
    });

    let deliveredCount = 0;
    let pendingCount = 0;
    let totalSalesAmount = 0;

    dateFilteredOrders.forEach((o) => {
      const isCancelled = o.orderPackingStatus === "cancelled";
      const isDelivered = o.deliveryStatus === "delivered";
      if (isDelivered && !isCancelled) {
        deliveredCount++;
        totalSalesAmount += Number(o.myTotal || 0);
      } else if (!isCancelled) {
        pendingCount++;
      }
    });

    return {
      totalOrders: dateFilteredOrders.length,
      deliveredCount,
      pendingCount,
      totalSalesAmount,
    };
  }, [orders, dateFilter]);

  const activeOrders = orders.filter(
    (o) => o.orderPackingStatus !== "cancelled" && o.deliveryStatus !== "delivered"
  );
  const deliveredOrders = orders.filter(
    (o) => o.deliveryStatus === "delivered" && o.orderPackingStatus !== "cancelled"
  );
  const cancelledOrders = orders.filter((o) => o.orderPackingStatus === "cancelled");

  const displayedOrders =
    activeTab === "active"
      ? activeOrders
      : activeTab === "delivered"
        ? deliveredOrders
        : cancelledOrders;

  return (
    <>
      {/* হেডার ও সময় ফিল্টার */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 bg-white p-3.5 sm:p-5 rounded-2xl shadow-2xs border border-gray-100">
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl md:text-2xl font-bold text-gray-800 leading-snug">
            সেলার অর্ডার ও ডেলিভারি ড্যাশবোর্ড
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            পণ্য প্যাক করুন, রাইডার অ্যাসাইন করুন এবং বিক্রির হিসাব দেখুন
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl w-full lg:w-auto shrink-0">
          <Calendar className="w-4 h-4 text-gray-500 ml-1.5 mr-0.5 hidden sm:block shrink-0" />
          {[
            { key: "today", label: "আজ (Day)" },
            { key: "month", label: "এই মাস (Month)" },
            { key: "year", label: "এই বছর (Year)" },
            { key: "all", label: "সর্বমোট (All)" },
          ].map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => setDateFilter(item.key)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer text-center whitespace-nowrap ${
                dateFilter === item.key
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-gray-600 hover:bg-white/70"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ৪টি বিক্রয় রিপোর্ট কার্ড */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3 sm:gap-3.5">
          <div className="p-2.5 sm:p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">প্রাপ্ত অর্ডার</p>
            <p className="text-lg sm:text-xl font-extrabold text-gray-800 mt-0.5">
              {stats.totalOrders.toLocaleString("bn-BD")} টি
            </p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3 sm:gap-3.5">
          <div className="p-2.5 sm:p-3 bg-green-50 text-green-600 rounded-xl shrink-0">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">ডেলিভারি সম্পন্ন</p>
            <p className="text-lg sm:text-xl font-extrabold text-green-700 mt-0.5">
              {stats.deliveredCount.toLocaleString("bn-BD")} টি
            </p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3 sm:gap-3.5">
          <div className="p-2.5 sm:p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">পেন্ডিং / চলমান</p>
            <p className="text-lg sm:text-xl font-extrabold text-amber-700 mt-0.5">
              {stats.pendingCount.toLocaleString("bn-BD")} টি
            </p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3 sm:gap-3.5">
          <div className="p-2.5 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <Banknote className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">মোট বিক্রি (ডেলিভার্ড)</p>
            <p className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-0.5">
              ৳{stats.totalSalesAmount.toLocaleString("bn-BD")}
            </p>
          </div>
        </div>
      </div>

      {/* স্ট্যাটাস ফিল্টার ট্যাব + রাইডার সংখ্যা */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap items-center justify-between gap-2 sm:gap-3 mb-5">
        <div className="contents sm:flex sm:flex-wrap sm:gap-2">
          {[
            { key: "active", label: `চলমান অর্ডার (${activeOrders.length})`, activeBg: "bg-emerald-600" },
            { key: "delivered", label: `সম্পন্ন ডেলিভারি (${deliveredOrders.length})`, activeBg: "bg-green-600" },
            { key: "cancelled", label: `বাতিলকৃত (${cancelledOrders.length})`, activeBg: "bg-red-600" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer text-center whitespace-nowrap ${
                activeTab === tab.key
                  ? `${tab.activeBg} text-white shadow-2xs`
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-blue-50 text-blue-700 px-3 sm:px-3.5 py-2 rounded-xl border border-blue-200 text-xs sm:text-sm font-semibold text-center whitespace-nowrap">
          সক্রিয় রাইডার: {riders.length} জন
        </div>
      </div>

      {/* অর্ডার কার্ড লিস্ট */}
      {displayedOrders.length === 0 ? (
        <div className="bg-white p-8 sm:p-10 rounded-2xl text-center border border-gray-100 shadow-2xs">
          <p className="text-gray-500 text-sm sm:text-base font-medium">
            এই তালিকায় কোনো অর্ডার নেই।
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedOrders.map((order) => (
            <SellerOrderCard key={order._id} order={order} riders={riders} />
          ))}
        </div>
      )}
    </>
  );
}
