"use client";

import React, { useState, useMemo, memo } from "react";
import {
  LayoutGrid,
  ShoppingBasket,
  Carrot,
  Apple,
  Milk,
  Fish,
  Flame,
  Cookie,
  Pill,
  Utensils,
  Pizza,
  Shirt,
  Smartphone,
  Sparkles,
  Heart,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const CATEGORY_DATA = [
  { name: "সব পণ্য", value: "সব পণ্য", icon: LayoutGrid, sub: [] },
  {
    name: "মুদি বাজার",
    value: "মুদি",
    icon: ShoppingBasket,
    sub: [
      { label: "সব মুদি পণ্য", value: "মুদি" },
      { label: "চাল ও ডাল", value: "চাল ও ডাল" },
      { label: "ভোজ্য তেল", value: "ভোজ্য তেল" },
      { label: "আটা ও ময়দা", value: "আটা ও ময়দা" },
      { label: "লবণ ও চিনি", value: "লবণ ও চিনি" },
    ],
  },
  {
    name: "তাজা শাক-সবজি",
    value: "সবজি",
    icon: Carrot,
    sub: [
      { label: "সব শাক-সবজি", value: "সবজি" },
      { label: "নিত্যদিনের সবজি", value: "নিত্যদিনের সবজি" },
      { label: "তাজা শাক", value: "তাজা শাক" },
      { label: "আলু, পেঁয়াজ ও রসুন", value: "আলু, পেঁয়াজ ও রসুন" },
    ],
  },
  {
    name: "দেশী ফলমূল",
    value: "ফল",
    icon: Apple,
    sub: [
      { label: "সব ফলমূল", value: "ফল" },
      { label: "মৌসুমী ফল", value: "মৌসুমী ফল" },
      { label: "বারোমাসি ফল", value: "বারোমাসি ফল" },
      { label: "খেজুর ও শুকনো ফল", value: "খেজুর ও শুকনো ফল" },
    ],
  },
  {
    name: "মাছ ও মাংস",
    value: "মাছ ও মাংস",
    icon: Fish,
    sub: [
      { label: "সব মাছ ও মাংস", value: "মাছ ও মাংস" },
      { label: "নদীর তাজা মাছ", value: "নদীর তাজা মাছ" },
      { label: "দেশী ও ব্রয়লার মুরগি", value: "দেশী ও ব্রয়লার মুরগি" },
      { label: "গরু ও খাসির মাংস", value: "গরু ও খাসির মাংস" },
    ],
  },
  {
    name: "দুধ ও ডিম",
    value: "দুগ্ধ",
    icon: Milk,
    sub: [
      { label: "সব দুধ ও ডিম", value: "দুগ্ধ" },
      { label: "তরল ও গুঁড়া দুধ", value: "তরল ও গুঁড়া দুধ" },
      { label: "হাঁস ও মুরগির ডিম", value: "হাঁস ও মুরগির ডিম" },
      { label: "খাঁটি ঘি ও মাখন", value: "খাঁটি ঘি ও মাখন" },
    ],
  },
  {
    name: "মসলাপাতি",
    value: "মসলা",
    icon: Flame,
    sub: [
      { label: "সব মসলাপাতি", value: "মসলা" },
      { label: "গুঁড়া মসলা", value: "গুঁড়া মসলা" },
      { label: "আস্ত গরম মসলা", value: "আস্ত গরম মসলা" },
      { label: "আদা ও রসুন বাটা", value: "আদা ও রসুন বাটা" },
    ],
  },
  {
    name: "বেকারি ও স্ন্যাকস",
    value: "স্ন্যাকস",
    icon: Cookie,
    sub: [
      { label: "সব স্ন্যাকস", value: "স্ন্যাকস" },
      { label: "বিস্কুট ও কেক", value: "বিস্কুট ও কেক" },
      { label: "চা ও কফি", value: "চা ও কফি" },
      { label: "মুড়ি ও চানাচুর", value: "মুড়ি ও চানাচুর" },
    ],
  },
  {
    name: "ওষুধ ও ফার্মেসি",
    value: "ওষুধ ও ফার্মেসি",
    icon: Pill,
    sub: [
      { label: "সব ওষুধ ও স্বাস্থ্যসেবা", value: "ওষুধ ও ফার্মেসি" },
      { label: "সাধারণ ওষুধ (OTC)", value: "সাধারণ ওষুধ" },
      { label: "প্রেসক্রিপশন ওষুধ", value: "প্রেসক্রিপশন ওষুধ" },
      { label: "শিশু ও মাতৃযত্ন", value: "শিশু ও মাতৃযত্ন" },
      { label: "ফার্স্ট এইড ও ডিভাইস", value: "ফার্স্ট এইড ও ডিভাইস" },
    ],
  },
  {
    name: "রেস্টুরেন্ট ও বিরিয়ানি",
    value: "রেস্টুরেন্ট ও বিরিয়ানি",
    icon: Utensils,
    sub: [
      { label: "সব রেস্টুরেন্ট খাবার", value: "রেস্টুরেন্ট ও বিরিয়ানি" },
      { label: "কাচ্চি ও বিরিয়ানি", value: "কাচ্চি ও বিরিয়ানি" },
      { label: "ভাত, মাছ ও ভর্তা", value: "ভাত, মাছ ও ভর্তা" },
      { label: "গ্রিল ও কাবাব", value: "গ্রিল ও কাবাব" },
    ],
  },
  {
    name: "ফাস্ট ফুড",
    value: "ফাস্ট ফুড",
    icon: Pizza,
    sub: [
      { label: "সব ফাস্ট ফুড", value: "ফাস্ট ফুড" },
      { label: "বার্গার ও স্যান্ডউইচ", value: "বার্গার ও স্যান্ডউইচ" },
      { label: "পিৎজা ও পাস্তা", value: "পিৎজা ও পাস্তা" },
      { label: "ফ্রাইড চিকেন ও রোল", value: "ফ্রাইড চিকেন ও রোল" },
    ],
  },
  {
    name: "কাপড় ও গার্মেন্টস",
    value: "কাপড় ও গার্মেন্টস",
    icon: Shirt,
    sub: [
      { label: "সব পোশাক", value: "কাপড় ও গার্মেন্টস" },
      { label: "ছেলেদের পোশাক", value: "ছেলেদের পোশাক" },
      { label: "মেয়েদের পোশাক", value: "মেয়েদের পোশাক" },
      { label: "বাচ্চাদের পোশাক", value: "বাচ্চাদের পোশাক" },
    ],
  },
  {
    name: "মোবাইল ও ইলেকট্রনিক্স",
    value: "মোবাইল ও ইলেকট্রনিক্স",
    icon: Smartphone,
    sub: [
      { label: "সব ইলেকট্রনিক্স", value: "মোবাইল ও ইলেকট্রনিক্স" },
      { label: "মোবাইল এক্সেসরিজ", value: "মোবাইল এক্সেসরিজ" },
      { label: "লাইট, ফ্যান ও সুইচ", value: "লাইট, ফ্যান ও সুইচ" },
      { label: "হোম অ্যাপ্লায়েন্স", value: "হোম অ্যাপ্লায়েন্স" },
    ],
  },
  {
    name: "কসমেটিকস ও কেয়ার",
    value: "কসমেটিকস",
    icon: Sparkles,
    sub: [
      { label: "সব কসমেটিকস", value: "কসমেটিকস" },
      { label: "স্কিন ও হেয়ার কেয়ার", value: "স্কিন ও হেয়ার কেয়ার" },
      { label: "পারফিউম ও বডি স্প্রে", value: "পারফিউম ও বডি স্প্রে" },
    ],
  },
];
function CategorySidebar({
  selectedCategory,
  setSelectedCategory,
  showWishlistOnly,
  setShowWishlistOnly,
  hasActiveFilter,
  resetFilters,
}) {
  const [expandedMenu, setExpandedMenu] = useState("");

  const activeMobileSubs = useMemo(() => {
    if (showWishlistOnly) return [];
    const found = CATEGORY_DATA.find(
      (cat) =>
        cat.value === selectedCategory ||
        cat.sub.some((s) => s.value === selectedCategory)
    );
    return found?.sub || [];
  }, [selectedCategory, showWishlistOnly]);

  const handleMainClick = (item) => {
    setShowWishlistOnly(false);
    setSelectedCategory(item.value);

    if (item.sub.length > 0) {
      setExpandedMenu((prev) => (prev === item.value ? "" : item.value));
    } else {
      setExpandedMenu("");
    }
  };

  return (
    <aside className="w-full lg:w-64 shrink-0 select-none">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-3 lg:p-4 lg:sticky lg:top-20">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 lg:pb-3 lg:mb-3 border-b border-gray-100">
          <h3 className="font-extrabold text-gray-800 text-sm lg:text-base">
            ক্যাটাগরি সমূহ
          </h3>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-red-500 font-bold flex items-center gap-1 active:scale-95 transition"
            >
              <RotateCcw className="w-3 h-3" /> রিসেট
            </button>
          )}
        </div>

        <ul className="flex lg:flex-col gap-1.5 overflow-x-auto lg:max-h-[calc(100vh-145px)] lg:overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORY_DATA.map((item) => {
            const Icon = item.icon;
            const isActive =
              !showWishlistOnly &&
              (selectedCategory === item.value ||
                item.sub.some((s) => s.value === selectedCategory));
            const isOpen = expandedMenu === item.value;

            return (
              <li key={item.value} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => handleMainClick(item)}
                  className={`w-full flex items-center justify-between px-3 py-2 lg:px-3.5 lg:py-2.5 rounded-xl text-xs lg:text-sm font-bold transition-colors active:scale-[0.98] ${
                    isActive
                      ? "bg-green-600 text-white shadow-xs"
                      : "bg-gray-50 lg:bg-transparent text-gray-700 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  <span className="flex items-center gap-2 lg:gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">{item.name}</span>
                  </span>
                  {item.sub.length > 0 && (
                    <span className="hidden lg:inline">
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4 opacity-60" />
                      )}
                    </span>
                  )}
                </button>

                {isOpen && item.sub.length > 0 && (
                  <ul className="hidden lg:block mt-1 ml-4 pl-3 border-l-2 border-green-100 space-y-1">
                    {item.sub.map((subItem) => {
                      const activeSub =
                        !showWishlistOnly && selectedCategory === subItem.value;
                      return (
                        <li key={subItem.label}>
                          <button
                            type="button"
                            onClick={() => {
                              setShowWishlistOnly(false);
                              setSelectedCategory(subItem.value);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              activeSub
                                ? "bg-green-50 text-green-700 font-bold"
                                : "text-gray-500 hover:text-green-600 hover:bg-gray-50"
                            }`}
                          >
                            • {subItem.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}

          <li className="shrink-0 lg:pt-2 lg:mt-2 lg:border-t lg:border-gray-100">
            <button
              type="button"
              onClick={() => setShowWishlistOnly(!showWishlistOnly)}
              className={`w-full flex items-center gap-2 lg:gap-2.5 px-3 py-2 lg:px-3.5 lg:py-2.5 rounded-xl text-xs lg:text-sm font-bold transition-colors active:scale-[0.98] ${
                showWishlistOnly
                  ? "bg-red-500 text-white shadow-xs"
                  : "bg-gray-50 lg:bg-transparent text-gray-700 hover:bg-red-50 hover:text-red-600"
              }`}
            >
              <Heart
                className={`w-4 h-4 shrink-0 ${
                  showWishlistOnly ? "fill-white" : ""
                }`}
              />
              <span className="whitespace-nowrap">পছন্দের তালিকা</span>
            </button>
          </li>
        </ul>

        {activeMobileSubs.length > 0 && (
          <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto pt-2.5 mt-2.5 border-t border-gray-100 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {activeMobileSubs.map((subItem) => {
              const activeSub =
                !showWishlistOnly && selectedCategory === subItem.value;
              return (
                <button
                  key={subItem.label}
                  type="button"
                  onClick={() => {
                    setShowWishlistOnly(false);
                    setSelectedCategory(subItem.value);
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    activeSub
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {subItem.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

export default memo(CategorySidebar);
