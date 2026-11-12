"use client";

import React, { useState } from "react";
import {
  LayoutGrid,
  ShoppingBasket,
  Carrot,
  Apple,
  Milk,
  Fish,
  Flame,
  Cookie,
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
];

export default function CategorySidebar({
  selectedCategory,
  setSelectedCategory,
  showWishlistOnly,
  setShowWishlistOnly,
  hasActiveFilter,
  resetFilters,
}) {
  const [expandedMenu, setExpandedMenu] = useState("সবজি");

  const handleMainClick = (item) => {
    if (item.sub.length > 0) {
      setExpandedMenu(expandedMenu === item.value ? "" : item.value);
    } else {
      setShowWishlistOnly(false);
      setSelectedCategory(item.value);
    }
  };

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-20">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
          <h3 className="font-extrabold text-gray-800 text-base">ক্যাটাগরি সমূহ</h3>
          {hasActiveFilter && (
            <button onClick={resetFilters} className="text-xs text-red-500 font-bold flex items-center gap-1 hover:underline">
              <RotateCcw className="w-3 h-3" /> রিসেট
            </button>
          )}
        </div>

        <ul className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0">
          {CATEGORY_DATA.map((item) => {
            const Icon = item.icon;
            const isActive = !showWishlistOnly && (selectedCategory === item.value || item.sub.some((s) => s.value === selectedCategory));
            const isOpen = expandedMenu === item.value;

            return (
              <li key={item.value} className="shrink-0 lg:shrink">
                <button
                  onClick={() => handleMainClick(item)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                    isActive ? "bg-green-600 text-white shadow-xs" : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">{item.name}</span>
                  </span>
                  {item.sub.length > 0 && (
                    <span className="hidden lg:inline">
                      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 opacity-60" />}
                    </span>
                  )}
                </button>

                {isOpen && item.sub.length > 0 && (
                  <ul className="hidden lg:block mt-1 ml-4 pl-3 border-l-2 border-green-100 space-y-1">
                    {item.sub.map((subItem) => {
                      const activeSub = !showWishlistOnly && selectedCategory === subItem.value;
                      return (
                        <li key={subItem.label}>
                          <button
                            onClick={() => {
                              setShowWishlistOnly(false);
                              setSelectedCategory(subItem.value);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                              activeSub ? "bg-green-50 text-green-700 font-bold" : "text-gray-500 hover:text-green-600 hover:bg-gray-50"
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
              onClick={() => setShowWishlistOnly(!showWishlistOnly)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                showWishlistOnly ? "bg-red-500 text-white shadow-xs" : "text-gray-700 hover:bg-red-50 hover:text-red-600"
              }`}
            >
              <Heart className={`w-4 h-4 shrink-0 ${showWishlistOnly ? "fill-white" : ""}`} />
              <span className="whitespace-nowrap">পছন্দের তালিকা</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
