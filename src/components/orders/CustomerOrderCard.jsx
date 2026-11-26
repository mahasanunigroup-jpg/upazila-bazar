"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Truck, Store, Phone, MapPin } from "lucide-react";
import OrderFeedbackBox from "./OrderFeedbackBox";

const STATUS_LABEL = {
  pending: { text: "পেন্ডিং", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  accepted: { text: "গৃহীত", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  processing: { text: "গৃহীত", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  shipped: { text: "পাঠানো হয়েছে", cls: "bg-purple-50 text-purple-700 border-purple-200" },
  delivered: { text: "ডেলিভার্ড", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const parsePrice = (val) => Number(String(val || 0).replace(/[^\d.]/g, "")) || 0;
const parseQty = (val) => Number(String(val || 1).replace(/[^\d]/g, "")) || 1;

export default function CustomerOrderCard({
  order,
  isCardOpen = true,
  onToggleCard,
  onFeedbackSaved,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const normalizedStatus = order.status === "processing" ? "accepted" : order.status;
  const steps = ["pending", "accepted", "shipped", "delivered"];
  const idx = steps.indexOf(normalizedStatus);
  const currentStep = idx === -1 ? 0 : idx;
  const badge = STATUS_LABEL[order.status] || STATUS_LABEL.pending;

  // দোকান অনুযায়ী পণ্য, মোট সংখ্যা ও দোকানের সাব-টোটাল গ্রুপ করা
  const shopGroups = useMemo(() => {
    const map = {};
    (order.items || []).forEach((item) => {
      const sName = item.shopName || order.shopName || "উপজেলা ভেরিফায়েড স্টোর";
      if (!map[sName]) {
        map[sName] = { shopName: sName, items: [], totalQty: 0, totalAmount: 0 };
      }
      const q = parseQty(item.qty);
      const p = parsePrice(item.price);
      map[sName].items.push(item);
      map[sName].totalQty += q;
      map[sName].totalAmount += p;
    });
    return Object.values(map);
  }, [order.items, order.shopName]);

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 mb-2.5 overflow-hidden transition-all">
      {/* স্লিম ক্লিকযোগ্য কার্ড হেডার */}
      <button
        type="button"
        onClick={onToggleCard}
        className="w-full text-left px-3 py-2.5 sm:px-5 sm:py-4 flex items-center justify-between gap-2 hover:bg-gray-50/70 transition cursor-pointer"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-emerald-600 text-xs sm:text-sm">
              {order.id}
            </span>
            <span
              className={`text-[9px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-full border ${badge.cls}`}
            >
              {badge.text}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{order.date}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <p className="text-[9px] sm:text-[10px] text-gray-400 leading-none">মোট বিল</p>
            <p className="font-extrabold text-gray-900 text-xs sm:text-sm mt-0.5">
              {order.total}
            </p>
          </div>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
            {isCardOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </div>
        </div>
      </button>

      {/* খোলা অবস্থায় কম্প্যাক্ট ভেতরের বডি */}
      {isCardOpen && (
        <div className="px-3 pb-3 sm:px-5 sm:pb-5 pt-2.5 border-t border-gray-100">
          {/* স্লিম স্টেপার */}
          <div className="mb-4 mt-1 relative flex items-center justify-between w-full px-1">
            <div className="absolute left-0 right-0 top-3 h-0.5 bg-gray-200 -z-0">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
            {["পেন্ডিং", "গৃহীত", "পাঠানো হয়েছে", "ডেলিভার্ড"].map((label, stepIdx) => (
              <div key={stepIdx} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs ${
                    currentStep >= stepIdx
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepIdx + 1}
                </div>
                <p className="text-[9px] sm:text-[11px] mt-1 font-medium text-gray-600">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* দোকান অনুযায়ী গ্রুপ করা আইটেম ও মোট হিসাব */}
          <div className="bg-gray-50 p-2.5 sm:p-3.5 rounded-lg text-[11px] sm:text-xs text-gray-600 space-y-2.5">
            {shopGroups.map((group) => (
              <div
                key={group.shopName}
                className="bg-white rounded-lg border border-gray-200/70 p-2.5 space-y-1.5"
              >
                {/* দোকানের হেডার: দোকানের নাম, মোট কয়টি পণ্য ও দোকানের মোট দাম */}
                                 {/* দোকানের হেডার: এক লাইনেই দোকানের নাম + ছোট ফন্টে দোকান বিল (ডিভাইস অনুযায়ী বড় হবে) */}
                <div className="flex items-center justify-between gap-1.5 pb-1.5 border-b border-gray-100">
                  <div className="font-bold text-emerald-700 flex items-center gap-1 min-w-0 text-[11px] sm:text-xs md:text-sm">
                    <Store className="hidden sm:inline w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                    <span className="break-words leading-tight">
                      {group.shopName}{" "}
                      <span className="text-[9px] sm:text-[11px] md:text-xs font-semibold text-gray-500 whitespace-nowrap">
                        ({group.items.length}টি)
                      </span>
                    </span>
                  </div>

                  <span className="font-extrabold text-gray-800 whitespace-nowrap shrink-0 text-[12px] sm:text-xs md:text-sm">
                    <span className="text-[9px] sm:text-[11px] md:text-xs font-semibold text-gray-500">
                      দোকান বিল:{" "}
                    </span>
                    ৳{group.totalAmount.toLocaleString("bn-BD")}
                  </span>
                </div>



                {/* ওই দোকানের পণ্যগুলোর তালিকা */}
                <div className="space-y-1">
                  {group.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-gray-600">
                      <span className="truncate pr-2">
                        • {item.name} ({item.qty})
                      </span>
                      <span className="font-medium text-gray-800 shrink-0">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* সর্বমোট বিল ও পেমেন্ট মাধ্যম */}
            <div className="flex items-center justify-between pt-1.5 px-1">
              <div>
                <span className="font-bold text-gray-700">পেমেন্ট: </span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="text-xs sm:text-sm">
                সর্বমোট বিল:{" "}
                <span className="text-sm sm:text-base font-extrabold text-emerald-700">
                  {order.total}
                </span>
              </div>
            </div>
          </div>

          {/* বিস্তারিত তথ্য ও ফিডব্যাক */}
          <div className="mt-2.5 pt-2.5 border-t border-gray-100 space-y-2">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/80 py-2 px-3 rounded-lg transition cursor-pointer"
            >
              {isExpanded ? (
                <>
                  বিস্তারিত তথ্য বন্ধ করুন <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  রাইডার ও বিক্রেতার বিস্তারিত দেখুন <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {isExpanded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-gray-50 p-2.5 sm:p-3 rounded-lg border border-gray-100 text-[11px] sm:text-xs text-gray-700">
                <div className="space-y-0.5">
                  <p className="font-bold text-gray-800 flex items-center gap-1">
                    <Store className="w-3 h-3 text-emerald-600" /> বিক্রেতা ও দোকান
                  </p>
                  <p>{order.shopName || "উপজেলা ভেরিফায়েড স্টোর"}</p>
                  {order.sellerPhone && (
                    <p className="flex items-center gap-1 text-gray-500">
                      <Phone className="w-3 h-3" /> {order.sellerPhone}
                    </p>
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-gray-800 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-blue-600" /> ডেলিভারি রাইডার
                  </p>
                  <p>{order.riderName || "রাইডার নির্ধারণ করা হচ্ছে"}</p>
                  {order.riderPhone && (
                    <p className="flex items-center gap-1 text-gray-500">
                      <Phone className="w-3 h-3" /> {order.riderPhone}
                    </p>
                  )}
                  {order.deliveryAddress && (
                    <p className="flex items-center gap-1 text-gray-500">
                      <MapPin className="w-3 h-3" /> {order.deliveryAddress}
                    </p>
                  )}
                </div>
              </div>
            )}

            <OrderFeedbackBox order={order} onFeedbackSaved={onFeedbackSaved} />
          </div>
        </div>
      )}
    </div>
  );
}
