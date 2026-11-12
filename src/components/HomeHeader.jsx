"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BD_LOCATIONS } from "@/data/bdLocations";
import {
  Store,
  MapPin,
  Search,
  ShoppingCart,
  PackageSearch,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
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
}) {
  const router = useRouter();
  const [trackId, setTrackId] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [tempLoc, setTempLoc] = useState(location);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const openLocationModal = () => {
    setTempLoc(location);
    setIsLocModalOpen(true);
  };

  const districts = Object.keys(BD_LOCATIONS);
  const upazilas =
    tempLoc?.district && BD_LOCATIONS[tempLoc.district]
      ? Object.keys(BD_LOCATIONS[tempLoc.district])
      : [];
  const unions =
    tempLoc?.district &&
    tempLoc?.upazila &&
    BD_LOCATIONS[tempLoc.district]?.[tempLoc.upazila]
      ? BD_LOCATIONS[tempLoc.district][tempLoc.upazila]
      : [];

  const handleSaveLocation = (e) => {
    e.preventDefault();
    setLocation(tempLoc);
    localStorage.setItem("upazila_full_location", JSON.stringify(tempLoc));
    setIsLocModalOpen(false);
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackId.trim()) router.push(`/orders/${trackId.trim()}`);
  };

  const activePromo = PROMO_SLIDES[currentSlide];

  const locationLabel = location?.moholla
    ? `${location.moholla}, ${location.upazila}`
    : location?.union
    ? `${location.union}, ${location.upazila}`
    : location?.upazila
    ? `${location.upazila}, ${location.district}`
    : location?.district || "লোকেশন নির্বাচন করুন";

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-green-600 font-extrabold text-lg sm:text-xl shrink-0"
            >
              <Store className="w-6 h-6 sm:w-7 sm:h-7" /> উপজেলা বাজার
            </Link>

            <button
              onClick={openLocationModal}
              className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200 transition max-w-44 sm:max-w-60"
            >
              <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <span className="truncate">{locationLabel}</span>
            </button>
          </div>

          <div className="hidden md:flex flex-1 max-w-sm relative">
            <input
              type="text"
              placeholder="পণ্য, দোকানের নাম বা দোকানদারের নাম লিখুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 focus:bg-white focus:border-green-500 border border-transparent rounded-full pl-10 pr-4 py-2 text-sm outline-none transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/seller/dashboard"
              className="text-xs sm:text-sm font-semibold text-gray-600 hover:text-green-600 hidden sm:block"
            >
              পণ্য যোগ করুন
            </Link>

            <button
              onClick={onOpenCart}
              className="bg-green-600 hover:bg-green-700 text-white px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden xs:inline">ব্যাগ</span>
              <span className="bg-amber-400 text-gray-900 text-xs font-extrabold px-2 py-0.5 rounded-full">
                {totalCartItems}
              </span>
            </button>
          </div>
        </div>
      </nav>
      {isLocModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-800 text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" /> আপনার এলাকা নির্বাচন করুন
              </h3>
              <button
                onClick={() => setIsLocModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-3.5 text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">১. জেলা</label>
                <select
                  value={tempLoc?.district || ""}
                  onChange={(e) =>
                    setTempLoc({
                      district: e.target.value,
                      upazila: "",
                      union: "",
                      moholla: "",
                    })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-green-500"
                >
                  <option value="">সকল জেলা (সারা বাংলাদেশ)</option>
                  {districts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ২. উপজেলা / থানা
                </label>
                <select
                  disabled={!tempLoc?.district}
                  value={tempLoc?.upazila || ""}
                  onChange={(e) =>
                    setTempLoc({
                      ...tempLoc,
                      upazila: e.target.value,
                      union: "",
                      moholla: "",
                    })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-green-500 disabled:bg-gray-100"
                >
                  <option value="">সকল উপজেলা</option>
                  {upazilas.map((upz) => (
                    <option key={upz} value={upz}>
                      {upz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ৩. ইউনিয়ন / পৌরসভা
                </label>
                <input
                  list="union-options"
                  disabled={!tempLoc?.upazila}
                  placeholder="সিলেক্ট করুন অথবা ইউনিয়নের নাম লিখুন..."
                  value={tempLoc?.union || ""}
                  onChange={(e) =>
                    setTempLoc({ ...tempLoc, union: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-green-500 disabled:bg-gray-100"
                />
                <datalist id="union-options">
                  {unions.map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ৪. মহল্লা / গ্রাম / রোড
                </label>
                <input
                  type="text"
                  placeholder="উদাঃ থানা রোড, কমলপুর, বা গ্রামের নাম..."
                  value={tempLoc?.moholla || ""}
                  onChange={(e) =>
                    setTempLoc({ ...tempLoc, moholla: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-green-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm mt-2"
              >
                <Check className="w-4 h-4" /> লোকেশন নিশ্চিত করুন
              </button>
            </form>
          </div>
        </div>
      )}

      <div className={`${activePromo.bg} text-white pt-10 pb-14 px-4 relative`}>
        <button
          onClick={() =>
            setCurrentSlide((prev) =>
              prev === 0 ? PROMO_SLIDES.length - 1 : prev - 1
            )
          }
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() =>
            setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length)
          }
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 items-center justify-center"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-block bg-white/20 text-white text-xs font-bold px-3.5 py-1 rounded-full">
            {activePromo.badge}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight">
            {activePromo.title}
          </h1>
          <p className="text-green-100 max-w-xl mx-auto text-xs sm:text-sm">
            {activePromo.subtitle}
          </p>

          <form
            onSubmit={handleTrackSubmit}
            className="max-w-md mx-auto bg-white p-1.5 rounded-full flex items-center shadow-lg"
          >
            <PackageSearch className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="অর্ডার টোকেন আইডি দিয়ে ট্র্যাক করুন..."
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm text-gray-700 outline-none"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 sm:px-5 py-2 rounded-full shrink-0"
            >
              ট্র্যাক করুন
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
