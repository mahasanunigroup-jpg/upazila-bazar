"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import MobileSidebarDrawer from "@/components/MobileSidebarDrawer";
import LocationModal from "@/components/LocationModal";
import {
  Store,
  MapPin,
  Search,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";

const PROMO_SLIDES = [
  {
    title: "জেলা, উপজেলা, ইউনিয়ন ও মহল্লা পর্যায়ে খাঁটি পণ্য",
    subtitle: "আপনার নিজ এলাকার সেরা বিক্রেতাদের কাছ থেকে তাজা পণ্য অর্ডার করুন ঘরে বসেই।",
    badge: "সারা বাংলাদেশে হোম ডেলিভারি",
    bg: "bg-gradient-to-r from-green-700 to-green-600",
  },
  {
    title: "প্রতিদিন সকালের তাজা শাক-সবজি ও মাছ",
    subtitle: "স্থানীয় বাজারের সেরা তাজা পণ্য এখন সরাসরি আপনার মহল্লায় পৌঁছে যাবে।",
    badge: "১০০% কেমিক্যাল মুক্ত",
    bg: "bg-gradient-to-r from-emerald-700 to-teal-600",
  },
];

export default function HomeHeader({
  searchQuery,
  setSearchQuery,
  location,
  setLocation,
  totalCartItems,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  onSelectCategory,
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveLocation = (cleanedLoc) => {
    setLocation(cleanedLoc);
    localStorage.setItem("upazila_full_location", JSON.stringify(cleanedLoc));
  };

  const activePromo = PROMO_SLIDES[currentSlide];
  const locationLabel = location?.moholla
    ? `${location.moholla}, ${location.upazila}`
    : location?.union
    ? `${location.union}, ${location.upazila}`
    : location?.upazila
    ? `${location.upazila}, ${location.district}`
    : location?.district || "সারা বাংলাদেশ";

  const isCustomerOrGuest = currentUser?.role !== "seller" && currentUser?.role !== "rider";

  return (
    <>
      <nav className="bg-white shadow-xs sticky top-0 z-40 border-b border-gray-100 w-full">
        <div className="max-w-[1600px] mx-auto px-2.5 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
          {/* বাম পাশ: মোবাইল মেনু + লোগো + লোকেশন */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <button
              type="button"
              aria-label="মেনু খুলুন"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-600 transition shrink-0 cursor-pointer"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <Link href="/" className="flex items-center gap-1 text-green-600 font-extrabold text-sm sm:text-xl shrink-0">
              <Store className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <span className="truncate">উপজেলা বাজার</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsLocModalOpen(true)}
              className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-800 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold border border-green-200 max-w-[85px] min-[380px]:max-w-[115px] sm:max-w-56 min-w-0 cursor-pointer"
            >
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600 shrink-0" />
              <span className="truncate">{locationLabel}</span>
            </button>
          </div>

          {/* মাঝখান: ডেস্কটপ সার্চ বার */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="পণ্য, দোকানের নাম বা দোকানদারের নাম লিখুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 focus:bg-white focus:border-green-500 border border-transparent rounded-full pl-10 pr-4 py-2 text-sm outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* ডান পাশ: রোল বাটন ও ব্যাগ */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="hidden lg:flex items-center gap-2.5">
              {currentUser?.role === "seller" && (
                <Link href="/seller/orders" className="text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-200 transition whitespace-nowrap">
                  অর্ডার ড্যাশবোর্ড
                </Link>
              )}
              {currentUser?.role === "rider" && (
                <Link href="/rider/dashboard" className="text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-full border border-blue-200 transition whitespace-nowrap">
                  রাইডার প্যানেল
                </Link>
              )}
              {currentUser?.role === "customer" && (
                <Link href="/orders" className="text-sm font-semibold text-gray-700 hover:text-green-600 whitespace-nowrap">
                  আমার অর্ডার
                </Link>
              )}
              {!currentUser && (
                <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-green-600 px-2 whitespace-nowrap">
                  লগইন
                </Link>
              )}
            </div>

            {isCustomerOrGuest && (
              <button
                type="button"
                onClick={onOpenCart}
                className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0"
              >
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">ব্যাগ</span>
                <span className="bg-amber-400 text-gray-900 text-[11px] sm:text-xs font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full">
                  {totalCartItems}
                </span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* হিরো ব্যানার (ট্র্যাকিং ইনপুট ছাড়া ক্লিন ও কম্প্যাক্ট) */}
          {/* হিরো ব্যানার (ফিক্সড উচ্চতা—স্লাইড পরিবর্তনে আর কাঁপবে না) */}
      <section className="max-w-[1600px] mx-auto px-2.5 sm:px-4 pt-1.5 sm:pt-4 w-full">
        <div
          className={`${activePromo.bg} rounded-xl sm:rounded-2xl px-3 py-3 sm:py-8 md:py-10 sm:px-10 text-white relative overflow-hidden shadow-sm min-h-[82px] sm:min-h-[155px] md:min-h-[185px] flex items-center justify-center transition-colors duration-300`}
        >
          <div className="max-w-2xl mx-auto text-center space-y-1 sm:space-y-2.5 px-6 sm:px-10 w-full">
            <span className="hidden sm:inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
              {activePromo.badge}
            </span>
            <h1 className="text-xs min-[380px]:text-sm sm:text-2xl md:text-4xl font-extrabold leading-snug">
              {activePromo.title}
            </h1>
            <p className="hidden md:block text-green-50 text-sm leading-relaxed">
              {activePromo.subtitle}
            </p>
          </div>

          <button
            type="button"
            aria-label="পূর্ববর্তী স্লাইড"
            onClick={() => setCurrentSlide((p) => (p === 0 ? PROMO_SLIDES.length - 1 : p - 1))}
            className="absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-1 sm:p-1.5 rounded-full text-white cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            aria-label="পরবর্তী স্লাইড"
            onClick={() => setCurrentSlide((p) => (p + 1) % PROMO_SLIDES.length)}
            className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-1 sm:p-1.5 rounded-full text-white cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </button>
        </div>
      </section>


      <MobileSidebarDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        locationLabel={locationLabel}
        onOpenLocation={() => setIsLocModalOpen(true)}
        currentUser={currentUser}
        totalCartItems={totalCartItems}
        onOpenCart={onOpenCart}
        wishlistCount={wishlistCount}
        onOpenWishlist={onOpenWishlist}
        onSelectCategory={onSelectCategory}
      />

      <LocationModal
        isOpen={isLocModalOpen}
        onClose={() => setIsLocModalOpen(false)}
        location={location}
        onSave={handleSaveLocation}
      />
    </>
  );
}
