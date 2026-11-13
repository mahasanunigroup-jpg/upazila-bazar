"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RiderActionButtons({ orderId, currentStatus }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateDelivery = async (newStatus) => {
    setLoading(true);
    try {
      const res = await fetch("/api/rider/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, deliveryStatus: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("স্ট্যাটাস আপডেট ব্যর্থ হয়েছে!");
      }
    } catch (error) {
      alert("নেটওয়ার্ক সমস্যা হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === "delivered") {
    return (
      <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-lg">
        ✓ ডেলিভারি সম্পন্ন
      </span>
    );
  }

  return (
    <div className="flex gap-2">
      {currentStatus === "assigned" && (
        <button
          disabled={loading}
          onClick={() => updateDelivery("picked_up")}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition cursor-pointer disabled:opacity-50"
        >
          {loading ? "অপেক্ষা করুন..." : "পার্সেল পিকআপ করেছি"}
        </button>
      )}
      <button
        disabled={loading}
        onClick={() => updateDelivery("delivered")}
        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition cursor-pointer disabled:opacity-50"
      >
        {loading ? "সেভ হচ্ছে..." : "ডেলিভারি সম্পন্ন (Delivered)"}
      </button>
    </div>
  );
}
