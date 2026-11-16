// src/app/error.jsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center space-y-5">
        <div className="w-16 h-16 mx-auto bg-red-50 text-red-600 rounded-full flex items-center justify-center text-3xl border border-red-100">
          ⚠️
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            সাময়িক একটি ত্রুটি ঘটেছে!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            পেজটি লোড করার সময় অপ্রত্যাশিত কোনো সমস্যা হয়েছে। অনুগ্রহ করে নিচের বাটনে ক্লিক করে আবার চেষ্টা করুন।
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition cursor-pointer"
          >
            🔄 আবার চেষ্টা করুন
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition"
          >
            🏠 মূল পাতায় ফিরুন
          </Link>
        </div>
      </div>
    </div>
  );
}
