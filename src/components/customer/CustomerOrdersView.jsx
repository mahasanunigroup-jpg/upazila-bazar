"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, FileText, Star, CheckCircle } from "lucide-react";

export default function CustomerOrdersView({ orders = [] }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [sellerRating, setSellerRating] = useState(5);
  const [sellerComment, setSellerComment] = useState("");
  const [riderRating, setRiderRating] = useState(5);
  const [riderComment, setRiderComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getStepNumber = (order) => {
    const d = (order.deliveryStatus || "").toLowerCase();
    const s = (order.status || "").toLowerCase();
    if (d === "delivered" || s === "delivered") return 4;
    if (d === "picked_up" || d === "on_the_way" || s === "shipped") return 3;
    if (d === "assigned" || s === "processing" || s === "confirmed") return 2;
    return 1;
  };

  // আপনার পুরনো ফিডব্যাক API-এর সাথে ম্যাচ করা সাবমিট ফাংশন
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewOrder) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: reviewOrder.orderId, // ডাটাবেজের আসল 'UB-XXXXXX' পাঠানো হচ্ছে
          sellerRating,
          sellerComment,
          riderRating,
          riderComment,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviewOrder(null);
        setSellerComment("");
        setRiderComment("");
        router.refresh();
      } else {
        alert(data.error || data.message || "সমস্যা হয়েছে!");
      }
    } catch (err) {
      alert("সার্ভারে সংযোগ দেওয়া যাচ্ছে না!");
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = [
    { num: 1, label: "পেন্ডিং" },
    { num: 2, label: "গৃহীত" },
    { num: 3, label: "পাঠানো হয়েছে" },
    { num: 4, label: "ডেলিভার্ড" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6">
        আমার অর্ডার সমূহ (উপজেলা বাজার)
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-gray-200 text-center text-gray-500">
          আপনার কোনো অর্ডার পাওয়া যায়নি।
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const currentStep = getStepNumber(order);
            const isExpanded = expandedId === order._id;
            const isDelivered = currentStep === 4;
            const isReviewed = order.feedback?.isSubmitted;

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-300 shadow-xs overflow-hidden"
              >
                {/* উপরের অংশ: অর্ডার আইডি ও তারিখ */}
                <div className="p-4 sm:p-5 flex justify-between items-start border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">অর্ডার আইডি</p>
                    <p className="font-bold text-emerald-700 text-sm sm:text-base">
                      {order.orderId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">অর্ডারের তারিখ</p>
                    <p className="font-semibold text-gray-800 text-xs sm:text-sm">
                      {new Date(order.createdAt).toLocaleDateString("bn-BD", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* ৪ ধাপের ট্র্যাকিং স্টেপার */}
                <div className="px-4 sm:px-8 py-5 border-b border-gray-100">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {stepLabels.map((st) => {
                      const active = currentStep >= st.num;
                      return (
                        <div key={st.num} className="flex flex-col items-center">
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                              active
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {st.num}
                          </div>
                          <span
                            className={`text-[11px] sm:text-xs font-medium ${
                              active ? "text-emerald-700 font-semibold" : "text-gray-500"
                            }`}
                          >
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* মাঝের অংশ: আইটেম সমূহ ও পেমেন্ট পদ্ধতি */}
                <div className="p-4 sm:p-5 bg-gray-50/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <p className="font-bold text-gray-800 mb-2">আইটেম সমূহ:</p>
                    <div className="space-y-1">
                      {(order.items || []).map((item, i) => (
                        <div key={item._id || i} className="flex justify-between text-gray-700">
                          <span>
                            {item.name} ({item.qty} টি)
                          </span>
                          <span className="font-medium">৳{item.price * item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="sm:text-right flex flex-col justify-between">
                    <div>
                      <p className="font-bold text-gray-800">পেমেন্ট পদ্ধতি:</p>
                      <p className="text-gray-600">{order.payment_method || "Cash on Delivery"}</p>
                    </div>
                    <p className="font-bold text-gray-900 text-base sm:text-lg mt-3">
                      সর্বমোট মূল্য: ৳{order.total_amount}
                    </p>
                  </div>
                </div>

                {/* নিচের অ্যাকশন বার (বিস্তারিত + রিভিউ + ইনভয়েস) */}
                <div className="p-3 sm:p-4 bg-white border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : order._id)}
                    className="flex-1 min-w-[200px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs sm:text-sm py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>রাইডার ও বিক্রেতার বিস্তারিত দেখুন</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* ডান পাশের রিভিউ ও ইনভয়েস বাটনসমূহ */}
                  <div className="flex items-center gap-2 ml-auto">
                    {isDelivered && !isReviewed && (
                      <button
                        type="button"
                        onClick={() => setReviewOrder(order)}
                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-2 rounded-lg inline-flex items-center gap-1 shadow-xs transition cursor-pointer whitespace-nowrap"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>রিভিউ দিন</span>
                      </button>
                    )}

                    {isReviewed && (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 whitespace-nowrap">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>রিভিউ সম্পন্ন</span>
                      </span>
                    )}

                    <Link
                      href={`/invoice/${order._id}`}
                      target="_blank"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg inline-flex items-center gap-1 shadow-xs transition whitespace-nowrap"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>ইনভয়েস</span>
                    </Link>
                  </div>
                </div>

                {/* এক্সপ্যান্ডেড বিস্তারিত অংশ */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 py-3.5 bg-gray-50 border-t border-gray-200 text-xs sm:text-sm space-y-2">
                    <p>
                      <span className="font-semibold text-gray-700">ডেলিভারি ঠিকানা:</span>{" "}
                      {order.customer_address}, {order.upazila}, {order.district}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">বিক্রেতা:</span>{" "}
                      {[...new Set((order.items || []).map((i) => i.shopName))].join(", ") || "উপজেলা ভেরিফায়েড স্টোর"}
                    </p>
                    {order.rider ? (
                      <p>
                        <span className="font-semibold text-gray-700">ডেলিভারি রাইডার:</span>{" "}
                        {order.rider.name} ({order.rider.phone})
                      </p>
                    ) : (
                      <p className="text-amber-700">এখনো কোনো রাইডার অ্যাসাইন করা হয়নি।</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* সেলার ও রাইডার রিভিউ দেওয়ার পপ-আপ মডাল */}
      {reviewOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
              সেলার ও রাইডারকে রেটিং দিন (#{reviewOrder.orderId})
            </h3>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  সেলার ও পণ্যের মান (১ - ৫ স্টার)
                </label>
                <select
                  value={sellerRating}
                  onChange={(e) => setSellerRating(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (৫ - অসাধারণ)</option>
                  <option value={4}>⭐⭐⭐⭐ (৪ - ভালো)</option>
                  <option value={3}>⭐⭐⭐ (৩ - মোটামুটি)</option>
                  <option value={2}>⭐⭐ (২ - খারাপ)</option>
                  <option value={1}>⭐ (১ - খুবই খারাপ)</option>
                </select>
                <input
                  type="text"
                  value={sellerComment}
                  onChange={(e) => setSellerComment(e.target.value)}
                  placeholder="পণ্য সম্পর্কে আপনার মন্তব্য লিখুন..."
                  className="w-full border border-gray-300 rounded-lg p-2 mt-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  রাইডারের ব্যবহার ও ডেলিভারি (১ - ৫ স্টার)
                </label>
                <select
                  value={riderRating}
                  onChange={(e) => setRiderRating(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (৫ - অসাধারণ)</option>
                  <option value={4}>⭐⭐⭐⭐ (৪ - ভালো)</option>
                  <option value={3}>⭐⭐⭐ (৩ - মোটামুটি)</option>
                  <option value={2}>⭐⭐ (২ - খারাপ)</option>
                  <option value={1}>⭐ (১ - খুবই খারাপ)</option>
                </select>
                <input
                  type="text"
                  value={riderComment}
                  onChange={(e) => setRiderComment(e.target.value)}
                  placeholder="রাইডার সম্পর্কে মন্তব্য লিখুন..."
                  className="w-full border border-gray-300 rounded-lg p-2 mt-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewOrder(null)}
                  className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  {submitting ? "সেভ হচ্ছে..." : "রিভিউ জমা দিন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
