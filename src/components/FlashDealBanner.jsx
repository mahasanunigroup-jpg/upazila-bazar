"use client";

import React, { useState, useEffect } from "react";
import { Zap, Clock } from "lucide-react";

export default function FlashDealBanner({ onSelectOffer }) {
  const [secondsLeft, setSecondsLeft] = useState(14400); // ৪ ঘণ্টার লাইভ কাউন্টডাউন

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
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-4 sm:p-5 text-white shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 text-center sm:text-left">
        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Zap className="w-6 h-6 fill-yellow-300 text-yellow-200" />
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider font-extrabold bg-black/20 px-2.5 py-0.5 rounded-full">
            আজকের ধামাকা অফার
          </span>
          <h3 className="text-base sm:text-lg font-extrabold mt-1">
            তাজা শাক-সবজি ও মুদি পণ্যে বিশেষ ছাড়!
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-black/25 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold">
          <Clock className="w-4 h-4 text-yellow-300" />
          <span>{hours} : {minutes} : {seconds}</span>
        </div>
        <button
          onClick={onSelectOffer}
          className="bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-xs sm:text-sm px-4 py-2 rounded-xl transition shadow-xs"
        >
          অফার দেখুন
        </button>
      </div>
    </div>
  );
}
