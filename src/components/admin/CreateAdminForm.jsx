"use client";

import { useState } from "react";
import { BD_LOCATIONS } from "@/data/bdLocations";
import { BD_DIVISIONS } from "@/lib/divisionMap";

const ROLE_DISPLAY = {
  seller: "Seller (বিক্রেতা)",
  rider: "Rider (ডেলিভারি রাইডার)",
  union_admin: "Union Admin (ইউনিয়ন অ্যাডমিন)",
  upazila_admin: "Upazila Admin (উপজেলা অ্যাডমিন)",
  district_admin: "Zila Admin (জেলা অ্যাডমিন)",
  division_admin: "Division Admin (বিভাগীয় অ্যাডমিন)",
};

export default function CreateAdminForm({
  currentAdmin,
  allowedRoles,
  onCreated,
  onClose,
}) {
  const isSuperAdmin =
    currentAdmin.role === "admin" || currentAdmin.role === "super_admin";
  const defaultRole = allowedRoles.at(0) || "union_admin";

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: defaultRole,
    division: isSuperAdmin ? "" : currentAdmin.division || "",
    district: isSuperAdmin ? "" : currentAdmin.district || "",
    upazila: isSuperAdmin ? "" : currentAdmin.upazila || "",
    union: isSuperAdmin ? "" : currentAdmin.union || "",
    address: "",
    biodata: {
      fatherName: "",
      nidNumber: "",
      dateOfBirth: "",
      bloodGroup: "",
      emergencyPhone: "",
      vehicleType: "",
    },
  });

  // নির্বাচিত রোল অনুযায়ী কোন কোন লোকেশন স্তর প্রযোজ্য
  const showDistrict = form.role !== "division_admin";
  const showUpazila = !["division_admin", "district_admin"].includes(form.role);
  const showUnion = !["division_admin", "district_admin", "upazila_admin"].includes(form.role);

  const divisionsList = Object.keys(BD_DIVISIONS);
  const districtsList = form.division
    ? BD_DIVISIONS[form.division] || Object.keys(BD_LOCATIONS)
    : Object.keys(BD_LOCATIONS);
  const upazilasList =
    form.district && BD_LOCATIONS[form.district]
      ? Object.keys(BD_LOCATIONS[form.district])
      : [];
  const unionsList =
    form.district && form.upazila && BD_LOCATIONS[form.district]?.[form.upazila]
      ? BD_LOCATIONS[form.district][form.upazila]
      : [];

  const updateBio = (field, val) => {
    setForm({ ...form, biodata: { ...form.biodata, [field]: val } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(data.message);
      onCreated(data.user);
    } catch (err) {
      alert(err.message || "তৈরি করতে সমস্যা হয়েছে");
    } finally {
      setCreating(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm space-y-4 text-sm"
    >
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="font-bold text-gray-800">
          নতুন অ্যাডমিন বা রাইডার নিয়োগ ও বায়োডাটা ফর্ম
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-gray-500 hover:text-red-600 cursor-pointer"
        >
          ✕ বন্ধ করুন
        </button>
      </div>

      {/* ১. লগইন ও রোল তথ্য */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="px-3 py-2 border-2 border-emerald-500 rounded-lg bg-emerald-50/40 font-bold text-emerald-900 outline-none"
        >
          {allowedRoles.map((r) => (
            <option key={r} value={r}>
              {ROLE_DISPLAY[r] || r}
            </option>
          ))}
        </select>

        <input
          type="text"
          required
          placeholder="পূর্ণ নাম *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="email"
          required
          placeholder="লগইন ইমেইল *"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="text"
          required
          placeholder="মোবাইল নম্বর *"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="password"
          required
          placeholder="লগইন পাসওয়ার্ড *"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* ২. রোল অনুযায়ী স্মার্ট লোকেশন ড্রপডাউন */}
      <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2">
        <p className="text-xs font-bold text-gray-600">
          📍 দায়িত্বপ্রাপ্ত এলাকা নির্বাচন করুন ({ROLE_DISPLAY[form.role]}):
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            required
            disabled={!isSuperAdmin && Boolean(currentAdmin.division)}
            value={form.division}
            onChange={(e) =>
              setForm({
                ...form,
                division: e.target.value,
                district: "",
                upazila: "",
                union: "",
              })
            }
            className="px-3 py-2 border rounded-lg bg-white disabled:bg-gray-100 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">-- বিভাগ নির্বাচন করুন * --</option>
            {divisionsList.map((div) => (
              <option key={div} value={div}>
                {div} বিভাগ
              </option>
            ))}
          </select>

          {showDistrict && (
            <select
              required
              disabled={!isSuperAdmin && Boolean(currentAdmin.district)}
              value={form.district}
              onChange={(e) =>
                setForm({ ...form, district: e.target.value, upazila: "", union: "" })
              }
              className="px-3 py-2 border rounded-lg bg-white disabled:bg-gray-100 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- জেলা নির্বাচন করুন * --</option>
              {districtsList.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          )}

          {showUpazila && (
            <select
              required
              disabled={(!isSuperAdmin && Boolean(currentAdmin.upazila)) || !form.district}
              value={form.upazila}
              onChange={(e) => setForm({ ...form, upazila: e.target.value, union: "" })}
              className="px-3 py-2 border rounded-lg bg-white disabled:bg-gray-100 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- উপজেলা নির্বাচন করুন * --</option>
              {upazilasList.map((upz) => (
                <option key={upz} value={upz}>
                  {upz}
                </option>
              ))}
            </select>
          )}

          {showUnion && (
            <select
              required
              disabled={(!isSuperAdmin && Boolean(currentAdmin.union)) || !form.upazila}
              value={form.union}
              onChange={(e) => setForm({ ...form, union: e.target.value })}
              className="px-3 py-2 border rounded-lg bg-white disabled:bg-gray-100 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- ইউনিয়ন / পৌরসভা * --</option>
              {unionsList.map((uni) => (
                <option key={uni} value={uni}>
                  {uni}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ৩. অ্যাডমিন ও রাইডারের সম্পূর্ণ বায়োডাটা (Biodata) */}
      <div className="bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100 space-y-2">
        <p className="text-xs font-bold text-emerald-800">
          🪪 ব্যক্তিগত বায়োডাটা ও ভেরিফিকেশন তথ্য:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="পিতার নাম"
            value={form.biodata.fatherName}
            onChange={(e) => updateBio("fatherName", e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            placeholder="জাতীয় পরিচয়পত্র (NID) নম্বর"
            value={form.biodata.nidNumber}
            onChange={(e) => updateBio("nidNumber", e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            placeholder="জরুরি যোগাযোগ নম্বর (Emergency)"
            value={form.biodata.emergencyPhone}
            onChange={(e) => updateBio("emergencyPhone", e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="date"
            title="জন্ম তারিখ"
            value={form.biodata.dateOfBirth}
            onChange={(e) => updateBio("dateOfBirth", e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            value={form.biodata.bloodGroup}
            onChange={(e) => updateBio("bloodGroup", e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">-- রক্তের গ্রুপ --</option>
            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
          {form.role === "rider" ? (
            <select
              value={form.biodata.vehicleType}
              onChange={(e) => updateBio("vehicleType", e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- বাহনের ধরন (রাইডার) --</option>
              <option value="মোটরসাইকেল">মোটরসাইকেল</option>
              <option value="বাইসাইকেল">বাইসাইকেল</option>
              <option value="ইজিবাইক / ভ্যান">ইজিবাইক / ভ্যান</option>
            </select>
          ) : (
            <input
              type="text"
              placeholder="বর্তমান পূর্ণ ঠিকানা (গ্রাম / মহল্লা)"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={creating}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition cursor-pointer"
        >
          {creating ? "তৈরি হচ্ছে..." : "বায়োডাটাসহ সংরক্ষণ করুন"}
        </button>
      </div>
    </form>
  );
}
