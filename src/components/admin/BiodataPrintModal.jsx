"use client";

import { Printer, X } from "lucide-react";

const ROLE_LABELS = {
  seller: "বিক্রেতা (Seller)",
  rider: "ডেলিভারি রাইডার (Rider)",
  union_admin: "ইউনিয়ন অ্যাডমিন",
  upazila_admin: "উপজেলা অ্যাডমিন",
  district_admin: "জেলা অ্যাডমিন",
  division_admin: "বিভাগীয় অ্যাডমিন",
  super_admin: "সুপার অ্যাডমিন",
  admin: "সুপার অ্যাডমিন",
};

export default function BiodataPrintModal({ user, onClose }) {
  if (!user) return null;
  const bio = user.biodata || {};
  const areaText = [user.union, user.upazila, user.district, user.division]
    .filter(Boolean)
    .join(", ");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto print:bg-white print:p-0">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden print:shadow-none print:border-none print:max-w-full">
        {/* টপ অ্যাকশন বার (প্রিন্টের সময় লুকানো থাকবে) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <h3 className="font-bold text-sm">
            অফিশিয়াল বায়োডাটা ও ভেরিফিকেশন শিট
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> প্রিন্ট করুন (Print / PDF)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-gray-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* প্রিন্টযোগ্য বায়োডাটা বডি */}
        <div className="p-6 sm:p-8 space-y-6 text-sm text-gray-800" id="printable-biodata">
          {/* হেডার, অফিশিয়াল আইডি ও পাসপোর্ট ছবি */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-emerald-600 pb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-emerald-700">
                উপজেলা বাজার (Upazila Bazar)
              </h1>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">
                দায়িত্বপ্রাপ্ত কর্মকর্তা / রাইডার ব্যক্তিগত বায়োডাটা ফর্ম
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-slate-900 text-white text-xs font-mono font-bold rounded-full">
                  ID: {user.customId || "N/A"}
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  পদবী: {ROLE_LABELS[user.role] || user.role}
                </span>
              </div>
            </div>

            <div className="w-28 h-32 rounded-xl border-2 border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
              {bio.avatar ? (
                <img
                  src={bio.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-400 text-center px-2">
                  ছবি দেওয়া নেই
                </span>
              )}
            </div>
          </div>

          {/* ব্যক্তিগত তথ্যের টেবিল */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs sm:text-sm">
            <div className="border-b pb-1.5">
              <span className="text-gray-500">পূর্ণ নাম:</span>{" "}
              <span className="font-bold text-gray-900">{user.name}</span>
            </div>
            <div className="border-b pb-1.5">
              <span className="text-gray-500">দায়িত্বপ্রাপ্ত এলাকা:</span>{" "}
              <span className="font-bold text-emerald-700">
                {areaText || "সারা দেশ"}
              </span>
            </div>
            <div className="border-b pb-1.5">
              <span className="text-gray-500">পিতার নাম:</span>{" "}
              <span className="font-semibold">{bio.fatherName || "—"}</span>
            </div>
            <div className="border-b pb-1.5">
              <span className="text-gray-500">মাতার নাম:</span>{" "}
              <span className="font-semibold">{bio.motherName || "—"}</span>
            </div>
            <div className="border-b pb-1.5">
              <span className="text-gray-500">মোবাইল নম্বর:</span>{" "}
              <span className="font-semibold">{user.phone || "—"}</span>
            </div>
            <div className="border-b pb-1.5">
              <span className="text-gray-500">জরুরি যোগাযোগ:</span>{" "}
              <span className="font-semibold">{bio.emergencyPhone || "—"}</span>
            </div>
            <div className="border-b pb-1.5">
              <span className="text-gray-500">ইমেইল:</span>{" "}
              <span className="font-semibold">{user.email || "—"}</span>
            </div>
            <div className="border-b pb-1.5">
              <span className="text-gray-500">NID নম্বর:</span>{" "}
              <span className="font-bold text-gray-900">
                {bio.nidNumber || "—"}
              </span>
            </div>
            <div className="border-b pb-1.5">
              <span className="text-gray-500">জন্ম তারিখ:</span>{" "}
              <span className="font-semibold">{bio.dateOfBirth || "—"}</span>
            </div>
            <div className="border-b pb-1.5">
              <span className="text-gray-500">রক্তের গ্রুপ:</span>{" "}
              <span className="font-bold text-red-600">
                {bio.bloodGroup || "—"}
              </span>
            </div>
            {bio.vehicleType && (
              <div className="border-b pb-1.5 sm:col-span-2">
                <span className="text-gray-500">বাহনের ধরন:</span>{" "}
                <span className="font-semibold">{bio.vehicleType}</span>
              </div>
            )}
            <div className="border-b pb-1.5 sm:col-span-2">
              <span className="text-gray-500">বর্তমান ঠিকানা:</span>{" "}
              <span className="font-semibold">
                {bio.presentAddress || user.address || "—"}
              </span>
            </div>
            <div className="border-b pb-1.5 sm:col-span-2">
              <span className="text-gray-500">স্থায়ী ঠিকানা:</span>{" "}
              <span className="font-semibold">{bio.permanentAddress || "—"}</span>
            </div>
          </div>

          {/* NID ফ্রন্ট ও ব্যাক ছবি */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-gray-700">
              জাতীয় পরিচয়পত্র (NID Card) কপি:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-xl p-2 bg-gray-50 text-center">
                <p className="text-[11px] font-semibold text-gray-500 mb-1.5">
                  NID সামনের অংশ (Front Side)
                </p>
                {bio.nidFrontImage ? (
                  <img
                    src={bio.nidFrontImage}
                    alt="NID Front"
                    className="w-full h-40 object-contain rounded-lg bg-white"
                  />
                ) : (
                  <div className="h-40 flex items-center justify-center text-xs text-gray-400">
                    ছবি সংযুক্ত নেই
                  </div>
                )}
              </div>

              <div className="border rounded-xl p-2 bg-gray-50 text-center">
                <p className="text-[11px] font-semibold text-gray-500 mb-1.5">
                  NID পেছনের অংশ (Back Side)
                </p>
                {bio.nidBackImage ? (
                  <img
                    src={bio.nidBackImage}
                    alt="NID Back"
                    className="w-full h-40 object-contain rounded-lg bg-white"
                  />
                ) : (
                  <div className="h-40 flex items-center justify-center text-xs text-gray-400">
                    ছবি সংযুক্ত নেই
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* স্বাক্ষরের ঘর */}
          <div className="pt-10 flex justify-between text-xs text-gray-600">
            <div className="border-t border-gray-400 pt-1 px-4">
              আবেদনকারীর স্বাক্ষর ও তারিখ
            </div>
            <div className="border-t border-gray-400 pt-1 px-4">
              অনুমোদনকারী কর্তৃপক্ষের স্বাক্ষর
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
