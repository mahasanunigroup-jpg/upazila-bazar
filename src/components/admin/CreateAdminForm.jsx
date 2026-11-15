"use client";

import { useState } from "react";
import { BD_LOCATIONS } from "@/data/bdLocations";
import { BD_DIVISIONS } from "@/lib/divisionMap";
import { optimizeImageFile } from "@/lib/optimizeImage";

const ROLE_DISPLAY = {
  seller: "Seller (বিক্রেতা)",
  rider: "Rider (ডেলিভারি রাইডার)",
  union_admin: "Union Admin (ইউনিয়ন অ্যাডমিন)",
  upazila_admin: "Upazila Admin (উপজেলা অ্যাডমিন)",
  district_admin: "Zila Admin (জেলা অ্যাডমিন)",
  division_admin: "Division Admin (বিভাগীয় অ্যাডমিন)",
};

// নাম থেকে সংখ্যা বাদ দেওয়া এবং ফোন/NID থেকে অক্ষর বাদ দেওয়ার হেল্পার
const onlyText = (val) => val.replace(/[0-9০-৯]/g, "");
const onlyDigits = (val, maxLen) => val.replace(/\D/g, "").slice(0, maxLen);

// ১৮ বছর পূর্ণ হওয়ার সর্বোচ্চ জন্ম তারিখ (YYYY-MM-DD)
function getMaxAdultDob() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split("T");
}

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
  const [avatarFile, setAvatarFile] = useState(null);
  const [nidFrontFile, setNidFrontFile] = useState(null);
  const [nidBackFile, setNidBackFile] = useState(null);

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
    biodata: {
      fatherName: "",
      motherName: "",
      nidNumber: "",
      dateOfBirth: "",
      bloodGroup: "",
      emergencyPhone: "",
      permanentAddress: "",
      presentAddress: "",
      vehicleType: "",
    },
  });

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

  async function uploadSingleImage(file) {
    if (!file) return "";
    const optimized = await optimizeImageFile(file, 1000, 0.9);
    const fd = new FormData();
    fd.append("file", optimized);
    const res = await fetch("/api/admin/upload-biodata-image", {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "ছবি আপলোড ব্যর্থ");
    return data.url;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // সাবমিটের আগে কড়া ভ্যালিডেশন চেক
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const nidRegex = /^(\d{10}|\d{13}|\d{17})$/;

    if (form.name.trim().length < 3) {
      return alert("পূর্ণ নাম কমপক্ষে ৩ অক্ষরের হতে হবে!");
    }
    if (!emailRegex.test(form.email.trim())) {
      return alert("সঠিক ইমেইল ঠিকানা দিন (যেমন: user@gmail.com)!");
    }
    if (!bdPhoneRegex.test(form.phone)) {
      return alert("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)!");
    }
    if (form.password.length < 6) {
      return alert("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!");
    }
    if (!nidRegex.test(form.biodata.nidNumber)) {
      return alert("NID নম্বরটি অবশ্যই ১০, ১৩ অথবা ১৭ ডিজিটের হতে হবে!");
    }
    if (
      form.biodata.emergencyPhone &&
      !bdPhoneRegex.test(form.biodata.emergencyPhone)
    ) {
      return alert("জরুরি নম্বরটি সঠিক ১১ ডিজিটের বাংলাদেশি নম্বর হতে হবে!");
    }
    if (form.biodata.presentAddress.trim().length < 5 || form.biodata.permanentAddress.trim().length < 5) {
      return alert("বর্তমান ও স্থায়ী ঠিকানা বিস্তারিতভাবে লিখুন!");
    }

    setCreating(true);
    try {
      const [avatarUrl, nidFrontUrl, nidBackUrl] = await Promise.all([
        uploadSingleImage(avatarFile),
        uploadSingleImage(nidFrontFile),
        uploadSingleImage(nidBackFile),
      ]);

      const payload = {
        ...form,
        address: form.biodata.presentAddress,
        biodata: {
          ...form.biodata,
          avatar: avatarUrl,
          nidFrontImage: nidFrontUrl,
          nidBackImage: nidBackUrl,
        },
      };

      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
          নতুন অ্যাডমিন বা রাইডার নিয়োগ ও পূর্ণাঙ্গ বায়োডাটা ফর্ম
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
          minLength={3}
          placeholder="পূর্ণ নাম (শুধু অক্ষর) *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: onlyText(e.target.value) })}
          className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="email"
          required
          placeholder="লগইন ইমেইল (name@gmail.com) *"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="tel"
          required
          inputMode="numeric"
          maxLength={11}
          placeholder="মোবাইল (01XXXXXXXXX) *"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: onlyDigits(e.target.value, 11) })
          }
          className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* ২. রোল অনুযায়ী দায়িত্বপ্রাপ্ত এলাকা */}
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
      {/* ৩. পূর্ণাঙ্গ ব্যক্তিগত বায়োডাটা ও ঠিকানা */}
      <div className="bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100 space-y-3">
        <p className="text-xs font-bold text-emerald-800">
          🪪 ব্যক্তিগত বায়োডাটা ও ঠিকানা:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            type="text"
            required
            minLength={3}
            placeholder="পিতার নাম (শুধু অক্ষর) *"
            value={form.biodata.fatherName}
            onChange={(e) => updateBio("fatherName", onlyText(e.target.value))}
            className="px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            required
            minLength={3}
            placeholder="মাতার নাম (শুধু অক্ষর) *"
            value={form.biodata.motherName}
            onChange={(e) => updateBio("motherName", onlyText(e.target.value))}
            className="px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            required
            inputMode="numeric"
            maxLength={17}
            placeholder="NID নম্বর (১০/১৩/১৭ ডিজিট) *"
            value={form.biodata.nidNumber}
            onChange={(e) =>
              updateBio("nidNumber", onlyDigits(e.target.value, 17))
            }
            className="px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div>
            <label className="block text-[11px] text-gray-500 mb-0.5">
              জন্ম তারিখ (কমপক্ষে ১৮ বছর) *
            </label>
            <input
              type="date"
              required
              min="1940-01-01"
              max={getMaxAdultDob()}
              value={form.biodata.dateOfBirth}
              onChange={(e) => updateBio("dateOfBirth", e.target.value)}
              className="w-full px-3 py-1.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-0.5">রক্তের গ্রুপ</label>
            <select
              value={form.biodata.bloodGroup}
              onChange={(e) => updateBio("bloodGroup", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- রক্তের গ্রুপ --</option>
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-0.5">
              জরুরি ফোন নম্বর (১১ ডিজিট)
            </label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={11}
              placeholder="01XXXXXXXXX"
              value={form.biodata.emergencyPhone}
              onChange={(e) =>
                updateBio("emergencyPhone", onlyDigits(e.target.value, 11))
              }
              className="w-full px-3 py-1.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <input
            type="text"
            required
            minLength={5}
            placeholder="বর্তমান ঠিকানা (গ্রাম/মহল্লা, উপজেলা, জেলা) *"
            value={form.biodata.presentAddress}
            onChange={(e) => updateBio("presentAddress", e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            required
            minLength={5}
            placeholder="স্থায়ী ঠিকানা (গ্রাম/মহল্লা, উপজেলা, জেলা) *"
            value={form.biodata.permanentAddress}
            onChange={(e) => updateBio("permanentAddress", e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {form.role === "rider" && (
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
          )}
        </div>

        {/* ৪. ৩টি ডকুমেন্ট ছবি */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-200/60">
          <div className="bg-white p-2.5 rounded-lg border border-gray-200">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              📸 ব্যক্তির পাসপোর্ট ছবি *
            </label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setAvatarFile(e.target.files?.item(0) || null)}
              className="text-xs w-full file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-semibold"
            />
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-gray-200">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              🪪 NID সামনের ছবি (Front) *
            </label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setNidFrontFile(e.target.files?.item(0) || null)}
              className="text-xs w-full file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-semibold"
            />
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-gray-200">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              🪪 NID পেছনের ছবি (Back) *
            </label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setNidBackFile(e.target.files?.item(0) || null)}
              className="text-xs w-full file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-semibold"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={creating}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition cursor-pointer"
        >
          {creating ? "ছবি আপলোড ও সংরক্ষণ হচ্ছে..." : "পূর্ণাঙ্গ বায়োডাটাসহ সংরক্ষণ করুন"}
        </button>
      </div>
    </form>
  );
}
