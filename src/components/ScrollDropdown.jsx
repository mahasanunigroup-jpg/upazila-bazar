"use client";

import React, { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function ScrollDropdown({ label, value, placeholder, options, onSelect, prefix = "", extraOption }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        onBlur={() => setTimeout(() => setOpen(false), 180)}
        className="w-full bg-gray-50/60 hover:bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
      >
        <span className={value ? "font-medium text-gray-800" : "text-gray-400"}>
          {value ? `${prefix}${value}` : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto py-1">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between cursor-pointer ${
                value === opt ? "bg-green-50 text-green-700 font-bold" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>{prefix}{opt}</span>
              {value === opt && <Check className="w-4 h-4 text-green-600" />}
            </button>
          ))}
          {extraOption && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                extraOption.onClick();
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-bold text-green-700 bg-green-50/60 hover:bg-green-100 border-t border-gray-100 cursor-pointer"
            >
              {extraOption.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
