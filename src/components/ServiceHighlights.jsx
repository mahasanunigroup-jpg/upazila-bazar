import React from "react";
import { Truck, ShieldCheck, Banknote, Headphones } from "lucide-react";

const FEATURES = [
  { icon: Truck, title: "দ্রুত হোম ডেলিভারি", desc: "উপজেলার ভেতরে ১-২ ঘণ্টায় ডেলিভারি" },
  { icon: ShieldCheck, title: "১০০% খাঁটি পণ্য", desc: "সরাসরি কৃষক ও বিশ্বস্ত বিক্রেতা থেকে" },
  { icon: Banknote, title: "ক্যাশ অন ডেলিভারি", desc: "পণ্য হাতে পেয়ে টাকা পরিশোধের সুবিধা" },
  { icon: Headphones, title: "সার্বক্ষণিক সাপোর্ট", desc: "যেকোনো প্রয়োজনে সরাসরি কল করুন" },
];

export default function ServiceHighlights() {
  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-4 -mt-4 sm:-mt-6 relative z-30">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
        {FEATURES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-md sm:shadow-sm border border-gray-100 flex items-center gap-1.5 sm:gap-3 min-w-0"
            >
              {/* বামে আইকন */}
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>

              {/* ডানে: ওপরে নাম, নিচে বিবরণ */}
              <div className="min-w-0 flex-1 text-left">
                <h3 className="font-bold text-gray-800 text-[10px] min-[380px]:text-[11px] sm:text-sm leading-tight">
                  {item.title}
                </h3>
                <p className="text-[9px] min-[380px]:text-[10px] sm:text-xs text-gray-500 mt-0.5 line-clamp-2 sm:line-clamp-1 leading-tight">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
