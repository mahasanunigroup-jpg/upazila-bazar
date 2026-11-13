"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SellerStatusSelect({ orderId, currentStatus }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ডেলিভারি হয়ে গেলে আর ড্রপডাউন দেখাবে না
  if (currentStatus === "delivered" || status === "delivered") {
    return (
      <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-green-100 text-green-800 border border-green-300">
        ডেলিভারি সম্পন্ন
      </span>
    );
  }

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);

    try {
      const res = await fetch("/api/seller/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, newStatus }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("স্ট্যাটাস আপডেট ব্যর্থ হয়েছে!");
        setStatus(currentStatus);
      }
    } catch (error) {
      alert("নেটওয়ার্ক সমস্যা হয়েছে!");
      setStatus(currentStatus);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    confirmed: "bg-blue-100 text-blue-800 border-blue-300",
    packed: "bg-purple-100 text-purple-800 border-purple-300",
    shipped: "bg-indigo-100 text-indigo-800 border-indigo-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        disabled={loading}
        onChange={handleStatusChange}
        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer transition ${
          statusColors[status] || "bg-gray-100"
        } ${loading ? "opacity-50" : ""}`}
      >
        <option value="pending">পেন্ডিং (Pending)</option>
        <option value="confirmed">কনফার্মড (Confirmed)</option>
        <option value="packed">প্যাকড (Packed - রেডি)</option>
        <option value="cancelled">বাতিল (Cancel)</option>
      </select>
      {loading && <span className="text-xs text-gray-500 animate-pulse">সেভ হচ্ছে...</span>}
    </div>
  );
}
