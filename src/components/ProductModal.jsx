"use client";

import React from "react";
import Link from "next/link";
import { X, ShoppingCart, Store, MapPin } from "lucide-react";

export default function ProductModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  const cleanDescription = product.description
    ? product.description
        .replace(/^(\[[^\]]*\]\s*)+/g, "")
        .replace(/^[\]\)\s]+/, "")
        .trim()
    : "";

    const rawTitle = product.title || "";
  const parenIndex = rawTitle.indexOf("(");
  const mainTitle = parenIndex > 0 ? rawTitle.slice(0, parenIndex).trim() : rawTitle;
  const unitTitle = parenIndex > 0 ? rawTitle.slice(parenIndex).trim() : "";


  const locationText = [product.moholla, product.union, product.upazila]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/55 backdrop-blur-2xs z-50 flex items-end sm:items-center justify-center p-2 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-md sm:max-w-lg w-full overflow-hidden shadow-2xl max-h-[88vh] flex flex-col"
      >
        {/* ইমেজ অংশ */}
        <div className="relative h-36 min-[400px]:h-44 sm:h-52 md:h-56 bg-white border-b border-gray-100 p-2.5 sm:p-4 shrink-0">
          <img
            src={product.image || "https://placehold.co"}
            alt={product.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co";
            }}
            className="w-full h-full object-contain"
          />
          <button
            type="button"
            aria-label="বন্ধ করুন"
            onClick={onClose}
            className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* মাঝখানের তথ্য অংশ */}
        <div className="p-3.5 sm:p-5 space-y-3 overflow-y-auto flex-1">
          {/* ওপরের সারি: বামে ক্যাটাগরি, ডানে দোকান ও লোকেশন */}
          <div className="flex items-start justify-between gap-2">
            <span className="bg-green-50 text-green-700 text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
              {product.category}
            </span>

            <div className="text-right min-w-0">
              <p className="text-xs sm:text-sm font-bold text-gray-700 flex items-center justify-end gap-1">
                <Store className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span className="truncate">
                  {product.shopName || "উপজেলা ভেরিফায়েড স্টোর"}
                </span>
              </p>
              {locationText && (
                <p className="text-[11px] text-gray-500 flex items-center justify-end gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-green-600 shrink-0" />
                  <span className="truncate">{locationText}</span>
                </p>
              )}
            </div>
          </div>

          {/* প্রোডাক্টের নাম (ছোট ইউনিটসহ) ও ঠিক নিচেই বিবরণ */}
          <div>
            <h3 className="text-gray-800 leading-snug">
              <span className="text-lg sm:text-xl font-extrabold">
                {mainTitle}
              </span>
              {unitTitle && (
                <span className="text-xs sm:text-sm font-normal text-gray-500 ml-1.5">
                  {unitTitle}
                </span>
              )}
            </h3>

            {cleanDescription && (
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-1">
                {cleanDescription}
              </p>
            )}
          </div>

          {/* দাম */}
          <div className="pt-0.5">
            <p className="text-xl sm:text-2xl font-extrabold text-green-600">
              ৳ {Number(product.price || 0).toLocaleString("bn-BD")} টাকা
            </p>
          </div>
        </div>

        {/* নিচের ফিক্সড বাটন অংশ */}
        <div className="p-3 sm:p-4 bg-gray-50/70 border-t border-gray-100 space-y-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              onAddToCart(product);
              onClose();
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-bold py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer active:scale-[0.99]"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" /> কার্টে যোগ করুন
          </button>

          <Link
            href={`/product/${product._id}`}
            className="block w-full text-center py-2 text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition"
          >
            বিস্তারিত বিবরণ ও ক্রেতাদের রিভিউ দেখুন →
          </Link>
        </div>
      </div>
    </div>
  );
}
