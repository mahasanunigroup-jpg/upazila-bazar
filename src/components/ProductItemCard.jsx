"use client";

import React, { useState } from "react";
import {
  Image as ImageIcon,
  Trash2,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  DEFAULT_CATEGORIES,
  COMMON_PRODUCTS,
  getCategoryRules,
} from "@/data/productOptions";
import ScrollDropdown from "@/components/ScrollDropdown";
import CategorySmartFields from "@/components/CategorySmartFields";

export default function ProductItemCard({
  item,
  index,
  total,
  isCollapsed,
  onToggleCollapse,
  suggestions = [],
  extraCategories = [],
  onChange,
  onSelectSuggestion,
  onRemove,
}) {
  const [showSug, setShowSug] = useState(false);
  const allCategories = [
    ...new Set([...DEFAULT_CATEGORIES, ...extraCategories]),
  ];
  const rules = getCategoryRules(item.category);

  const activeType =
    item.packagingType && rules.types.includes(item.packagingType)
      ? item.packagingType
      : rules.types.at(0);

  const activeUnitOptions =
    rules.typeUnits[activeType] || Object.values(rules.typeUnits).flat();

  const allProducts = [
    ...suggestions,
    ...COMMON_PRODUCTS.filter(
      (cp) =>
        !suggestions.some(
          (s) => s.title.toLowerCase() === cp.title.toLowerCase(),
        ),
    ),
  ];

  const q = item.title?.trim().toLowerCase() || "";
  const matched = q
    ? allProducts
        .filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.keywords?.toLowerCase().includes(q),
        )
        .slice(0, 6)
    : allProducts.slice(0, 5);

  const handleCategorySelect = (val) => {
    const newRules = getCategoryRules(val);
    const firstType = newRules.types.at(0);
    const firstUnit = newRules.typeUnits[firstType]?.at(0) || "পিস / টি";
    onChange(index, "isCustomCategory", false);
    onChange(index, "category", val);
    onChange(index, "packagingType", firstType);
    onChange(index, "unit", firstUnit);
    onChange(index, "smartField1", "");
    onChange(index, "smartField2", "");
    onChange(index, "prescriptionRequired", false);
  };

  const handleTypeSelect = (type) => {
    onChange(index, "packagingType", type);
    const unitsForType = rules.typeUnits[type];
    if (unitsForType && unitsForType.length > 0) {
      onChange(index, "unit", unitsForType.at(0));
    }
  };

  const toNum = (v) => {
    const map = {
      "০": "0",
      "১": "1",
      "২": "2",
      "৩": "3",
      "৪": "4",
      "৫": "5",
      "৬": "6",
      "৭": "7",
      "৮": "8",
      "৯": "9",
    };
    return Number(
      String(v || "")
        .replace(/[০-৯]/g, (d) => map[d])
        .replace(/[^0-9.]/g, ""),
    );
  };
  const regPriceNum = toNum(item.price);
  const discPriceNum = toNum(item.discountPrice);
  const discountPercent =
    regPriceNum > 0 && discPriceNum > 0 && discPriceNum < regPriceNum
      ? Math.round(((regPriceNum - discPriceNum) / regPriceNum) * 100)
      : 0;

  if (isCollapsed) {
    return (
      <div
        onClick={() => onToggleCollapse(index)}
        className="p-3.5 rounded-2xl border border-green-200 bg-green-50/50 hover:bg-green-50 flex items-center justify-between gap-3 cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-bold text-white bg-green-600 px-2.5 py-1 rounded-full shrink-0">
            পণ্য #{index + 1}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">
              {item.title || "নামহীন পণ্য"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {item.price
                ? `৳${item.discountPrice || item.price} / ${item.unit}`
                : "মূল্য নেই"}{" "}
              • {item.category || "ক্যাটাগরি নেই"}
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-green-700 inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-green-200 shrink-0">
          খুলুন <ChevronDown className="w-3.5 h-3.5" />
        </span>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-4 relative">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <span className="text-sm font-bold text-green-700 bg-green-50 border border-green-200 px-3.5 py-1 rounded-full">
          পণ্য #{index + 1}
        </span>
        {total > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleCollapse(index)}
              className="text-xs font-semibold text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 cursor-pointer"
            >
              ভাঁজ করুন <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> মুছুন
            </button>
          </div>
        )}
      </div>

      {/* ১. সবার উপরে ক্যাটাগরি ও পণ্যের ধরন */}
            {/* ১. সবার উপরে ক্যাটাগরি ও পণ্যের ধরন (আলাদা সারিতে পুরো প্রস্থ জুড়ে) */}
      <div className="space-y-3">
        <div className="space-y-2">
          <ScrollDropdown
            label="ক্যাটাগরি"
            value={item.isCustomCategory ? "নতুন ক্যাটাগরি" : item.category}
            placeholder="ক্যাটাগরি নির্বাচন করুন"
            options={allCategories}
            onSelect={handleCategorySelect}
            extraOption={{
              label: "➕ নতুন ক্যাটাগরি যোগ করুন",
              onClick: () => {
                onChange(index, "isCustomCategory", true);
                onChange(index, "category", "");
              },
            }}
          />
          <input type="text" required value={item.category} onChange={() => {}} className="sr-only" tabIndex={-1} />
          {item.isCustomCategory && (
            <input
              type="text"
              required
              placeholder="নতুন ক্যাটাগরির নাম লিখুন..."
              value={item.category}
              onChange={(e) => onChange(index, "category", e.target.value)}
              className="w-full bg-white border border-green-500 rounded-xl px-3.5 py-2.5 text-sm outline-none"
            />
          )}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
            পণ্যের ধরন
          </label>
          <div className="grid grid-cols-1 min-[360px]:grid-cols-3 gap-2">
            {rules.types.map((type) => {
              const active = activeType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeSelect(type)}
                  className={`w-full py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-bold border text-center whitespace-nowrap transition cursor-pointer ${
                    active
                      ? "bg-green-600 text-white border-green-600 shadow-2xs"
                      : "bg-gray-50/60 text-gray-700 border-gray-200 hover:border-green-400"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>
      </div>


      {/* ২. পণ্যের নাম */}
      <div className="relative">
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          পণ্যের নাম
        </label>
        <input
          type="text"
          required
          autoComplete="off"
          placeholder="উদাঃ alu, chal, napa, মিনিকেট চাল লিখুন..."
          value={item.title}
          onFocus={() => setShowSug(true)}
          onBlur={() => setTimeout(() => setShowSug(false), 180)}
          onChange={(e) => {
            onChange(index, "title", e.target.value);
            setShowSug(true);
          }}
          className="w-full bg-gray-50/60 focus:bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
        {showSug && matched.length > 0 && (
          <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto divide-y divide-gray-100">
            {matched.map((sug, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelectSuggestion(index, sug);
                  setShowSug(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-green-50 flex items-center gap-2.5 cursor-pointer"
              >
                {sug.image ? (
                  <img
                    src={sug.image}
                    alt=""
                    className="w-8 h-8 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <Sparkles className="w-4 h-4 text-green-600 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {sug.title}
                  </p>
                  {(sug.field1 || sug.field2) && (
                    <p className="text-[11px] text-green-600 truncate">
                      {[sug.field1, sug.field2].filter(Boolean).join(" • ")}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* ৩. ক্যাটাগরি অনুযায়ী স্মার্ট ২টি তথ্য + প্রেসক্রিপশন অপশন */}
      {item.category && (
        <CategorySmartFields
          rules={rules}
          field1Val={item.smartField1}
          field2Val={item.smartField2}
          prescriptionReq={Boolean(item.prescriptionRequired)}
          onChangeField1={(val) => onChange(index, "smartField1", val)}
          onChangeField2={(val) => onChange(index, "smartField2", val)}
          onChangePrescription={(val) =>
            onChange(index, "prescriptionRequired", val)
          }
        />
      )}

      {/* ৪. আসল মূল্য, ছাড়ের মূল্য ও পরিমাণ/একক (স্টক অপশন ছাড়া) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            আসল মূল্য (টাকা)
          </label>
          <input
            type="text"
            inputMode="numeric"
            required
            placeholder="উদাঃ ১৫০"
            value={item.price}
            onChange={(e) => onChange(index, "price", e.target.value)}
            className="w-full bg-gray-50/60 focus:bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-bold text-gray-700">
              ছাড়ের মূল্য (ঐচ্ছিক)
            </label>
            {discountPercent > 0 && (
              <span className="text-[11px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                {discountPercent}% ছাড়
              </span>
            )}
          </div>
          <input
            type="text"
            inputMode="numeric"
            placeholder="উদাঃ ১৩০"
            value={item.discountPrice || ""}
            onChange={(e) => onChange(index, "discountPrice", e.target.value)}
            className="w-full bg-orange-50/30 focus:bg-white border border-gray-200 focus:border-orange-400 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <ScrollDropdown
          label="পরিমাণ / একক"
          prefix="প্রতি "
          value={item.unit || activeUnitOptions.at(0)}
          placeholder="একক নির্বাচন করুন"
          options={activeUnitOptions}
          onSelect={(val) => onChange(index, "unit", val)}
        />
      </div>

      {/* ৫. পণ্যের বিবরণ */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          পণ্যের বিবরণ
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {rules.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                const current = item.description ? item.description.trim() : "";
                if (current.includes(tag)) return;
                onChange(
                  index,
                  "description",
                  current ? `${current}, ${tag}` : tag,
                );
              }}
              className="text-xs font-medium bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full transition cursor-pointer"
            >
              + {tag}
            </button>
          ))}
        </div>
        <textarea
          required
          rows="2"
          placeholder="উপরের ট্যাগগুলোতে ক্লিক করুন অথবা নিজের মতো লিখুন..."
          value={item.description}
          onChange={(e) => onChange(index, "description", e.target.value)}
          className="w-full bg-gray-50/60 focus:bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      {/* ৬. পণ্যের ছবি */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-green-600" /> পণ্যের ছবি
        </label>
        {item.existingImage && !item.imageFile && (
          <div className="mb-2 flex items-center gap-3 p-2 rounded-xl bg-green-50 border border-green-200 text-xs text-green-800">
            <img
              src={item.existingImage}
              alt=""
              className="w-10 h-10 rounded-lg object-cover shrink-0"
            />
            <span className="font-bold flex-1 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> অটো ছবি যুক্ত হয়েছে
            </span>
            <button
              type="button"
              onClick={() => onChange(index, "existingImage", "")}
              className="text-red-600 font-semibold cursor-pointer"
            >
              বাদ দিন
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          required={!item.existingImage}
          onChange={(e) =>
            onChange(
              index,
              "imageFile",
              e.target.files ? e.target.files.item(0) : null,
            )
          }
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-green-50 file:text-green-700 cursor-pointer"
        />
      </div>
    </div>
  );
}
