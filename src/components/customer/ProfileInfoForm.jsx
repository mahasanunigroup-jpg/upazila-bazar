import Link from "next/link";
import { User, Edit3 } from "lucide-react";

export default function ProfileInfoForm() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center justify-between sm:justify-start gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
          <h2 className="text-sm sm:text-base font-bold text-gray-900 whitespace-nowrap">
            ব্যক্তিগত তথ্য
          </h2>
        </div>

        <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap shrink-0">
          কর্পোরেট প্রোফাইল
        </span>
      </div>

      <Link
        href="/customer/profile"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs shrink-0"
      >
        <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>তথ্য আপডেট করুন</span>
      </Link>
    </div>
  );
}
