"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle2, MessageSquare, Send } from "lucide-react";

export default function ProductReviewSection({ productId, onStatsLoaded }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews || []);
        const nextStats = {
          averageRating: data.averageRating || 0,
          totalReviews: data.totalReviews || 0,
        };
        setStats(nextStats);
        if (onStatsLoaded) onStatsLoaded(nextStats);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return alert("অনুগ্রহ করে আপনার মতামত লিখুন!");

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "রিভিউ জমা দেওয়া যায়নি");
        return;
      }

      setComment("");
      setRating(5);
      await fetchReviews();
      alert(data.message);
    } catch {
      alert("নেটওয়ার্ক সমস্যা হয়েছে!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8 space-y-8">
      {/* হেডার ও গড় রেটিং */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            ক্রেতাদের মতামত ও রিভিউ ({stats.totalReviews})
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            পণ্যটি ব্যবহারের পর আপনার অভিজ্ঞতা শেয়ার করুন
          </p>
        </div>

        <div className="flex items-center gap-3 bg-amber-50/70 px-4 py-2.5 rounded-xl border border-amber-100">
          <span className="text-2xl font-extrabold text-amber-600">
            {stats.averageRating > 0 ? stats.averageRating : "০.০"}
          </span>
          <div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(stats.averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              মোট {stats.totalReviews} টি রেটিং
            </p>
          </div>
        </div>
      </div>

      {/* রিভিউ লেখার ফর্ম */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-100 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">
            আপনার রেটিং দিন:
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-0.5 transition transform hover:scale-110"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= (hoverRating || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-xs font-semibold text-amber-700">
              ({hoverRating || rating} স্টার)
            </span>
          </div>
        </div>

        <div>
          <textarea
            rows={3}
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="পণ্যটির মান, প্যাকেজিং বা ডেলিভারি কেমন লেগেছে তা লিখুন..."
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {submitting ? "জমা হচ্ছে..." : "রিভিউ জমা দিন"}
        </button>
      </form>

      {/* রিভিউ লিস্ট */}
      {loading ? (
        <p className="text-center text-sm text-gray-400 py-4">
          রিভিউ লোড হচ্ছে...
        </p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-sm text-gray-500 py-6">
          এখনো কোনো রিভিউ নেই। প্রথম রিভিউটি আপনিই দিন!
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {reviews.map((rev) => (
            <div key={rev._id} className="py-4 space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                    {rev.userName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">
                        {rev.userName}
                      </span>
                      {rev.isVerifiedBuyer && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> ভেরিফায়েড ক্রেতা
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <span className="text-xs text-gray-400">
                  {new Date(rev.createdAt).toLocaleDateString("bn-BD", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <p className="text-sm text-gray-600 pl-10 leading-relaxed">
                {rev.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
