import React from "react";
import Link from "next/link";
import { Store, PhoneCall, MapPin } from "lucide-react";

export default function HomeFooter({ upazila }) {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12 w-full">
      <div className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600 text-center sm:text-left">
        <div className="flex items-center gap-2 font-bold text-green-600 text-base">
          <Store className="w-5 h-5" /> উপজেলা বাজার
        </div>
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-xs sm:text-sm">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-green-600" /> {upazila || "সারা বাংলাদেশ"}
          </span>
          <span className="flex items-center gap-1">
            <PhoneCall className="w-4 h-4 text-green-600" /> ০১৭০০-০০০০০০
          </span>
          <Link href="/seller/dashboard" className="text-green-600 font-semibold hover:underline">
            সেলার প্যানেল
          </Link>
        </div>
        <p className="text-xs text-gray-400">© ২০২৬ উপজেলা বাজার। সর্বস্বত্ব সংরক্ষিত।</p>
      </div>
    </footer>
  );
}
