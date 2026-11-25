"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Store,
  MapPin,
  LayoutGrid,
  Search,
  Edit3,
  Plus,
  Package,
} from "lucide-react";

export default function SellerProductsShowcase({ products = [], shopInfo = {} }) {
  const [selectedCategory, setSelectedCategory] = useState("সব পণ্য");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const counts = { "সব পণ্য": products.length };
    products.forEach((p) => {
      const cat = p.category || "অন্যান্য";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== "সব পণ্য" && (p.category || "অন্যান্য") !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!p.title?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <section className="space-y-4">
      {/* দোকানের স্টোরফ্রন্ট ও বাজার ব্যানার */}
      <div className="bg-gradient-to-r from-emerald-700 to-green-600 text-white rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-extrabold text-base sm:text-lg truncate">
                {shopInfo.shopName || "আপনার নিবন্ধিত দোকান"}
              </h2>
              <span className="text-[10px] sm:text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-semibold">
                ভেরিফায়েড স্টোরফ্রন্ট
              </span>
            </div>
            <p className="text-xs text-emerald-50 mt-1 flex items-center gap-1 flex-wrap">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>
                বাজার: {shopInfo.marketName || "স্থানীয় বাজার"} • ইউনিয়ন:{" "}
                {shopInfo.union || "নির্ধারিত এলাকা"} • মোট পণ্য: {products.length} টি
              </span>
            </p>
          </div>
        </div>

        <Link
          href="/seller/products"
          className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition text-center shrink-0"
        >
          সব পণ্য ম্যানেজ করুন →
        </Link>
      </div>

      {/* ক্যাটাগরি সাইডবার + পণ্যের তালিকা */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <aside className="w-full lg:w-60 shrink-0 bg-white rounded-2xl border border-gray-100 p-3.5 shadow-2xs">
          <h3 className="font-bold text-gray-800 text-sm pb-2.5 mb-2.5 border-b border-gray-100 flex items-center gap-1.5">
            <LayoutGrid className="w-4 h-4 text-emerald-600" /> দোকানের ক্যাটাগরি
          </h3>
          <ul className="flex lg:flex-col gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => {
              const active = selectedCategory === cat.name;
              return (
                <li key={cat.name} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      active
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-50 lg:bg-transparent text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        active ? "bg-white/20 text-white" : "bg-gray-200/70 text-gray-600"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="flex-1 w-full min-w-0 space-y-3">
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>
                {selectedCategory === "সব পণ্য" ? "আপনার সব পণ্য" : selectedCategory} (
                {filteredProducts.length} টি)
              </span>
            </h3>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="আপনার পণ্য খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs sm:text-sm outline-none focus:border-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center space-y-2">
              <p className="text-sm text-gray-500">এই ক্যাটাগরিতে আপনার কোনো পণ্য নেই।</p>
              <Link
                href="/seller/add-product"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> নতুন পণ্য যোগ করুন
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    <div className="aspect-[16/11] w-full bg-gray-50/50 p-1.5 border-b border-gray-50 relative">
                      <img
                        src={product.image || "https://placehold.co"}
                        alt={product.title}
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-white/95 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded-md border border-gray-100 max-w-[80%] truncate">
                        {product.category}
                      </span>
                    </div>

                    <div className="p-2.5">
                      <h4 className="font-bold text-gray-800 text-xs sm:text-sm line-clamp-1">
                        {product.title}
                      </h4>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-emerald-600 font-extrabold text-sm">
                          ৳{Number(product.price || 0).toLocaleString("bn-BD")}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            (product.stock || 0) <= 5
                              ? "bg-red-50 text-red-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          স্টক: {product.stock ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/seller/products"
                    className="w-full py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-600 hover:text-white border-t border-emerald-100 flex items-center justify-center gap-1 transition"
                  >
                    <Edit3 className="w-3 h-3" /> এডিট / স্টক
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
