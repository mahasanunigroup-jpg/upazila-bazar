"use client";

import React, { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import PrintableReceipt from "./PrintableReceipt";
import { X, Printer } from "lucide-react";

export default function UniversalPrintButtons({ order, role = "admin" }) {
  const printRef = useRef(null);
  const defaultTarget = role === "seller" ? "seller" : "customer";
  const [activePrint, setActivePrint] = useState({
    type: "pos",
    targetRole: defaultTarget,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);

  const triggerPrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `UB-${activePrint.type.toUpperCase()}-${order?.orderId || "001"}`,
  });

  // ডিভাইসের স্ক্রিন সাইজ অনুযায়ী প্রিভিউ অটো-ফিট করার হিসাব
  useEffect(() => {
    if (!isOpen) return;

    const updateScale = () => {
      const availableWidth = Math.min(window.innerWidth - 48, 720);
      const targetWidth = activePrint.type === "pos" ? 300 : 768;
      const scale = availableWidth < targetWidth ? availableWidth / targetWidth : 1;
      setPreviewScale(scale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [isOpen, activePrint.type]);

  if (!order) return null;

  const baseWidth = activePrint.type === "pos" ? 300 : 768;

  return (
    <>
      {/* একটি মাত্র স্মার্ট প্রিন্ট বাটন */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-gray-800 hover:bg-gray-900 text-white px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold shadow-2xs transition cursor-pointer inline-flex items-center gap-1 whitespace-nowrap shrink-0"
      >
        <Printer className="w-3.5 h-3.5" />
        <span>প্রিন্ট</span>
      </button>

      {/* অদৃশ্য প্রিন্ট এরিয়া (অরিজিনাল সাইজে প্রিন্ট হবে) */}
      <div className="hidden">
        <div ref={printRef}>
          <PrintableReceipt order={order} activePrint={activePrint} />
        </div>
      </div>

      {/* প্রিন্ট অপশন ও অটো-ফিট প্রিভিউ মোডাল */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-2.5 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
          >
            {/* হেডার */}
            <div className="px-4 py-3 bg-gray-900 text-white flex items-center justify-between shrink-0">
              <span className="text-xs sm:text-sm font-bold">
                রিসিট / ইনভয়েস প্রিভিউ (#{order.orderId})
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg bg-white/15 hover:bg-white/25 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ফরম্যাট সিলেক্টর ট্যাব */}
            <div className="p-2.5 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-center gap-1.5 shrink-0">
              {(role === "rider" || role === "seller" || role === "admin") && (
                <button
                  type="button"
                  onClick={() => setActivePrint({ type: "pos", targetRole: "customer" })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activePrint.type === "pos"
                      ? "bg-gray-800 text-white shadow-2xs"
                      : "bg-white text-gray-700 border border-gray-200"
                  }`}
                >
                  🧾 মিনি POS স্লিপ
                </button>
              )}

              {(role === "seller" || role === "admin") && (
                <button
                  type="button"
                  onClick={() => setActivePrint({ type: "a4", targetRole: "seller" })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activePrint.type === "a4" && activePrint.targetRole === "seller"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-white text-gray-700 border border-gray-200"
                  }`}
                >
                  📄 সেলার ইনভয়েস
                </button>
              )}

              {role === "admin" && (
                <button
                  type="button"
                  onClick={() => setActivePrint({ type: "a4", targetRole: "customer" })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activePrint.type === "a4" && activePrint.targetRole === "customer"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "bg-white text-gray-700 border border-gray-200"
                  }`}
                >
                  🖨️ কাস্টমার ইনভয়েস
                </button>
              )}
            </div>

            {/* অটো-স্কেলড লাইভ রিসিট প্রিভিউ (কোনো কাটাকাটি ছাড়া পুরো পেজ দেখাবে) */}
            <div className="p-3 overflow-y-auto overflow-x-hidden bg-gray-100 flex-1 flex justify-center items-start">
              <div
                style={{
                  width: `${baseWidth * previewScale}px`,
                  overflow: "hidden",
                }}
                className="bg-white shadow-md rounded-lg shrink-0"
              >
                <div
                  style={{
                    width: `${baseWidth}px`,
                    transform: `scale(${previewScale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <PrintableReceipt order={order} activePrint={activePrint} />
                </div>
              </div>
            </div>

            {/* নিচের অ্যাকশন বাটন */}
            <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => triggerPrint()}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> প্রিন্ট / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
