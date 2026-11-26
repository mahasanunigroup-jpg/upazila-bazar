import React from "react";
import Link from "next/link";
import { LayoutGrid, ArrowUpRight } from "lucide-react";

export default function SellerCategorySummary({ categories = [] }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 p-3.5 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <LayoutGrid className="w-4 h-4 text-emerald-600 shrink-0" />
          <h3 className="font-bold text-gray-800 text-xs sm:text-sm">
            আমার পণ্যের ক্যাটাগরিসমূহ
          </h3>
          <span className="text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
            {categories.length.toLocaleString("bn-BD")} টি
          </span>
        </div>

        <Link
          href="/seller/products"
          className="text-[11px] sm:text-xs font-semibold text-emerald-600 hover:underline"
        >
          সব পণ্য →
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="py-4 text-center bg-gray-50/70 rounded-xl border border-dashed border-gray-200">
          <p className="text-xs text-gray-500">এখনো কোনো ক্যাটাগরিতে পণ্য যোগ করা হয়নি।</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href="/seller/products"
              className="p-2.5 sm:p-3 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-emerald-50/40 hover:border-emerald-200 transition flex items-center justify-between gap-2 min-w-0"
            >
              <div className="min-w-0">
                <p className="font-bold text-gray-800 text-xs truncate">
                  {cat.name}
                </p>
                <p className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold mt-0.5">
                  {cat.count.toLocaleString("bn-BD")} টি পণ্য
                </p>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
