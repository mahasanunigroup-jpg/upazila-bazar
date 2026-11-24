"use client";

import React, { useState, useEffect } from "react";
import { FileCheck2, ShieldCheck } from "lucide-react";

function SmartInput({ storageKey, label, placeholder, value, defaultOptions, onChange }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setSaved(items);
    } catch {}
  }, [storageKey]);

  const allOptions = [...new Set([...saved, ...defaultOptions])];
  const filtered = value?.trim()
    ? allOptions.filter((o) => o.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
    : allOptions.slice(0, 6);

  return (
    <div className="relative">
      <label className="block text-xs font-bold text-emerald-900 mb-1">{label}</label>
      <input
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={value ?? ""}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 180)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        className="w-full bg-white border border-emerald-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-green-500"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-emerald-200 rounded-xl shadow-lg max-h-44 overflow-y-auto divide-y divide-gray-100">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt);
                setOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-800 hover:bg-green-50 cursor-pointer"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategorySmartFields({
  rules,
  field1Val,
  field2Val,
  prescriptionReq,
  onChangeField1,
  onChangeField2,
  onChangePrescription,
}) {
  return (
    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SmartInput
          storageKey={`upazila_smart_${rules.key}_f1`}
          label={rules.field1.label}
          placeholder={rules.field1.placeholder}
          value={field1Val}
          defaultOptions={rules.field1.suggestions}
          onChange={onChangeField1}
        />
        <SmartInput
          storageKey={`upazila_smart_${rules.key}_f2`}
          label={rules.field2.label}
          placeholder={rules.field2.placeholder}
          value={field2Val}
          defaultOptions={rules.field2.suggestions}
          onChange={onChangeField2}
        />
      </div>

      {rules.key === "medicine" && (
        <div className="pt-1 border-t border-emerald-200/70">
          <label className="block text-xs font-bold text-emerald-900 mb-1.5">
            📋 প্রেসক্রিপশন নীতিমালা
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChangePrescription(false)}
              className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer transition ${
                !prescriptionReq
                  ? "bg-green-600 text-white border-green-600 shadow-xs"
                  : "bg-white text-gray-700 border-emerald-200 hover:border-green-400"
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" /> প্রেসক্রিপশন ছাড়া যাবে
            </button>
            <button
              type="button"
              onClick={() => onChangePrescription(true)}
              className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer transition ${
                prescriptionReq
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-white text-gray-700 border-emerald-200 hover:border-amber-400"
              }`}
            >
              <FileCheck2 className="w-4 h-4 shrink-0" /> প্রেসক্রিপশন বাধ্যতামূলক
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
