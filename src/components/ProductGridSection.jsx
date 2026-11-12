"use client";

import React from "react";
import {
  ShoppingBag,
  Plus,
  Check,
  Store,
  Star,
  SlidersHorizontal,
  Heart,
} from "lucide-react";

export default function ProductGridSection({
  loading,
  filteredProducts,
  availableShops,
  selectedShop,
  setSelectedShop,
  location,
  showWishlistOnly,
  selectedCategory,
  sortBy,
  setSortBy,
  hasActiveFilter,
  resetFilters,
  wishlist,
  toggleWishlist,
  setSelectedProduct,
  handleAddToCart,
  addedId,
}) {
  return (
    <>
      {availableShops.length > 1 && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs mb-5">
          <p className="text-xs font-bold text-gray-500 mb-2.5 flex items-center gap-1.5">
            <Store className="w-4 h-4 text-green-600" />
            {location.upazila
              ? `${location.upazila} এলাকার দোকানসমূহ:`
              : "জনপ্রিয় দোকানসমূহ:"}
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {availableShops.map((shop) => (
              <button
                key={shop}
                onClick={() => setSelectedShop(shop)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition border ${
                  selectedShop === shop
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-green-500"
                }`}
              >
                {shop}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-green-600" />
          {showWishlistOnly
            ? "আপনার পছন্দের তালিকা"
            : selectedShop !== "সব দোকান"
            ? `${selectedShop}-এর পণ্যসমূহ`
            : selectedCategory === "সব পণ্য"
            ? "সাম্প্রতিক পণ্যসমূহ"
            : `${selectedCategory} ক্যাটাগরি`}
        </h2>

        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent font-semibold outline-none cursor-pointer"
          >
            <option value="newest">নতুন পণ্য আগে</option>
            <option value="low-to-high">দাম: কম থেকে বেশি</option>
            <option value="high-to-low">দাম: বেশি থেকে কম</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3 animate-pulse"
            >
              <div className="h-40 bg-gray-200 rounded-xl w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-9 bg-gray-200 rounded-xl w-full mt-2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 space-y-2">
          <p className="text-gray-500 font-medium">
            এই এলাকা, দোকান বা ক্যাটাগরিতে কোনো পণ্য খুঁজে পাওয়া যায়নি।
          </p>
          {hasActiveFilter && (
            <button
              onClick={resetFilters}
              className="text-green-600 text-sm font-bold underline"
            >
              সব পণ্য দেখুন
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const isWishlisted = wishlist.includes(product._id);
            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition group"
              >
                <div
                  onClick={() => setSelectedProduct(product)}
                  className="cursor-pointer"
                >
                  <div className="h-44 w-full bg-gray-100 relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-white/95 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                      {product.category}
                    </span>
                    <button
                      onClick={(e) => toggleWishlist(e, product._id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-xs hover:scale-110 transition"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isWishlisted
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-green-700 font-semibold flex items-center gap-1 truncate max-w-[155px]">
                        <Store className="w-3.5 h-3.5 shrink-0" />
                        {product.shopName || "উপজেলা ভেরিফায়েড স্টোর"}
                      </span>
                      <span className="text-amber-500 font-bold flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> ৪.৮
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-green-600">
                      {product.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {product.description}
                    </p>
                    <p className="text-lg font-extrabold text-green-600 mt-3">
                      ৳ {product.price} টাকা
                    </p>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition ${
                      addedId === product._id
                        ? "bg-amber-500 text-white"
                        : "bg-green-50 text-green-700 hover:bg-green-600 hover:text-white"
                    }`}
                  >
                    {addedId === product._id ? (
                      <>
                        <Check className="w-4 h-4" /> যুক্ত হয়েছে
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> কার্টে যোগ করুন
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
