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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-30">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {FEATURES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-xs sm:text-sm">{item.title}</h3>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
