"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Home,
  Phone,
  Loader2,
  X,
} from "lucide-react";

export default function AddressBook({ initialAddresses = [] }) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    label: "বাসা",
    receiverName: "",
    phone: "",
    union: "",
    villageOrWard: "",
    landmark: "",
    isDefault: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // নতুন ঠিকানা সেভ করা
  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "ঠিকানা সেভ করা যায়নি");

      setAddresses(data.addresses);
      setIsFormOpen(false);
      setFormData({
        label: "বাসা",
        receiverName: "",
        phone: "",
        union: "",
        villageOrWard: "",
        landmark: "",
        isDefault: false,
      });
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ডিফল্ট ঠিকানা সেট করা
  const handleSetDefault = async (addressId) => {
    try {
      const res = await fetch(`/api/customer/addresses/${addressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      const data = await res.json();
      if (res.ok) {
        setAddresses(data.addresses);
        router.refresh();
      }
    } catch (err) {
      console.error("ডিফল্ট ঠিকানা আপডেটে সমস্যা:", err);
    }
  };

  // ঠিকানা ডিলিট করা
  const handleDelete = async (addressId) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই ঠিকানাটি মুছে ফেলতে চান?")) return;

    try {
      const res = await fetch(`/api/customer/addresses/${addressId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setAddresses(data.addresses);
        router.refresh();
      }
    } catch (err) {
      console.error("ঠিকানা ডিলিট করতে সমস্যা:", err);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-2xs">
      {/* হেডার (এক লাইনে স্লিম ও রেসপন্সিভ) */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
          <h2 className="text-sm sm:text-base font-bold text-gray-900 whitespace-nowrap">
            ডেলিভারি ঠিকানা
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isFormOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{isFormOpen ? "বন্ধ করুন" : "নতুন ঠিকানা"}</span>
        </button>
      </div>

      {/* নতুন ঠিকানা যোগ করার ফর্ম */}
      {isFormOpen && (
        <form
          onSubmit={handleAddAddress}
          className="mt-4 p-3.5 sm:p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3.5"
        >
          <h3 className="text-xs sm:text-sm font-bold text-gray-800">
            নতুন ডেলিভারি ঠিকানা যোগ করুন
          </h3>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ঠিকানার ধরন</label>
              <select
                name="label"
                value={formData.label}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="বাসা">বাসা</option>
                <option value="অফিস">অফিস</option>
                <option value="দোকান">দোকান</option>
                <option value="অন্যান্য">অন্যান্য</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">প্রাপকের নাম *</label>
              <input
                type="text"
                name="receiverName"
                required
                placeholder="যেমন: মোঃ রহিম উদ্দিন"
                value={formData.receiverName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">মোবাইল নম্বর *</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="01XXXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ইউনিয়ন / পৌরসভা *</label>
              <input
                type="text"
                name="union"
                required
                placeholder="যেমন: শিমুলকান্দি বা পৌরসভা"
                value={formData.union}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">গ্রাম / মহল্লা / ওয়ার্ড *</label>
              <input
                type="text"
                name="villageOrWard"
                required
                placeholder="যেমন: মধ্যপাড়া, ওয়ার্ড নং ০৪"
                value={formData.villageOrWard}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">পরিচিত স্থান (Landmark)</label>
              <input
                type="text"
                name="landmark"
                placeholder="যেমন: বড় জামে মসজিদের পাশে"
                value={formData.landmark}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            এটিকে ডিফল্ট ডেলিভারি ঠিকানা হিসেবে সেট করুন
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              ঠিকানা সেভ করুন
            </button>
          </div>
        </form>
      )}
      {/* সেভ করা ঠিকানার তালিকা */}
      <div className="mt-3.5 space-y-2.5">
        {addresses.length === 0 ? (
          <div className="text-center py-5 px-3 text-gray-500 text-xs sm:text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200 leading-relaxed">
            কোনো ডেলিভারি ঠিকানা সেভ করা নেই। দ্রুত অর্ডার করতে{" "}
            <span className="font-semibold text-emerald-700">+ নতুন ঠিকানা</span> যোগ করুন।
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr._id}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                addr.isDefault
                  ? "border-emerald-500 bg-emerald-50/40"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                    <Home className="w-3 h-3" /> {addr.label}
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-gray-900">
                    {addr.receiverName}
                  </span>
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> ডিফল্ট
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-gray-700">
                  {addr.villageOrWard}, {addr.union}
                  {addr.landmark && <span className="text-gray-500"> ({addr.landmark})</span>}
                </p>

                <p className="text-[11px] sm:text-xs text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {addr.phone}
                </p>
              </div>

              {/* অ্যাকশন বাটনসমূহ */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-[11px] sm:text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-2.5 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    ডিফল্ট করুন
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(addr._id)}
                  title="ঠিকানা মুছে ফেলুন"
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
