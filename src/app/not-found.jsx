// src/app/not-found.jsx
import Link from "next/link";

export const metadata = {
  title: "৪০৪ - পেজটি খুঁজে পাওয়া যায়নি | উপজেলা বাজার",
};

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center space-y-5">
        <div className="w-20 h-20 mx-auto bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl font-extrabold border border-emerald-100">
          ৪০৪
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            দুঃখিত! পেজটি খুঁজে পাওয়া যায়নি
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            আপনি যে লিংকটি খুঁজছেন তা হয়তো সরিয়ে ফেলা হয়েছে, নাম পরিবর্তন করা হয়েছে অথবা লিংকটি ভুল লেখা হয়েছে।
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition"
          >
            🏠 হোমপেজে ফিরে যান
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition"
          >
            🔐 লগইন পেজ
          </Link>
        </div>
      </div>
    </div>
  );
}
