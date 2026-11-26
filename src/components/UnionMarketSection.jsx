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
  inDrawer = false,
  onCloseDrawer,
}) {
  if (!location?.union && unionMarketsData.length === 0) {
    return null;
  }

  return (
    <section
      className={
        inDrawer
          ? "p-3 border-b border-gray-100 bg-white w-full overflow-hidden"
          : "hidden lg:block mb-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-xs w-full overflow-hidden"
      }
    >
      {/* ব্রেডক্রাম্ব ও শিরোনাম */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1 text-[11px] font-medium text-green-600 mb-0.5">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{location.upazila || "উপজেলা"}</span>
            {location.union && (
              <>
                <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="font-semibold">{location.union}</span>
              </>
            )}
            {selectedMarket !== "সব বাজার" && (
              <>
                <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="font-semibold truncate">{selectedMarket}</span>
              </>
            )}
          </div>
          <h2
            className={`${
              inDrawer ? "text-xs font-extrabold" : "text-lg font-bold"
            } text-gray-800 leading-snug`}
          >
            {selectedMarket === "সব বাজার"
              ? location.union
                ? `${location.union}-এর বাজারসমূহ`
                : "এলাকার জনপ্রিয় বাজারসমূহ"
              : `${selectedMarket}-এর দোকানসমূহ`}
          </h2>
        </div>

        {(selectedMarket !== "সব বাজার" || selectedShop !== "সব দোকান") && (
          <button
            type="button"
            onClick={() => {
              if (selectedShop !== "সব দোকান") {
                setSelectedShop("সব দোকান");
              } else {
                setSelectedMarket("সব বাজার");
              }
            }}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-lg transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3 h-3 shrink-0" />
            <span>{selectedShop !== "সব দোকান" ? "সব দোকান" : "সব বাজার"}</span>
          </button>
        )}
      </div>

      {/* ধাপ ১: বাজারের তালিকা */}
      {selectedMarket === "সব বাজার" && (
        <>
          {unionMarketsData.length > 0 ? (
            <div
              className={
                inDrawer
                  ? "grid grid-cols-1 gap-2"
                  : "grid grid-cols-3 gap-3"
              }
            >
              {unionMarketsData.map((market) => (
                <button
                  type="button"
                  key={market.name}
                  onClick={() => {
                    setSelectedMarket(market.name);
                    setSelectedShop("সব দোকান");
                  }}
                  className={`group text-left ${
                    inDrawer ? "p-2.5" : "p-3.5"
                  } rounded-xl border border-gray-200 hover:border-green-500 bg-gray-50/60 hover:bg-green-50/50 transition-all cursor-pointer flex flex-col justify-between min-w-0`}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition">
                      <Store className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-semibold bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                      {market.shopList.length}টি দোকান
                    </span>
                  </div>
                  <div className="mt-2 min-w-0 w-full">
                    <h3 className="font-bold text-gray-800 text-xs sm:text-sm truncate group-hover:text-green-700">
                      {market.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {market.productCount}টি পণ্য পাওয়া যাচ্ছে
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl">
              এই ইউনিয়নে এখনো কোনো বাজার বা দোকান যুক্ত হয়নি। খুব শীঘ্রই যুক্ত হচ্ছে!
            </p>
          )}
        </>
      )}

      {/* ধাপ ২: নির্বাচিত বাজারের দোকানগুলোর তালিকা */}
      {selectedMarket !== "সব বাজার" && selectedShop === "সব দোকান" && (
        <div
          className={
            inDrawer
              ? "grid grid-cols-1 gap-2"
              : "grid grid-cols-3 gap-3"
          }
        >
          {activeMarketShops.map((shop) => (
            <button
              type="button"
              key={shop.shopName}
              onClick={() => {
                setSelectedShop(shop.shopName);
                if (inDrawer && onCloseDrawer) onCloseDrawer();
              }}
              className={`text-left ${
                inDrawer ? "p-2.5" : "p-3.5"
              } rounded-xl border border-gray-200 hover:border-green-500 bg-white hover:shadow-sm transition-all cursor-pointer flex items-center gap-2.5 min-w-0`}
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-green-600 flex items-center justify-center shrink-0 font-bold text-sm">
                {shop.shopName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-800 text-xs sm:text-sm truncate">
                  {shop.shopName}
                </h3>
                <p className="text-[11px] text-gray-500 truncate">
                  বিক্রেতা: {shop.sellerName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-medium">
                  <span className="inline-flex items-center gap-0.5 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />{" "}
                    {shop.avgRating}
                  </span>
                  <span className="text-gray-500 truncate">
                    • {shop.productCount}টি পণ্য
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ধাপ ৩: নির্দিষ্ট দোকানের স্টোরফ্রন্ট ব্যানার */}
      {!inDrawer && currentShopDetails && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-3 flex flex-col gap-2.5 w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center font-bold shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="font-bold text-xs sm:text-sm truncate max-w-full">
                  {currentShopDetails.shopName}
                </h3>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 whitespace-nowrap shrink-0">
                  <Sparkles className="w-2.5 h-2.5" /> ভেরিফায়েড
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-green-50 mt-0.5 truncate">
                {currentShopDetails.marketName} • ★ {currentShopDetails.avgRating}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedShop("সব দোকান")}
            className="text-[11px] font-semibold bg-white text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg transition cursor-pointer w-full text-center"
          >
            দোকান পরিবর্তন করুন
          </button>
        </div>
      )}
    </section>
  );
}
