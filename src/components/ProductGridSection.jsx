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
  Pill,
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
  const itemsPerPage = 24; // ২, ৩, ৪, ৬ সব গ্রিডের সাথে নিখুঁতভাবে মেলার জন্য ২৪টি

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const safePage = currentPage > totalPages ? 1 : currentPage;
  const startIndex = (safePage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const section = document.getElementById("product-grid-top");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div id="product-grid-top" className="w-full min-w-0">
      {/* দোকান ফিল্টার পিল বার */}
      {availableShops.length > 1 && (
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-2xs mb-4 w-full overflow-hidden">
          <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5">
            <Store className="w-4 h-4 text-green-600 shrink-0" />
            <span className="truncate">
              {location.upazila
                ? `${location.upazila} এলাকার দোকানসমূহ:`
                : "জনপ্রিয় দোকানসমূহ:"}
            </span>
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {availableShops.map((shop) => (
              <button
                type="button"
                key={shop}
                onClick={() => {
                  setSelectedShop(selectedShop === shop ? "সব দোকান" : shop);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition border cursor-pointer shrink-0 ${
                  selectedShop === shop
                    ? "bg-green-600 text-white border-green-600 shadow-2xs"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-green-500"
                }`}
              >
                {shop}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* হেডার ও সর্ট বার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 sm:mb-5 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-100 shadow-2xs w-full">
        <h2 className="text-base sm:text-lg font-bold text-gray-800 flex flex-wrap items-center gap-1.5 min-w-0">
          <ShoppingBag className="w-5 h-5 text-green-600 shrink-0" />
          <span className="break-words">
            {showWishlistOnly
              ? "আপনার পছন্দের তালিকা"
              : selectedShop !== "সব দোকান"
                ? `${selectedShop}-এর পণ্যসমূহ`
                : selectedCategory === "সব পণ্য"
                  ? "সাম্প্রতিক পণ্যসমূহ"
                  : `${selectedCategory} ক্যাটাগরি`}
          </span>
          <span className="text-xs font-normal text-gray-400 whitespace-nowrap">
            ({filteredProducts.length} টি)
          </span>
        </h2>

        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm w-full sm:w-auto shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent font-semibold outline-none cursor-pointer w-full sm:w-auto text-gray-700"
          >
            <option value="newest">নতুন পণ্য আগে</option>
            <option value="low-to-high">দাম: কম থেকে বেশি</option>
            <option value="high-to-low">দাম: বেশি থেকে কম</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2.5 sm:gap-3.5">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse flex flex-col justify-between"
            >
              <div className="aspect-[4/3] bg-gray-200 w-full" />
              <div className="p-2.5 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-4/5" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
              <div className="h-8 bg-gray-200 w-full" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-14 px-4 bg-white rounded-2xl border border-gray-100 space-y-2">
          <p className="text-sm sm:text-base text-gray-500 font-medium">
            এই এলাকা, দোকান বা ক্যাটাগরিতে কোনো পণ্য খুঁজে পাওয়া যায়নি।
          </p>
          {hasActiveFilter && (
            <button
              type="button"
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
          <div className="grid grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2.5 sm:gap-3.5">
            {currentProducts.map((product) => {
              const isWishlisted = wishlist.includes(product._id);
              const isAdded = addedId === product._id;
              const ratingVal = Number(
                product.rating || product.averageRating || 0
              );
              const isMedicine =
                product.category === "ওষুধ ও ফার্মেসি" ||
                product.category === "প্রেসক্রিপশন ওষুধ" ||
                product.category === "সাধারণ ওষুধ";

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md hover:border-green-300 transition-all duration-200 overflow-hidden flex flex-col justify-between group min-w-0"
                >
                  {/* উপরের অংশ: ইমেজ ও তথ্য */}
                                    {/* উপরের অংশ: ইমেজ ও তথ্য (একদম টাইট ও কম্প্যাক্ট গ্যাপ) */}
                  <div
                    onClick={() => setSelectedProduct(product)}
                    className="cursor-pointer flex-1 flex flex-col"
                  >
                    {/* ইমেজ বক্স (উপর-নিচে প্যাডিং একদম কমানো হয়েছে) */}
                    <div className="aspect-[16/11] sm:aspect-[4/3] w-full bg-gray-50/40 relative overflow-hidden px-2 py-0.5 border-b border-gray-50">
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
                        className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
                      />

                      {isMedicine && (
                        <span className="absolute bottom-1 left-1.5 bg-blue-50/95 text-blue-600 border border-blue-100 text-[9px] font-bold px-1.5 py-0.2 rounded inline-flex items-center gap-0.5">
                          <Pill className="w-2.5 h-2.5" /> Rx
                        </span>
                      )}

                      <button
                        type="button"
                        aria-label="পছন্দের তালিকায় রাখুন"
                        onClick={(e) => toggleWishlist(e, product._id)}
                        className="absolute top-1 right-1.5 w-6 h-6 rounded-full bg-white/90 border border-gray-100 flex items-center justify-center shadow-2xs hover:scale-110 transition cursor-pointer"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isWishlisted
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400 hover:text-red-400"
                          }`}
                        />
                      </button>
                    </div>

                    {/* নাম, ইউনিট, বিবরণ ও দাম (লেখাগুলোর মাঝের গ্যাপ কমানো হয়েছে) */}
                    <div className="px-2 py-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* সেলার ও রেটিং */}
                        <div className="flex items-center justify-between gap-1 text-[10px] text-gray-400 leading-none mb-0.5">
                          <span className="flex items-center gap-0.5 truncate min-w-0">
                            <Store className="w-2.5 h-2.5 text-green-600 shrink-0" />
                            <span className="truncate">
                              {product.shopName || "উপজেলা স্টোর"}
                            </span>
                          </span>
                          <span className="flex items-center gap-0.5 text-amber-500 font-semibold shrink-0">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            {ratingVal > 0
                              ? ratingVal.toLocaleString("bn-BD", {
                                  minimumFractionDigits: 1,
                                  maximumFractionDigits: 1,
                                })
                              : "নতুন"}
                          </span>
                        </div>

                        {/* প্রোডাক্টের নাম + ছোট ইউনিট */}
                        {(() => {
                          const rawTitle = product.title || "";
                          const pIdx = rawTitle.indexOf("(");
                          const mainName = pIdx > 0 ? rawTitle.slice(0, pIdx).trim() : rawTitle;
                          const unitText = pIdx > 0 ? rawTitle.slice(pIdx).trim() : "";

                          return (
                            <h3
                              title={rawTitle}
                              className="text-gray-800 leading-tight line-clamp-1 group-hover:text-green-600 transition"
                            >
                              <span className="font-bold text-xs sm:text-sm">
                                {mainName}
                              </span>
                              {unitText && (
                                <span className="text-[9px] sm:text-[10px] font-normal text-gray-400 ml-1">
                                  {unitText}
                                </span>
                              )}
                            </h3>
                          );
                        })()}

                        {/* পণ্যের মূল বিবরণ (শুধু বড় ডিভাইসে, কম গ্যাপে) */}
                        {product.description && (
                          <p className="hidden md:line-clamp-1 text-[11px] text-gray-500 leading-tight mt-0.5">
                            {product.description
                              .replace(/^(\[[^\]]*\]\s*)+/g, "")
                              .replace(/^[\]\)\s]+/, "")
                              .trim()}
                          </p>
                        )}
                      </div>

                      {/* স্পষ্ট দাম */}
                      <div className="mt-1 flex items-baseline gap-1.5 leading-none">
                        <span className="text-green-600 font-extrabold text-sm sm:text-base whitespace-nowrap">
                          ৳{Number(product.price || 0).toLocaleString("bn-BD")}
                        </span>
                        {product.oldPrice > product.price && (
                          <span className="text-[11px] text-gray-400 line-through whitespace-nowrap">
                            ৳{Number(product.oldPrice).toLocaleString("bn-BD")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>


                  {/* কার্ডের একদম নিচে পুরো প্রস্থ জুড়ে থাকা কার্ট বাটন */}
                                   {/* কার্ডের একদম নিচে পুরো প্রস্থ জুড়ে থাকা কার্ট বাটন (সব ডিভাইসে এক লাইনে) */}
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className={`w-full py-2 px-1.5 text-[10px] min-[380px]:text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 whitespace-nowrap transition-colors cursor-pointer border-t ${
                      isAdded
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-green-50/90 hover:bg-green-600 text-green-700 hover:text-white border-green-100 hover:border-green-600"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span>যুক্ত হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span>কার্টে যোগ করুন</span>
                      </>
                    )}
                  </button>

                </div>
              );
            })}
          </div>

          {/* প্যাজিনেশন */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-7">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => handlePageChange(safePage - 1)}
                className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-40 hover:border-green-500 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  type="button"
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-9 h-9 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                    safePage === page
                      ? "bg-green-600 text-white shadow-xs"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-green-500"
                  }`}
                >
                  {page.toLocaleString("bn-BD")}
                </button>
              ))}

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => handlePageChange(safePage + 1)}
                className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-40 hover:border-green-500 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
