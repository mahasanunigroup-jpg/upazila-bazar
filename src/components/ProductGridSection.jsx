"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Plus,
  Check,
  Store,
  Star,
  SlidersHorizontal,
  Heart,
  ChevronLeft,
  ChevronRight,
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // প্রতি পেজে ১৫টি পণ্য (৩x৫ গ্রিড)

  // প্যাজিনেশন হিসাব
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const safePage = currentPage > totalPages ? 1 : currentPage;
  const startIndex = (safePage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // পেজ পরিবর্তন করলে প্রোডাক্ট সেকশনের শুরুতে স্মুথ স্ক্রল করা
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const section = document.getElementById("product-grid-top");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div id="product-grid-top">
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
                onClick={() => {
                  setSelectedShop(selectedShop === shop ? "সব দোকান" : shop);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition border cursor-pointer ${
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
          <span className="text-xs font-normal text-gray-400">
            ({filteredProducts.length} টি)
          </span>
        </h2>

        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
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
              onClick={() => {
                resetFilters();
                setCurrentPage(1);
              }}
              className="text-green-600 text-sm font-bold underline cursor-pointer"
            >
              সব পণ্য দেখুন
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {currentProducts.map((product) => {
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
                    <div className="aspect-[4/3] sm:aspect-auto sm:h-44 w-full bg-gray-100 relative overflow-hidden">
                      <img
                        src={
                          product.image ||
                          "https://placehold.co"
                        }
                        alt={product.title}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co";
                        }}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-white/95 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                        {product.category}
                      </span>
                      <button
                        onClick={(e) => toggleWishlist(e, product._id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-xs hover:scale-110 transition cursor-pointer"
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
                      className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
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

          {/* প্যাজিনেশন বার (প্রতি পেজে ১৫টি পণ্যের পর দেখাবে) */}
          {totalPages > 1 && (
            <div className="mt-8 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                পেজ <span className="font-bold text-gray-800">{safePage}</span> /{" "}
                {totalPages} (মোট {filteredProducts.length} টি পণ্য)
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(safePage - 1)}
                  disabled={safePage === 1}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> আগেরটি
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                          safePage === pageNum
                            ? "bg-green-600 text-white shadow-xs"
                            : "bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-700 border border-gray-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition cursor-pointer"
                >
                  পরেরটি <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
