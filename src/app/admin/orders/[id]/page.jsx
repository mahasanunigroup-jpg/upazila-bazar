"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  ShieldAlert,
  CheckCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";

// মক ডাটা (পার্ট ২ এর সাথে মিল রেখে)
const INITIAL_ORDER = {
  id: "UB-98432",
  date: "১১ নভেম্বর, ২০২৬",
  status: "processing",
  totalAmount: "১,২৫০ টাকা",
  paymentMethod: "Cash on Delivery",
  customer: {
    name: "আব্দুর রহমান",
    phone: "017XXXXXXXX",
    address: "থানা রোড, উপজেলা বাজার, ভৈরব, কিশোরগঞ্জ",
  },
};

const statusOptions = [
  {
    id: "pending",
    label: "Pending (অর্ডার গৃহীত হয়েছে)",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    id: "processing",
    label: "Processing (প্যাকিং চলছে)",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "shipped",
    label: "Shipped (ডেলিভারির জন্য বের হয়েছে)",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  {
    id: "delivered",
    label: "Delivered (ডেলিভারি সম্পন্ন)",
    color: "bg-green-100 text-green-800 border-green-200",
  },
];

export default function AdminOrderControl() {
  const [order, setOrder] = useState(INITIAL_ORDER);
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // স্ট্যাটাস আপডেট হ্যান্ডলার
  const handleStatusChange = (e) => {
    setCurrentStatus(e.target.value);
  };

  // ডাটাবেজ বা স্টেট আপডেট সাবমিট
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccessMessage("");

    // API কল সিমুলেশন (১ সেকেন্ড লোডিং)
    setTimeout(() => {
      setOrder({ ...order, status: currentStatus });
      setIsUpdating(false);
      setSuccessMessage("অর্ডার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!");

      // ৩ সেকেন্ড পর মেসেজ হাইড করা
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 1000);
  };

  // বর্তমান স্ট্যাটাসের স্টাইল বের করা
  const activeStatusConfig = statusOptions.find(
    (opt) => opt.id === order.status,
  );

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ব্যাক বাটন ও টাইটেল */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/orders"
            className="flex items-center text-sm font-medium text-gray-600 hover:text-green-600 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> ড্যাশবোর্ডে ফিরুন
          </Link>
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold flex items-center gap-1 border border-red-200">
            <ShieldAlert className="w-3.5 h-3.5" /> অ্যাডমিন প্যানেল
          </span>
        </div>

        {/* মেইন কন্ট্রোল কার্ড */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* অর্ডার সামারি */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-gray-100 pb-4 gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" /> অর্ডার
                ম্যানেজমেন্ট
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                আইডি: #{order.id} | তারিখ: {order.date}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold border ${activeStatusConfig?.color}`}
            >
              বর্তমান অবস্থা: {activeStatusConfig?.label.split(" ")[0]}
            </div>
          </div>

          {/* কাস্টমার ইনফো প্রিভিউ */}
          <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-2 border border-gray-100">
            <p className="text-gray-700 font-bold">ডেলিভারি বিবরণ:</p>
            <p className="text-gray-600">
              <span className="font-semibold">নাম:</span> {order.customer_name}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">মোবাইল:</span>{" "}
              {order.customer_phone}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">ঠিকানা:</span>{" "}
              {order.customer_address}
            </p>
          </div>

          {/* সাকসেস নোটিফিকেশন */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-2 text-sm font-semibold animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              {successMessage}
            </div>
          )}

          {/* স্ট্যাটাস আপডেট ফর্ম */}
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                অর্ডারের নতুন ধাপ নির্বাচন করুন:
              </label>
              <select
                id="status"
                value={currentStatus}
                onChange={handleStatusChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              >
                {statusOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isUpdating || currentStatus === order.status}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold transition shadow-sm ${
                currentStatus === order.status
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 active:scale-[0.99]"
              }`}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  আপডেট হচ্ছে...
                </>
              ) : (
                "স্ট্যাটাস পরিবর্তন করুন"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
