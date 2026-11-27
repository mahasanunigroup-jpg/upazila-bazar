"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  Building2,
  MapPin,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

export default function ProfileEditForm({ customer }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const [formData, setFormData] = useState({
    companyName: customer?.companyName || "",
    division: customer?.division || "",
    district: customer?.district || "",
    upazila: customer?.upazila || "",
    union: customer?.union || "",
    moholla: customer?.moholla || "",
    address: customer?.address || "",
    currentPassword: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const payload = {
        companyName: formData.companyName.trim(),
        division: formData.division.trim(),
        district: formData.district.trim(),
        upazila: formData.upazila.trim(),
        union: formData.union.trim(),
        moholla: formData.moholla.trim(),
        address: formData.address.trim(),
      };

      if (showPasswordFields && formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "প্রোফাইল আপডেট ব্যর্থ হয়েছে");

      setStatus({ type: "success", message: "প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!" });
      setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      setShowPasswordFields(false);
      router.refresh();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-2xs">
      {/* হেডার */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-600 shrink-0" />
          <h1 className="text-base sm:text-lg font-bold text-gray-900">
            প্রোফাইল তথ্য আপডেট
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setShowPasswordFields(!showPasswordFields)}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-2 cursor-pointer"
        >
          {showPasswordFields ? "পাসওয়ার্ড বাতিল" : "পাসওয়ার্ড পরিবর্তন"}
        </button>
      </div>

      {/* লক করা তথ্যের সতর্কবার্তা */}
      <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          নিরাপত্তার স্বার্থে আপনার <strong>নাম, মোবাইল নম্বর এবং ইমেইল</strong> সরাসরি পরিবর্তন করা যাবে না। এগুলো পরিবর্তন করতে হলে অনুগ্রহ করে <strong>অ্যাডমিনের সাথে যোগাযোগ</strong> করুন।
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-5">
        {status.message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-xs font-medium border ${
              status.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-600 border-red-200"
            }`}
          >
            {status.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{status.message}</span>
          </div>
        )}

        {/* ১. অপরিবর্তনযোগ্য নিবন্ধিত তথ্য (Read-Only) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-gray-50 p-3.5 rounded-xl border border-gray-200/80">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              নিবন্ধিত নাম (লক করা)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customer?.name || ""}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-100 text-gray-600 pl-9 pr-3 py-2 text-xs sm:text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              মোবাইল নম্বর (লক করা)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customer?.phone || "দেওয়া হয়নি"}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-100 text-gray-600 pl-9 pr-3 py-2 text-xs sm:text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              ইমেইল (লক করা)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customer?.email || "দেওয়া হয়নি"}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-100 text-gray-600 pl-9 pr-3 py-2 text-xs sm:text-sm cursor-not-allowed"
              />
            </div>
          </div>
        </div>
        {/* ২. এডিটযোগ্য কর্পোরেট ও এলাকার তথ্য */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              প্রতিষ্ঠানের নাম (কর্পোরেট / অফিস / দোকান)
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="companyName"
                placeholder="যেমন: মেসার্স রহমান ট্রেডার্স বা ভৈরব মডেল স্কুল"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">বিভাগ</label>
            <input
              type="text"
              name="division"
              value={formData.division}
              onChange={handleChange}
              placeholder="যেমন: ঢাকা"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">জেলা</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="যেমন: কিশোরগঞ্জ"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">উপজেলা</label>
            <input
              type="text"
              name="upazila"
              value={formData.upazila}
              onChange={handleChange}
              placeholder="যেমন: ভৈরব"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">ইউনিয়ন / পৌরসভা</label>
            <input
              type="text"
              name="union"
              value={formData.union}
              onChange={handleChange}
              placeholder="যেমন: শিমুলকান্দি"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">গ্রাম / মহল্লা</label>
            <input
              type="text"
              name="moholla"
              value={formData.moholla}
              onChange={handleChange}
              placeholder="যেমন: মধ্যপাড়া"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">বিস্তারিত ঠিকানা</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="বাসা/রোড নং বা পরিচিত স্থান"
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ৩. ঐচ্ছিক পাসওয়ার্ড পরিবর্তন সেকশন */}
        {showPasswordFields && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                বর্তমান পাসওয়ার্ড *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="currentPassword"
                  required={showPasswordFields}
                  placeholder="••••••••"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                নতুন পাসওয়ার্ড *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="newPassword"
                  required={showPasswordFields}
                  minLength={6}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>পরিবর্তন সেভ করুন</span>
          </button>
        </div>
      </form>
    </div>
  );
}
