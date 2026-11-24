"use client";

import React from "react";
import {
  Store,
  MapPin,
  ChevronRight,
  Star,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

export default function UnionMarketSection({
  location,
  unionMarketsData,
  activeMarketShops,
  selectedMarket,
  setSelectedMarket,
  selectedShop,
  setSelectedShop,
  currentShopDetails,
}) {
  if (!location?.union && unionMarketsData.length === 0) {
    return null;
  }

  return (
    <section className="mb-6 bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs">
      {/* ব্রেডক্রাম্ব ও শিরোনাম */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{location.upazila || "উপজেলা"}</span>
            {location.union && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold">{location.union}</span>
              </>
            )}
            {selectedMarket !== "সব বাজার" && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold">{selectedMarket}</span>
              </>
            )}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-800">
            {selectedMarket === "সব বাজার"
              ? location.union
                ? `${location.union}-এর বাজার ও হাটসমূহ`
                : "এলাকার জনপ্রিয় বাজারসমূহ"
              : `${selectedMarket}-এর নিবন্ধিত দোকানসমূহ`}
          </h2>
        </div>

        {(selectedMarket !== "সব বাজার" || selectedShop !== "সব দোকান") && (
          <button
            onClick={() => {
              if (selectedShop !== "সব দোকান") {
                setSelectedShop("সব দোকান");
              } else {
                setSelectedMarket("সব বাজার");
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {selectedShop !== "সব দোকান" ? "সব দোকানে ফিরুন" : "সব বাজারে ফিরুন"}
          </button>
        )}
      </div>

      {/* ধাপ ১: বাজারের তালিকা */}
      {selectedMarket === "সব বাজার" && (
        <>
          {unionMarketsData.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {unionMarketsData.map((market) => (
                <button
                  key={market.name}
                  onClick={() => {
                    setSelectedMarket(market.name);
                    setSelectedShop("সব দোকান");
                  }}
                  className="group text-left p-3.5 rounded-xl border border-gray-200 hover:border-green-500 bg-gray-50/60 hover:bg-green-50/50 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition">
                      <Store className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                      {market.shopList.length}টি দোকান
                    </span>
                  </div>
                  <div className="mt-3">
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-green-700">
                      {market.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {market.productCount}টি পণ্য পাওয়া যাচ্ছে
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">
              এই ইউনিয়নে এখনো কোনো বাজার বা দোকান যুক্ত হয়নি। খুব শীঘ্রই যুক্ত হচ্ছে!
            </p>
          )}
        </>
      )}

      {/* ধাপ ২: নির্বাচিত বাজারের দোকানগুলোর তালিকা */}
      {selectedMarket !== "সব বাজার" && selectedShop === "সব দোকান" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeMarketShops.map((shop) => (
            <button
              key={shop.shopName}
              onClick={() => setSelectedShop(shop.shopName)}
              className="text-left p-3.5 rounded-xl border border-gray-200 hover:border-green-500 bg-white hover:shadow-sm transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-green-600 flex items-center justify-center shrink-0 font-bold text-base">
                {shop.shopName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-800 text-sm truncate">{shop.shopName}</h3>
                <p className="text-xs text-gray-500 truncate">বিক্রেতা: {shop.sellerName}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] font-medium">
                  <span className="inline-flex items-center gap-0.5 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {shop.avgRating}
                  </span>
                  <span className="text-gray-500">• {shop.productCount}টি পণ্য</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ধাপ ৩: নির্দিষ্ট দোকানের স্টোরফ্রন্ট ব্যানার */}
      {currentShopDetails && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center font-bold text-xl shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">{currentShopDetails.shopName}</h3>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> ভেরিফায়েড দোকান
                </span>
              </div>
              <p className="text-xs text-green-50 mt-0.5">
                বাজার: {currentShopDetails.marketName} • বিক্রেতা: {currentShopDetails.sellerName} • রেটিং: ★{" "}
                {currentShopDetails.avgRating}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedShop("সব দোকান")}
            className="text-xs font-semibold bg-white text-green-700 hover:bg-green-50 px-3.5 py-2 rounded-lg transition cursor-pointer self-start sm:self-center shrink-0"
          >
            দোকান পরিবর্তন করুন
          </button>
        </div>
      )}
    </section>
  );
}
