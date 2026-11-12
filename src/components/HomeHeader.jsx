"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BD_LOCATIONS } from "@/data/bdLocations";
import SearchableSelect from "@/components/SearchableSelect";
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

  // শুরুতেই 'সকল জেলা (সারা বাংলাদেশ)' অপশন রাখা হলো
  const districts = ["সকল জেলা (সারা বাংলাদেশ)", ...Object.keys(BD_LOCATIONS)];
  const upazilas =
    tempLoc?.district && BD_LOCATIONS[tempLoc.district]
      ? ["সকল উপজেলা", ...Object.keys(BD_LOCATIONS[tempLoc.district])]
      : [];
  const unions =
    tempLoc?.district && tempLoc?.upazila && BD_LOCATIONS[tempLoc.district]?.[tempLoc.upazila]
      ? ["সকল ইউনিয়ন", ...BD_LOCATIONS[tempLoc.district][tempLoc.upazila]]
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
    : location?.district || "সকল জেলা (সারা বাংলাদেশ)";
  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1.5 text-green-600 font-extrabold text-lg sm:text-xl shrink-0">
              <Store className="w-6 h-6" /> উপজেলা বাজার
            </Link>
            <button
              onClick={() => { setTempLoc(location); setIsLocModalOpen(true); }}
              className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200 max-w-48 sm:max-w-64"
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
              className="w-full bg-gray-100 focus:bg-white focus:border-green-500 border border-transparent rounded-full pl-10 pr-4 py-2 text-sm outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/seller/dashboard" className="text-xs sm:text-sm font-semibold text-gray-600 hover:text-green-600 hidden sm:block">
              পণ্য যোগ করুন
            </Link>
            <button onClick={onOpenCart} className="bg-green-600 hover:bg-green-700 text-white px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4" />
              <span>ব্যাগ</span>
              <span className="bg-amber-400 text-gray-900 text-xs font-extrabold px-2 py-0.5 rounded-full">{totalCartItems}</span>
            </button>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 pt-4">
        <div className={`${activePromo.bg} rounded-2xl p-6 sm:p-10 text-white relative overflow-hidden shadow-md`}>
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{activePromo.badge}</span>
            <h1 className="text-2xl sm:text-4xl font-extrabold">{activePromo.title}</h1>
            <p className="text-green-50 text-xs sm:text-sm">{activePromo.subtitle}</p>
            <form onSubmit={handleTrackSubmit} className="max-w-md mx-auto pt-2 flex items-center bg-white rounded-full p-1 shadow-lg">
              <PackageSearch className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="অর্ডার টোকেন আইডি দিয়ে ট্র্যাক করুন..."
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm text-gray-800 outline-none bg-transparent"
              />
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-full shrink-0">
                ট্র্যাক করুন
              </button>
            </form>
          </div>
          <button onClick={() => setCurrentSlide((p) => (p === 0 ? PROMO_SLIDES.length - 1 : p - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 p-1.5 rounded-full text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setCurrentSlide((p) => (p + 1) % PROMO_SLIDES.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 p-1.5 rounded-full text-white">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {isLocModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-gray-800 text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" /> আপনার এলাকা নির্বাচন করুন
              </h3>
              <button onClick={() => setIsLocModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-3 text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">১. জেলা</label>
                <SearchableSelect
                  options={districts}
                  value={tempLoc?.district || "সকল জেলা (সারা বাংলাদেশ)"}
                  placeholder="জেলা লিখুন বা নির্বাচন করুন..."
                  required={false}
                  onChange={(val) => {
                    const selectedDist = val === "সকল জেলা (সারা বাংলাদেশ)" ? "" : val;
                    setTempLoc({ district: selectedDist, upazila: "", union: "", moholla: "" });
                  }}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">২. উপজেলা / থানা</label>
                <SearchableSelect
                  options={upazilas}
                  value={tempLoc?.upazila || ""}
                  placeholder={tempLoc?.district ? "উপজেলা লিখুন বা নির্বাচন করুন..." : "আগে জেলা নির্বাচন করুন"}
                  disabled={!tempLoc?.district}
                  required={false}
                  onChange={(val) => {
                    const selectedUpz = val === "সকল উপজেলা" ? "" : val;
                    setTempLoc({ ...tempLoc, upazila: selectedUpz, union: "", moholla: "" });
                  }}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">৩. ইউনিয়ন / পৌরসভা</label>
                <SearchableSelect
                  options={unions}
                  value={tempLoc?.union || ""}
                  placeholder={tempLoc?.upazila ? "ইউনিয়ন লিখুন বা নির্বাচন করুন..." : "আগে উপজেলা নির্বাচন করুন"}
                  disabled={!tempLoc?.upazila}
                  required={false}
                  onChange={(val) => {
                    const selectedUni = val === "সকল ইউনিয়ন" ? "" : val;
                    setTempLoc({ ...tempLoc, union: selectedUni, moholla: "" });
                  }}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">৪. মহল্লা / গ্রাম / রোড</label>
                <input
                  type="text"
                  placeholder="উদাঃ থানা রোড, কমলপুর..."
                  value={tempLoc?.moholla || ""}
                  onChange={(e) => setTempLoc({ ...tempLoc, moholla: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-green-500"
                />
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> লোকেশন নিশ্চিত করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
