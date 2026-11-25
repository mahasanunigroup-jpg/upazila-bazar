"use client";

import { useState } from "react";
import SellerStatusSelect from "../SellerStatusSelect";
import SellerRiderSelect from "../SellerRiderSelect";
import UniversalPrintButtons from "@/components/invoice/UniversalPrintButtons";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function SellerOrderCard({ order, riders }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-2xs border border-gray-200 overflow-hidden transition-all">
      {/* কলাপ্সিবল টপ বার */}
      <div className="bg-gray-50/90 hover:bg-gray-100/70 px-3.5 sm:px-5 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 text-xs sm:text-sm transition">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-3 cursor-pointer flex-1 min-w-0"
        >
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="font-extrabold text-emerald-700">#{order.orderId}</span>
            <span className="text-gray-500 text-xs">
              {new Date(order.createdAt).toLocaleDateString("bn-BD", {
                day: "numeric",
                month: "short",
              })}
            </span>
            <span className="text-gray-700 font-medium text-xs truncate max-w-[140px] sm:max-w-[200px]">
              • {order.customer_name} ({order.myItems.length} আইটেম)
            </span>
          </div>

          <span
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap ${
              order.deliveryStatus === "delivered"
                ? "bg-green-100 text-green-800"
                : order.deliveryStatus === "assigned"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
            }`}
          >
            ডেলিভারি: {order.deliveryStatus}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-2.5 pt-2 lg:pt-0 border-t lg:border-none border-gray-200/70">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <SellerStatusSelect
              orderId={order._id}
              currentStatus={
                order.deliveryStatus === "delivered" ? "delivered" : order.orderPackingStatus
              }
            />
            {order.orderPackingStatus !== "cancelled" &&
              order.deliveryStatus !== "delivered" && (
                <SellerRiderSelect
                  orderId={order._id}
                  currentRiderId={order.riderId}
                  riders={riders}
                />
              )}
          </div>

          {/* ছোট ফোনেও যাতে বাটন কেটে না যায় সেজন্য flex-wrap */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-1.5 sm:pt-0 border-t sm:border-none border-gray-200/60">
            <span className="font-extrabold text-gray-800 whitespace-nowrap">
              বিল: ৳{Number(order.myTotal || 0).toLocaleString("bn-BD")}
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              <UniversalPrintButtons order={order} role="seller" />

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 hover:border-emerald-500 text-gray-700 hover:text-emerald-700 text-xs font-bold transition cursor-pointer shrink-0"
              >
                <span>{isExpanded ? "বন্ধ করুন" : "বিস্তারিত"}</span>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* কলাপ্স করা বিস্তারিত অংশ */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 bg-emerald-50/30 border-b border-gray-100 text-xs sm:text-sm grid grid-cols-1 sm:flex sm:flex-wrap gap-x-6 gap-y-1 text-gray-700">
            <p>
              <span className="font-semibold text-gray-900">ক্রেতা:</span> {order.customer_name}
            </p>
            <p>
              <span className="font-semibold text-gray-900">ফোন:</span>{" "}
              <a
                href={`tel:${order.customer_phone}`}
                className="text-emerald-700 font-medium hover:underline"
              >
                {order.customer_phone}
              </a>
            </p>
            <p className="break-words">
              <span className="font-semibold text-gray-900">এলাকা:</span> {order.upazila}
              {order.district ? `, ${order.district}` : ""}{" "}
              {order.customer_address ? `(${order.customer_address})` : ""}
            </p>
          </div>

          <div className="px-3.5 sm:px-5 py-3 sm:py-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] sm:text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-semibold">পণ্যের নাম</th>
                  <th className="pb-2 font-semibold text-center whitespace-nowrap">পরিমাণ</th>
                  <th className="pb-2 font-semibold text-right whitespace-nowrap">দাম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {order.myItems.map((item) => (
                  <tr key={item._id}>
                    <td className="py-2 font-medium text-gray-800 pr-2">{item.name}</td>
                    <td className="py-2 text-gray-600 text-center whitespace-nowrap">
                      {item.qty} টি
                    </td>
                    <td className="py-2 font-bold text-gray-800 text-right whitespace-nowrap">
                      ৳{(item.price * item.qty).toLocaleString("bn-BD")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {order.feedback && (
            <div className="bg-amber-50/90 border-t border-amber-200 px-3.5 sm:px-5 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-amber-800 flex items-center gap-1.5">
                ⭐ কাস্টমার রেটিং: {order.feedback.sellerRating} / 5
              </span>
              {order.feedback.sellerComment && (
                <span className="text-gray-700 italic">
                  &ldquo;{order.feedback.sellerComment}&rdquo;
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
