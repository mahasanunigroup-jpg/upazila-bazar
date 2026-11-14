"use client";

import { useState, useEffect } from "react";

export default function NoticeMarqueeClient({ rawNoticeText, userUpazila }) {
  const [selectedUpazila, setSelectedUpazila] = useState(userUpazila || "");

  useEffect(() => {
    const syncLocation = () => {
      try {
        const savedLoc = JSON.parse(
          localStorage.getItem("upazila_full_location") || "null"
        );
        if (savedLoc?.upazila) {
          setSelectedUpazila(savedLoc.upazila);
        } else if (userUpazila) {
          setSelectedUpazila(userUpazila);
        } else {
          setSelectedUpazila("");
        }
      } catch {}
    };

    syncLocation();

    window.addEventListener("storage", syncLocation);
    const interval = setInterval(syncLocation, 2000);

    return () => {
      window.removeEventListener("storage", syncLocation);
      clearInterval(interval);
    };
  }, [userUpazila]);

  const dynamicText = selectedUpazila
    ? rawNoticeText.replace(/ভৈরব/g, selectedUpazila)
    : rawNoticeText.replace(/ভৈরব উপজেলার/g, "সারা বাংলাদেশের");

  return (
    <div className="w-full min-h-[36px] flex items-center bg-emerald-700 text-white text-xs sm:text-sm py-2 overflow-hidden relative select-none">
      <div className="animate-notice-marquee font-medium">
        📢 {dynamicText}
        {selectedUpazila && (
          <span className="ml-2 px-2 py-0.5 text-[11px] bg-emerald-800/80 rounded-full border border-emerald-500/40">
            📍 {selectedUpazila} জোন
          </span>
        )}
      </div>
    </div>
  );
}
