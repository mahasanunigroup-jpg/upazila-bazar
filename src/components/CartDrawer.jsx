"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

const UNIT_BANGLA = {
  g: "গ্রাম",
  kg: "কেজি",
  piece: "পিস",
  box: "বক্স",
  ti: "টি",
};

// পণ্যের মূল ধরন শনাক্ত করা
function detectBaseType(item) {
  if (item.sellingType === "box") return "box";
  const title = (item.title || "").toLowerCase();
  if (title.includes("বক্স") || title.includes("(box)")) return "box";
  if (title.includes("পিস") || title.includes("টি")) return "piece";
  return "weight";
}

// কাস্টমারের টাইপ করা সংখ্যা ও ইউনিট থেকে মূল quantity অনুপাত বের করা
function calculateActualQty(numValue, unit, item) {
  const val = Math.max(0, Number(numValue) || 0);
  const baseType = detectBaseType(item);

  if (baseType === "box") {
    const perBox = item.piecesPerBox > 0 ? item.piecesPerBox : 100;
    if (unit === "piece") return Number((val / perBox).toFixed(4));
    return val;
  }

  if (baseType === "weight") {
    if (unit === "g") return Number((val / 1000).toFixed(4));
    return val;
  }

  return val;
}

// বর্তমান quantity থেকে ইনপুট ঘরের সংখ্যা ও ইউনিট বের করা
function getInitialDisplay(item) {
  const baseType = detectBaseType(item);

  if (baseType === "box") {
    const perBox = item.piecesPerBox > 0 ? item.piecesPerBox : 100;
    if (item.quantity > 0 && item.quantity < 1) {
      return {
        num: Math.round(item.quantity * perBox),
        unit: "piece",
      };
    }
    return { num: item.quantity, unit: "box" };
  }

  if (baseType === "weight") {
    if (item.quantity > 0 && item.quantity < 1) {
      return {
        num: Math.round(item.quantity * 1000),
        unit: "g",
      };
    }
    return { num: item.quantity, unit: "kg" };
  }

  return { num: item.quantity, unit: "ti" };
}

export default function CartDrawer({ isOpen, onClose, cart, onUpdateQty, onRemove }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const subTotal = Math.round(
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 flex justify-end overscroll-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-[88%] max-w-sm h-dvh max-h-dvh flex flex-col justify-between shadow-2xl overflow-hidden"
      >
        {/* স্লিম হেডার */}
        <div className="px-3.5 py-3 border-b border-gray-100 flex items-center justify-between bg-green-600 text-white shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>আপনার বাজার ব্যাগ ({cart.length})</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ব্যাগ বন্ধ করুন"
            className="p-1 rounded-full hover:bg-green-700 transition cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        {/* কম্প্যাক্ট প্রোডাক্ট লিস্ট */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2.5 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-2.5">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-gray-500 text-xs sm:text-sm font-medium">
                আপনার বাজার ব্যাগ এখন খালি!
              </p>
              <button
                type="button"
                onClick={onClose}
                className="text-green-600 font-bold text-xs sm:text-sm underline cursor-pointer"
              >
                কেনাকাটা শুরু করুন
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const { num, unit } = getInitialDisplay(item);
              const itemTotal = Math.round(item.price * item.quantity);

              return (
                <div
                  key={item._id}
                  className="bg-gray-50/90 p-2 rounded-xl border border-gray-200/70 space-y-1.5"
                >
                  {/* উপরের রো: ছবি + নাম + ডিলিট বাটন */}
                  <div className="flex gap-2 items-start">
                    <img
                      src={item.image}
                      alt={item.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co";
                      }}
                      className="w-11 h-11 rounded-lg object-cover bg-white border border-gray-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-gray-800 text-xs leading-snug line-clamp-1">
                          {item.title}
                        </h4>

                        <button
                          type="button"
                          onClick={() => onRemove(item._id)}
                          aria-label="পণ্য বাদ দিন"
                          className="text-red-400 hover:text-red-600 p-0.5 -mt-0.5 shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* মূল দাম (ছোট) ও নেওয়া পরিমাণের মোট দাম (বড় ও স্পষ্ট) */}
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span className="text-[10px] font-medium text-gray-500 whitespace-nowrap">
                          মূল দাম: ৳{item.price}
                        </span>

                        <span className="bg-green-50 border border-green-200 text-green-700 font-extrabold text-xs px-2 py-0.5 rounded-md whitespace-nowrap">
                          ৳ {itemTotal} টাকা
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* নিচের স্লিম রো: হাতে পরিমাণ লেখার ঘর + ইউনিট সিলেক্টর */}
                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-200/60">
                    <span className="text-[10px] font-semibold text-gray-500 shrink-0">
                      পরিমাণ:
                    </span>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={num || ""}
                        placeholder="0"
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === "") {
                            onUpdateQty(item._id, 0.0001);
                            return;
                          }
                          const nextQty = calculateActualQty(raw, unit, item);
                          if (nextQty > 0) {
                            const label = `${raw} ${UNIT_BANGLA[unit] || ""}`.trim();
                            onUpdateQty(item._id, nextQty, label);
                          }
                        }}
                        className="w-14 rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[11px] font-bold text-gray-900 text-center focus:border-green-500 focus:outline-none"
                      />

                      <select
                        value={unit}
                        onChange={(e) => {
                          const newUnit = e.target.value;
                          const safeNum = num > 0 ? num : 1;
                          const nextQty = calculateActualQty(safeNum, newUnit, item);
                          if (nextQty > 0) {
                            const label = `${safeNum} ${UNIT_BANGLA[newUnit] || ""}`.trim();
                            onUpdateQty(item._id, nextQty, label);
                          }
                        }}
                        className="rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-gray-700 focus:border-green-500 focus:outline-none cursor-pointer"
                      >
                        <option value="g">g (গ্রাম)</option>
                        <option value="kg">kg (কেজি)</option>
                        <option value="piece">pice (পিস)</option>
                        <option value="box">box (বক্স)</option>
                        <option value="ti">টি</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ফিক্সড স্লিম ফুটার */}
        {cart.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50 space-y-2 shrink-0">
            <div className="flex justify-between items-center gap-2 text-xs font-bold text-gray-800">
              <span className="truncate">সর্বমোট (ডেলিভারি ছাড়া):</span>
              <span className="text-green-600 text-sm font-extrabold whitespace-nowrap shrink-0">
                ৳ {subTotal} টাকা
              </span>
            </div>

            <Link
              href="/checkout"
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              <span>চেকআউট সম্পন্ন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
