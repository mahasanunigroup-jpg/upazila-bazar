"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Truck,
  Store,
  Phone,
  MapPin,
  Star,
  CheckCircle2,
  FileText,
} from "lucide-react";

const STAR_LIST = Array.from({ length: 5 }, (_, i) => i + 1);

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const [ratingOrderId, setRatingOrderId] = useState(null);
  const [sellerRating, setSellerRating] = useState(5);
  const [sellerComment, setSellerComment] = useState("");
  const [riderRating, setRiderRating] = useState(5);
  const [riderComment, setRiderComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const getStatusStep = (status) => {
    const normalizedStatus = status === "processing" ? "accepted" : status;
    const steps = ["pending", "accepted", "shipped", "delivered"];
    const idx = steps.indexOf(normalizedStatus);
    return idx === -1 ? 0 : idx;
  };

  const toggleDetails = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const openRatingForm = (orderId) => {
    if (ratingOrderId === orderId) {
      setRatingOrderId(null);
    } else {
      setRatingOrderId(orderId);
      setSellerRating(5);
      setSellerComment("");
      setRiderRating(5);
      setRiderComment("");
    }
  };

  const handleFeedbackSubmit = async (orderId) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
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
        const savedFeedback = data.feedback || {
          isSubmitted: true,
          sellerRating: Number(sellerRating),
          sellerComment,
          riderRating: Number(riderRating),
          riderComment,
        };

        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, feedback: savedFeedback } : o
          )
        );
        setRatingOrderId(null);
        alert("ধন্যবাদ! আপনার রেটিং সফলভাবে জমা হয়েছে।");
      }
    } catch (error) {
      alert("সার্ভারে সমস্যা হয়েছে!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="h-64 bg-white rounded-xl border p-6"></div>
        <div className="h-64 bg-white rounded-xl border p-6"></div>
      </div>
    );
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">
        আমার অর্ডার সমূহ (উপজেলা বাজার)
      </h1>
      {orders.map((order) => {
        const currentStep = getStatusStep(order.status);
        const isExpanded = expandedOrderId === order.id;
        const isDelivered = order.status === "delivered";
        const hasFeedback = order.feedback?.isSubmitted;

        return (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-6"
          >
            <div className="flex justify-between border-b pb-4 mb-6 text-sm text-gray-600">
              <div>
                <p>অর্ডার আইডি</p>
                <p className="font-bold text-emerald-600 text-base">
                  {order.id}
                </p>
              </div>
              <div className="text-right">
                <p>অর্ডারের তারিখ</p>
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {order.date}
                </p>
              </div>
            </div>

            {/* স্টেপার */}
            <div className="mb-8 relative flex items-center justify-between w-full px-2">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 -z-0">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
              {["পেন্ডিং", "গৃহীত", "পাঠানো হয়েছে", "ডেলিভার্ড"].map(
                (label, idx) => (
                  <div
                    key={idx}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        currentStep >= idx
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <p className="text-[11px] sm:text-xs mt-2 font-medium text-gray-600">
                      {label}
                    </p>
                  </div>
                )
              )}
            </div>

            {/* আইটেম ও পেমেন্ট */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">আইটেম সমূহ:</h3>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-0.5">
                    <span>
                      {item.name} ({item.qty})
                    </span>
                    <span className="font-medium text-gray-800">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
              <div className="md:text-right flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">
                    পেমেন্ট পদ্ধতি:
                  </h3>
                  <p>{order.paymentMethod}</p>
                </div>
                <div className="mt-3 text-base">
                  সর্বমোট মূল্য:{" "}
                  <span className="text-xl font-bold text-gray-900">
                    {order.total}
                  </span>
                </div>
              </div>
            </div>

            {/* রাইডার ও সেলার বিস্তারিত + রেটিং + ইনভয়েস বাটন সেকশন */}
            <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => toggleDetails(order.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/80 py-2.5 px-4 rounded-lg transition cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      বিস্তারিত তথ্য বন্ধ করুন <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      রাইডার ও বিক্রেতার বিস্তারিত দেখুন{" "}
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>

                {!hasFeedback && (
                  <button
                    onClick={() => openRatingForm(order.id)}
                    className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 py-2.5 px-4 rounded-lg transition cursor-pointer"
                  >
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    {ratingOrderId === order.id
                      ? "ফর্ম বন্ধ করুন"
                      : "সেলার ও রাইডারকে রেটিং দিন"}
                  </button>
                )}

                {/* অফিশিয়াল ইনভয়েস ডাউনলোড বাটন */}
                <Link
                  href={`/invoice/${order._id || order.id}`}
                  target="_blank"
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 py-2.5 px-4 rounded-lg transition shadow-xs whitespace-nowrap"
                >
                  <FileText className="w-4 h-4" />
                  <span>অফিশিয়াল ইনভয়েস</span>
                </Link>
              </div>
              {hasFeedback && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-800">
                  <span className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> আপনার
                    মূল্যবান ফিডব্যাক জমা হয়েছে:
                  </span>
                  <div className="flex items-center gap-4 font-bold">
                    <span>🏪 সেলার: {order.feedback.sellerRating}★</span>
                    <span>🛵 রাইডার: {order.feedback.riderRating}★</span>
                  </div>
                </div>
              )}

              {ratingOrderId === order.id && !hasFeedback && (
                <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 space-y-4 text-xs">
                  <h4 className="font-bold text-gray-800 text-sm">
                    আপনার অভিজ্ঞতা শেয়ার করুন
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3.5 rounded-lg border border-gray-200 space-y-2">
                      <p className="font-bold text-gray-800 flex items-center gap-1.5">
                        <Store className="w-4 h-4 text-emerald-600" /> বিক্রেতা ও
                        পণ্যের মান
                      </p>
                      <div className="flex items-center gap-1">
                        {STAR_LIST.map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setSellerRating(star)}
                            className="p-0.5 cursor-pointer"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= sellerRating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
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
                        className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-gray-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-gray-200 space-y-2">
                      <p className="font-bold text-gray-800 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-emerald-600" /> ডেলিভারি
                        রাইডার সার্ভিস
                      </p>
                      <div className="flex items-center gap-1">
                        {STAR_LIST.map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRiderRating(star)}
                            className="p-0.5 cursor-pointer"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= riderRating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={riderComment}
                        onChange={(e) => setRiderComment(e.target.value)}
                        placeholder="রাইডারের ব্যবহার ও ডেলিভারি নিয়ে লিখুন (ঐচ্ছিক)..."
                        className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-gray-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      disabled={submitting}
                      onClick={() => handleFeedbackSubmit(order.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-lg transition cursor-pointer"
                    >
                      {submitting ? "জমা হচ্ছে..." : "ফিডব্যাক জমা দিন"}
                    </button>
                  </div>
                </div>
              )}

              {/* ক্লিক করলে নিচে রাইডার ও সেলারের তথ্য দেখাবে */}
                           {/* ক্লিক করলে নিচে রাইডার ও সেলারের তথ্য দেখাবে */}
                        {/* ক্লিক করলে নিচে রাইডার ও সেলারের তথ্য দেখাবে */}
              {isExpanded && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-emerald-50/30 p-4 rounded-xl border border-emerald-100">
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 mb-2 text-sm">
                      <Truck className="w-4 h-4 text-emerald-600" /> ডেলিভারি
                      রাইডার
                    </h4>
                    {order.rider ? (
                      <div className="space-y-1 text-gray-600">
                        <p>
                          <span className="font-semibold text-gray-800">
                            নাম:
                          </span>{" "}
                          {order.rider.name}
                        </p>
                        <p className="flex items-center gap-1">
                          <span className="font-semibold text-gray-800">
                            ফোন:
                          </span>
                          <a
                            href={`tel:${order.rider.phone}`}
                            className="text-blue-600 underline inline-flex items-center gap-0.5 font-medium"
                          >
                            <Phone className="w-3 h-3" /> {order.rider.phone}
                          </a>
                        </p>
                        {order.rider.upazila && (
                          <p>
                            <span className="font-semibold text-gray-800">
                              এলাকা:
                            </span>{" "}
                            {order.rider.upazila}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-amber-700">
                        এখনো কোনো রাইডার অ্যাসাইন করা হয়নি।
                      </p>
                    )}
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 mb-2 text-sm">
                      <Store className="w-4 h-4 text-emerald-600" /> বিক্রেতা ও
                      ডেলিভারি ঠিকানা
                    </h4>
                    <div className="space-y-1 text-gray-600">
                      <p>
                        <span className="font-semibold text-gray-800">
                          দোকান:
                        </span>{" "}
                        {order.shopNames ||
                          [
                            ...new Set(
                              (order.items || [])
                                .map((i) => i.shopName)
                                .filter(Boolean)
                            ),
                          ].join(", ") ||
                          "উপজেলা ভেরিফায়েড স্টোর"}
                      </p>
                      <p className="flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          {order.address ||
                            [
                              order.customer_address,
                              order.upazila,
                              order.district,
                            ]
                              .filter(Boolean)
                              .join(", ") ||
                            "ঠিকানা উল্লেখ নেই"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })}
    </div>
  );
}
