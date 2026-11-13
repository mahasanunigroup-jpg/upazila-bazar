"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SellerRiderSelect({ orderId, currentRiderId, riders }) {
  const [selectedRider, setSelectedRider] = useState(currentRiderId || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRiderAssign = async (e) => {
    const newRiderId = e.target.value;
    setSelectedRider(newRiderId);
    setLoading(true);

    try {
      const res = await fetch("/api/seller/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, riderId: newRiderId }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("রাইডার অ্যাসাইন ব্যর্থ হয়েছে!");
        setSelectedRider(currentRiderId || "");
      }
    } catch (error) {
      alert("নেটওয়ার্ক সমস্যা হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedRider}
        disabled={loading}
        onChange={handleRiderAssign}
        className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
      >
        <option value="">-- রাইডার পাঠান --</option>
        {riders.map((rider) => (
          <option key={rider._id} value={rider._id}>
            {rider.name} ({rider.upazila || "রাইডার"} - {rider.phone || ""})
          </option>
        ))}
      </select>
      {loading && <span className="text-xs text-emerald-600 animate-pulse">সেভ হচ্ছে...</span>}
    </div>
  );
}
