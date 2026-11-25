"use client";

import React from "react";
import { Store } from "lucide-react";

export default function SellerShopInfoBox({
  sellerInfo,
  setSellerInfo,
  districts,
  upazilas,
  unions,
}) {
  const handleChange = (e) => {
    setSellerInfo({ ...sellerInfo, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-green-50/60 p-3 sm:p-4 rounded-xl border border-green-100 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <h3 className="text-xs sm:text-sm font-bold text-green-800 flex items-center gap-1.5">
          <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>দোকান ও বাজারের তথ্য</span>
        </h3>
        <span className="text-[10px] sm:text-[11px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
          প্রোফাইল থেকে সংযুক্ত
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">দোকানের নাম</label>
          <input
            type="text"
            name="shopName"
            required
            placeholder="উদাঃ বিসমিল্লাহ স্টোর"
            value={sellerInfo.shopName}
            onChange={handleChange}
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">দোকানদারের নাম</label>
          <input
            type="text"
            name="sellerName"
            required
            placeholder="উদাঃ মোঃ আব্দুল করিম"
            value={sellerInfo.sellerName}
            onChange={handleChange}
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 pt-0.5">
        <div>
          <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">জেলা</label>
          <select
            name="district"
            value={sellerInfo.district}
            onChange={(e) =>
              setSellerInfo({ ...sellerInfo, district: e.target.value, upazila: "", union: "" })
            }
            className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-green-500"
          >
            {districts.map((dist) => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">উপজেলা</label>
          <select
            name="upazila"
            required
            value={sellerInfo.upazila}
            onChange={(e) => setSellerInfo({ ...sellerInfo, upazila: e.target.value, union: "" })}
            className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">নির্বাচন করুন</option>
            {upazilas.map((upz) => (
              <option key={upz} value={upz}>{upz}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">ইউনিয়ন / এলাকা</label>
          <input
            list="seller-unions"
            name="union"
            placeholder="ইউনিয়ন..."
            value={sellerInfo.union}
            onChange={handleChange}
            className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
          <datalist id="seller-unions">
            {unions.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">বাজার / হাটের নাম</label>
          <input
            type="text"
            name="moholla"
            required
            placeholder="উদাঃ আমতলা বাজার"
            value={sellerInfo.moholla}
            onChange={handleChange}
            className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
    </div>
  );
}
