"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, User, Phone, MapPin, CreditCard, Loader2, Trash2, ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });

  // ব্রাউজারের localStorage থেকে আসল কার্ট ডাটা লোড করা
   useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("upazila_cart") || "[]");
    setCartItems(savedCart);

    // কাস্টমারের সিলেক্ট করা ৪-স্তরের লোকেশন ঠিকানায় অটো-ফিল করা
    const savedLoc = JSON.parse(localStorage.getItem("upazila_full_location") || "null");
    if (savedLoc) {
      const fullAddress = [savedLoc.moholla, savedLoc.union, savedLoc.upazila, savedLoc.district]
        .filter(Boolean)
        .join(", ");
      if (fullAddress) {
        setFormData((prev) => ({ ...prev, address: fullAddress }));
      }
    }
  }, []);


  // কার্ট থেকে কোনো আইটেম মুছে ফেলা
  const handleRemoveItem = (id) => {
    const updatedCart = cartItems.filter((item) => item._id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("upazila_cart", JSON.stringify(updatedCart));
  };

  const subTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = cartItems.length > 0 ? 60 : 0;
  const totalAmount = subTotal + deliveryCharge;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert("আপনার কার্ট খালি!");

    setLoading(true);
    try {
      // localStorage থেকে সিলেক্ট করা জেলা ও উপজেলা বের করা
      const savedLoc = JSON.parse(localStorage.getItem("upazila_full_location") || "null");

      const orderPayload = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_address: formData.address,
        district: savedLoc?.district || "কিশোরগঞ্জ",
        upazila: savedLoc?.upazila || "ভৈরব",
        payment_method: "Cash on Delivery",
        items: cartItems,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.removeItem("upazila_cart"); // কার্ট খালি করা
        alert(`ধন্যবাদ! আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে। অর্ডার আইডি: ${data.order.orderId}`);
        router.push("/orders"); // কাস্টমারের অর্ডার হিস্ট্রি পেজে নিয়ে যাবে
      } else {
        alert(data.error || "অর্ডার করতে সমস্যা হয়েছে!");
      }
    } catch (error) {
      alert("নেটওয়ার্ক সমস্যা হয়েছে! আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto mb-6">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-600 hover:text-green-600">
          <ArrowLeft className="w-4 h-4 mr-1" /> আরও কেনাকাটা করুন
        </Link>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ডেলিভারি ফর্ম */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4">
            <MapPin className="w-5 h-5 text-green-600" /> ডেলিভারি তথ্য
          </h2>
          <form onSubmit={handleOrderSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <User className="w-4 h-4 text-gray-400" /> নাম
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="উদাঃ আব্দুর রহমান"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <Phone className="w-4 h-4 text-gray-400" /> মোবাইল নাম্বার
              </label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="উদাঃ 017XXXXXXXX"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" /> সম্পূর্ণ ঠিকানা
              </label>
              <textarea
                name="address"
                required
                rows="3"
                placeholder="গ্রাম, ইউনিয়ন, জেলা"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || cartItems.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md disabled:bg-gray-300"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "অর্ডার নিশ্চিত করুন (ক্যাশ অন ডেলিভারি)"}
            </button>
          </form>
        </div>

        {/* রিয়েল অর্ডার সামারি */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit space-y-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4">
            <ShoppingCart className="w-5 h-5 text-green-600" /> আপনার কার্ট ({cartItems.length} টি পণ্য)
          </h2>

          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500 py-6 text-sm">আপনার কার্টে কোনো পণ্য নেই।</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <div key={item._id} className="py-3 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-semibold text-gray-700">{item.title}</p>
                    <p className="text-gray-500 text-xs">
                      {item.quantity} টি × {item.price} টাকা
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-700">{item.price * item.quantity} টাকা</span>
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="text-red-400 hover:text-red-600 p-1"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-xl space-y-2.5 text-sm border border-gray-100">
            <div className="flex justify-between text-gray-600">
              <span>উপমোট</span>
              <span>{subTotal} টাকা</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>ডেলিভারি চার্জ</span>
              <span>{deliveryCharge} টাকা</span>
            </div>
            <div className="border-t border-gray-200 pt-2.5 flex justify-between font-bold text-base text-gray-800">
              <span>সর্বমোট</span>
              <span className="text-green-600">{totalAmount} টাকা</span>
            </div>
          </div>

          <div className="border border-green-100 bg-green-50/50 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-green-800">
            <CreditCard className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <p>
              <strong>পেমেন্ট পদ্ধতি:</strong> বর্তমানে শুধুমাত্র <strong>ক্যাশ অন ডেলিভারি</strong> সুবিধা উপলব্ধ রয়েছে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
