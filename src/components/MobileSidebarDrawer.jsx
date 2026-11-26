"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CategorySidebar from "@/components/CategorySidebar";
import UnionMarketSection from "@/components/UnionMarketSection";
import {
  Store,
  MapPin,
  ShoppingCart,
  X,
  LayoutDashboard,
  PlusCircle,
  Truck,
  ClipboardList,
  LogIn,
  UserPlus,
  LogOut,
  Heart,
  PhoneCall,
  UserCheck,
} from "lucide-react";

export default function MobileSidebarDrawer({
  isOpen,
  onClose,
  locationLabel,
  onOpenLocation,
  currentUser,
  totalCartItems,
  onOpenCart,
  wishlistCount = 0,
  onOpenWishlist,
  selectedCategory = "সব পণ্য",
  onSelectCategory,
  marketProps = null,
}) {
  const router = useRouter();
  const [hasRegistered, setHasRegistered] = useState(false);

   useEffect(() => {
    try {
      const regFlag = localStorage.getItem("upazila_registered");
      setHasRegistered(regFlag === "true");
    } catch {
      setHasRegistered(false);
    }
  }, [isOpen]);


  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem("upazila_registered", "true");
        setHasRegistered(true);
      } catch {}
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      onClose();
      router.push("/login");
      router.refresh();
    } catch {
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs lg:hidden flex"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-72 max-w-[84vw] bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto"
      >
        <div>
          {/* ড্রয়ার হেডার */}
          <div className="p-4 bg-green-600 text-white flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2 font-extrabold text-base">
              <Store className="w-5 h-5" />
              <span>উপজেলা বাজার</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg bg-white/15 hover:bg-white/25 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ইউজার প্রোফাইল ব্যাজ (লগইন থাকলে) */}
          {currentUser && (
            <div className="px-3.5 py-2.5 bg-emerald-50/70 border-b border-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">
                  {currentUser.name || currentUser.shopName || "ব্যবহারকারী"}
                </p>
                <p className="text-[10px] font-semibold text-green-700 capitalize">
                  {currentUser.role === "seller"
                    ? "ভেরিফায়েড সেলার"
                    : currentUser.role === "rider"
                    ? "ডেলিভারি রাইডার"
                    : "কাস্টমার অ্যাকাউন্ট"}
                </p>
              </div>
            </div>
          )}

          {/* বর্তমান লোকেশন */}
          <div className="p-3.5 border-b border-gray-100 bg-gray-50/70">
            <p className="text-[11px] font-semibold text-gray-500">
              আপনার নির্বাচিত এলাকা
            </p>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-xs font-bold text-green-800 flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span className="truncate">{locationLabel}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLocation();
                }}
                className="text-[11px] font-bold text-green-700 underline shrink-0 cursor-pointer"
              >
                পরিবর্তন
              </button>
            </div>
          </div>
          {/* মেনু ও ড্যাশবোর্ড লিংক */}
          <div className="p-3 space-y-1 border-b border-gray-100">
            <p className="px-2.5 py-1 text-[11px] font-bold text-gray-400 uppercase">
              মেনু ও ড্যাশবোর্ড
            </p>

            {currentUser?.role === "seller" && (
              <>
                <Link
                  href="/seller/orders"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50"
                >
                  <ClipboardList className="w-4 h-4" /> অর্ডার ড্যাশবোর্ড
                </Link>
                <Link
                  href="/seller/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <LayoutDashboard className="w-4 h-4 text-green-600" /> সেলার ড্যাশবোর্ড
                </Link>
                <Link
                  href="/seller/add-product"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <PlusCircle className="w-4 h-4 text-green-600" /> নতুন পণ্য যোগ করুন
                </Link>
              </>
            )}

            {currentUser?.role === "rider" && (
              <Link
                href="/rider/dashboard"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-blue-700 bg-blue-50"
              >
                <Truck className="w-4 h-4" /> রাইডার প্যানেল
              </Link>
            )}

            {currentUser?.role === "customer" && (
              <Link
                href="/orders"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <LayoutDashboard className="w-4 h-4 text-green-600" /> আমার অর্ডারসমূহ
              </Link>
            )}

            {!currentUser && (
              <Link
                href={hasRegistered ? "/login" : "/register"}
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 transition"
              >
                {hasRegistered ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>লগইন করুন</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>রেজিস্ট্রেশন করুন</span>
                  </>
                )}
              </Link>
            )}

            {/* শুধুমাত্র কাস্টমার বা গেস্ট ইউজারদের জন্য শপিং ব্যাগ ও পছন্দের তালিকা */}
            {currentUser?.role !== "seller" && currentUser?.role !== "rider" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCart();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingCart className="w-4 h-4 text-green-600" /> শপিং ব্যাগ
                  </span>
                  <span className="bg-green-100 text-green-800 text-xs font-extrabold px-2 py-0.5 rounded-full">
                    {totalCartItems}
                  </span>
                </button>

                {onOpenWishlist && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenWishlist();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Heart className="w-4 h-4 text-red-500" /> পছন্দের তালিকা
                    </span>
                    <span className="bg-red-50 text-red-600 text-xs font-extrabold px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* মোবাইল ড্রয়ারের ভেতরে এলাকার বাজার ও দোকানসমূহ */}
          {currentUser?.role !== "seller" &&
            currentUser?.role !== "rider" &&
            marketProps && (
              <UnionMarketSection
                {...marketProps}
                inDrawer={true}
                onCloseDrawer={onClose}
              />
            )}

          {/* ডেস্কটপের মতো ভার্টিক্যাল অ্যাকর্ডিয়ন ক্যাটাগরি লিস্ট */}
          {currentUser?.role !== "seller" && currentUser?.role !== "rider" && (
            <CategorySidebar
              inDrawer={true}
              onCloseDrawer={onClose}
              selectedCategory={selectedCategory}
              setSelectedCategory={(cat) => {
                if (onSelectCategory) onSelectCategory(cat);
              }}
              showWishlistOnly={false}
              setShowWishlistOnly={() => {
                if (onOpenWishlist) onOpenWishlist();
              }}
              hasActiveFilter={selectedCategory !== "সব পণ্য"}
              resetFilters={() => {
                if (onSelectCategory) onSelectCategory("সব পণ্য");
              }}
            />
          )}
        </div>

        {/* ড্রয়ার ফুটার (সাপোর্ট ও লগআউট) */}
        <div className="p-3.5 border-t border-gray-100 bg-gray-50/60 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-600 bg-white py-2 px-3 rounded-xl border border-gray-200">
            <PhoneCall className="w-3.5 h-3.5 text-green-600 shrink-0" />
            <span>সাপোর্ট: ০১৭০০-০০০০০০</span>
          </div>

          {currentUser && (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 py-2 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> লগআউট করুন
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
