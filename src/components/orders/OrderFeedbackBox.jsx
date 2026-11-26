"use client";

import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";

const STAR_LIST = [1, 2, 3, 4, 5];

export default function OrderFeedbackBox({ order, onFeedbackSaved }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sellerRating, setSellerRating] = useState(5);
  const [sellerComment, setSellerComment] = useState("");
  const [riderRating, setRiderRating] = useState(5);
  const [riderComment, setRiderComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isDelivered = order.status === "delivered";
  const hasFeedback = order.feedback?.isSubmitted;

  if (!isDelivered) return null;

  if (hasFeedback) {
    return (
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 sm:p-4 text-xs sm:text-sm space-y-1">
        <p className="font-bold text-emerald-800 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          আপনার মূল্যবান ফিডব্যাক জমা হয়েছে:
        </p>
        <div className="flex flex-wrap gap-3 text-gray-700 font-semibold pl-5">
          <span>🏪 সেলার: {order.feedback.sellerRating}★</span>
          <span>🛵 রাইডার: {order.feedback.riderRating}★</span>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          sellerRating,
          sellerComment,
          riderRating,
          riderComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "ফিডব্যাক পাঠানো যায়নি!");
      } else {
        const saved = data.feedback || {
          isSubmitted: true,
          sellerRating: Number(sellerRating),
          sellerComment,
          riderRating: Number(riderRating),
          riderComment,
        };
        onFeedbackSaved(order.id, saved);
        setIsOpen(false);
        alert("ধন্যবাদ! আপনার রেটিং সফলভাবে জমা হয়েছে।");
      }
    } catch {
      alert("সার্ভারে সমস্যা হয়েছে!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/80 hover:bg-amber-200/80 py-2.5 px-4 rounded-lg transition cursor-pointer"
      >
        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
        {isOpen ? "ফর্ম বন্ধ করুন" : "রেটিং ও রিভিউ দিন"}
      </button>

      {isOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-amber-50/40 border border-amber-200/70 rounded-xl p-3.5 sm:p-4 space-y-3"
        >
          <p className="font-bold text-gray-800 text-sm">আপনার অভিজ্ঞতা শেয়ার করুন</p>

          <div className="bg-white p-3 rounded-lg border border-gray-100 space-y-2">
            <p className="text-xs font-bold text-gray-700">🏪 বিক্রেতা ও পণ্যের মান</p>
            <div className="flex gap-1">
              {STAR_LIST.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSellerRating(s)}
                  className="cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      s <= sellerRating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <input
              type="text"
              value={sellerComment}
              onChange={(e) => setSellerComment(e.target.value)}
              placeholder="পণ্য ও দোকান সম্পর্কে লিখুন (ঐচ্ছিক)..."
              className="w-full text-xs p-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-100 space-y-2">
            <p className="text-xs font-bold text-gray-700">🛵 ডেলিভারি রাইডারের সেবা</p>
            <div className="flex gap-1">
              {STAR_LIST.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRiderRating(s)}
                  className="cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      s <= riderRating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <input
              type="text"
              value={riderComment}
              onChange={(e) => setRiderComment(e.target.value)}
              placeholder="ডেলিভারি সেবা সম্পর্কে লিখুন (ঐচ্ছিক)..."
              className="w-full text-xs p-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer disabled:opacity-60"
          >
            {submitting ? "জমা হচ্ছে..." : "রেটিং জমা দিন"}
          </button>
        </form>
      )}
    </div>
  );
}
