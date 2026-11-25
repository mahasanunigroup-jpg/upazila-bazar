"use client";

import React, { useState, useEffect } from "react";
import { BD_LOCATIONS } from "@/data/bdLocations";
import SearchableSelect from "@/components/SearchableSelect";
import { MapPin, X, Check } from "lucide-react";

export default function LocationModal({ isOpen, onClose, location, onSave }) {
  const [tempLoc, setTempLoc] = useState(location);

  useEffect(() => {
    setTempLoc(location);
  }, [location, isOpen]);

  if (!isOpen) return null;

  const districts = ["সকল জেলা (সারা বাংলাদেশ)", ...Object.keys(BD_LOCATIONS)];
  const upazilas =
    tempLoc?.district && BD_LOCATIONS[tempLoc.district]
      ? ["সকল উপজেলা", ...Object.keys(BD_LOCATIONS[tempLoc.district])]
      : [];
  const unions =
    tempLoc?.district && tempLoc?.upazila && BD_LOCATIONS[tempLoc.district]?.[tempLoc.upazila]
      ? ["সকল ইউনিয়ন", ...BD_LOCATIONS[tempLoc.district][tempLoc.upazila]]
      : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedLoc = {
      district: tempLoc?.district === "সকল জেলা (সারা বাংলাদেশ)" ? "" : tempLoc?.district || "",
      upazila: tempLoc?.upazila === "সকল উপজেলা" ? "" : tempLoc?.upazila || "",
      union: tempLoc?.union === "সকল ইউনিয়ন" ? "" : tempLoc?.union || "",
      moholla: tempLoc?.moholla || "",
    };
    onSave(cleanedLoc);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-extrabold text-gray-800 text-base sm:text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" /> আপনার এলাকা নির্বাচন করুন
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">জেলা</label>
            <SearchableSelect
              options={districts}
              value={tempLoc?.district || "সকল জেলা (সারা বাংলাদেশ)"}
              onChange={(val) => setTempLoc({ district: val, upazila: "", union: "", moholla: "" })}
              placeholder="জেলা খুঁজুন..."
            />
          </div>

          {upazilas.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">উপজেলা / থানা</label>
              <SearchableSelect
                options={upazilas}
                value={tempLoc?.upazila || "সকল উপজেলা"}
                onChange={(val) => setTempLoc((prev) => ({ ...prev, upazila: val, union: "", moholla: "" }))}
                placeholder="উপজেলা খুঁজুন..."
              />
            </div>
          )}

          {unions.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ইউনিয়ন / পৌরসভা</label>
              <SearchableSelect
                options={unions}
                value={tempLoc?.union || "সকল ইউনিয়ন"}
                onChange={(val) => setTempLoc((prev) => ({ ...prev, union: val, moholla: "" }))}
                placeholder="ইউনিয়ন খুঁজুন..."
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">বাজার বা মহল্লার নাম (ঐচ্ছিক)</label>
            <input
              type="text"
              placeholder="যেমন: sakib market, সদর বাজার..."
              value={tempLoc?.moholla || ""}
              onChange={(e) => setTempLoc((prev) => ({ ...prev, moholla: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" /> নিশ্চিত করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
