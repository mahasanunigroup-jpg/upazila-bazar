"use client";

import React, { useState, useEffect } from "react";
import { Zap, Clock } from "lucide-react";

export default function FlashDealBanner({ onSelectOffer }) {
  const [secondsLeft, setSecondsLeft] = useState(14400);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 14400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(secondsLeft / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-white shadow-2xs mb-3 sm:mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 w-full overflow-hidden">
      {/* বাম পাশ: আইকন + শিরোনাম */}
      <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-300 text-yellow-200" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="inline-block text-[9px] sm:text-[10px] font-extrabold bg-black/20 px-2 py-0.5 rounded-full whitespace-nowrap">
            আজকের ধামাকা অফার
          </span>
          <h3 className="text-xs min-[380px]:text-sm sm:text-base md:text-lg font-extrabold leading-snug mt-0.5">
            তাজা শাক-সবজি ও মুদি পণ্যে বিশেষ ছাড়!
          </h3>
        </div>
      </div>

      {/* ডান পাশ: ছোট টাইমার ও কম্প্যাক্ট বাটন */}
      <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2.5 w-full sm:w-auto pt-1.5 sm:pt-0 border-t border-white/15 sm:border-none">
        <div className="flex items-center gap-1 bg-black/25 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-extrabold whitespace-nowrap tabular-nums">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300 shrink-0" />
          <span>{hours}:{minutes}:{seconds}</span>
        </div>
        <button
          type="button"
          onClick={onSelectOffer}
          className="bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-[10px] sm:text-xs md:text-sm px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl transition shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
        >
          অফার দেখুন
        </button>
      </div>
    </div>
  );
}
