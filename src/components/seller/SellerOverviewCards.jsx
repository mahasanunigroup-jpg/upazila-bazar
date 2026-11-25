import React from "react";
import Link from "next/link";
import { Wallet, ShoppingBag, Package, Plus, ArrowUpRight } from "lucide-react";

export default function SellerOverviewCards({
  sellerName,
  netReceivable,
  totalRevenue,
  commissionPercent,
  commissionAmount,
  pendingOrdersCount,
  totalProducts,
}) {
  return (
    <div className="space-y-3">
      {/* স্লিম স্বাগতম ব্যানার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-gradient-to-r from-emerald-700 to-green-600 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-base sm:text-xl font-bold leading-snug">
            স্বাগতম, {sellerName}! 👋
          </h1>
          <p className="text-[11px] sm:text-xs text-emerald-50 mt-0.5">
            আপনার দোকানের বিক্রি, অর্ডার ও পণ্যের নিয়ন্ত্রণ কেন্দ্র
          </p>
        </div>

        <Link
          href="/seller/add-product"
          className="inline-flex items-center justify-center gap-1 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-50 rounded-xl shadow-2xs transition shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> নতুন পণ্য যোগ করুন
        </Link>
      </div>

      {/* ৩টি কম্প্যাক্ট ও স্মার্ট কার্ড */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
        {/* কার্ড ১: নিট পাওনা */}
        <Link
          href="/seller/earnings"
          className="sm:col-span-2 lg:col-span-1 bg-white p-3.5 sm:p-4 rounded-2xl shadow-2xs border border-emerald-200 bg-emerald-50/25 hover:border-emerald-500 transition flex items-center justify-between gap-2.5 min-w-0"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-600 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">নিট পাওনা (কমিশন বাদে)</span>
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-emerald-600 mt-0.5">
              ৳{netReceivable.toLocaleString("bn-BD")}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5 truncate">
              বিক্রি: ৳{totalRevenue.toLocaleString("bn-BD")} • কমিশন ({commissionPercent}%): -৳{commissionAmount.toLocaleString("bn-BD")}
            </p>
          </div>
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        {/* কার্ড ২: অর্ডার ও ডেলিভারি */}
        <Link
          href="/seller/orders"
          className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-2xs border border-amber-200/80 bg-amber-50/15 hover:border-amber-500 transition flex items-center justify-between gap-2.5 min-w-0"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-600 flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">অর্ডার ও ডেলিভারি</span>
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-amber-600 mt-0.5">
              {pendingOrdersCount.toLocaleString("bn-BD")} টি পেন্ডিং
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5 truncate">
              অর্ডার প্যাক ও রাইডার পাঠান
            </p>
          </div>
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        {/* কার্ড ৩: আমার পণ্যসমূহ */}
        <Link
          href="/seller/products"
          className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-2xs border border-blue-200/80 bg-blue-50/15 hover:border-blue-500 transition flex items-center justify-between gap-2.5 min-w-0"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-600 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">আমার পণ্যসমূহ</span>
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-blue-600 mt-0.5">
              {totalProducts.toLocaleString("bn-BD")} টি পণ্য
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5 truncate">
              দাম, তথ্য এডিট ও ডিলিট করুন
            </p>
          </div>
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
