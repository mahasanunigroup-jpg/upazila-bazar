"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Phone, MapPin, Loader2, ArrowLeft, Home, CheckCircle2 } from "lucide-react";
import OrderSummaryCard from "@/components/checkout/OrderSummaryCard";

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [rates, setRates] = useState({ inside: 40, outside: 60 });
  const [deliveryZone, setDeliveryZone] = useState("inside");

  const applySavedAddress = (addr, fallbackDistrict = "কিশোরগঞ্জ", fallbackUpazila = "ভৈরব") => {
    if (!addr) return;
    const formattedAddr = [
      addr.villageOrWard,
      addr.landmark ? `(${addr.landmark})` : "",
      addr.union,
      fallbackUpazila,
      fallbackDistrict,
    ]
      .filter(Boolean)
      .join(", ");

    setFormData((prev) => ({
      name: addr.receiverName || prev.name,
      phone: addr.phone || prev.phone,
      address: formattedAddr,
    }));
    setSelectedAddressId(addr._id || "");

    if (addr.union) {
      setDeliveryZone(addr.union.includes("পৌরসভা") ? "inside" : "outside");
    }
  };

  useEffect(() => {
    const initCheckoutData = async () => {
      setCartItems(JSON.parse(localStorage.getItem("upazila_cart") || "[]"));

      const savedLoc = JSON.parse(localStorage.getItem("upazila_full_location") || "null");
      if (savedLoc) {
        const fullAddress = [savedLoc.moholla, savedLoc.union, savedLoc.upazila, savedLoc.district]
          .filter(Boolean)
          .join(", ");
        if (fullAddress) setFormData((prev) => ({ ...prev, address: fullAddress }));
        if (savedLoc.union && !savedLoc.union.includes("পৌরসভা")) setDeliveryZone("outside");
      }

      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data?.settings) {
          setRates({
            inside: Number(data.settings.deliveryChargeInside ?? 40),
            outside: Number(data.settings.deliveryChargeOutside ?? 60),
          });
        }
      } catch {}

      try {
        const addrRes = await fetch("/api/customer/addresses");
        if (addrRes.ok) {
          const { customer, addresses = [] } = await addrRes.json();
          setSavedAddresses(addresses);

          const upazila = customer?.upazila || savedLoc?.upazila || "ভৈরব";
          const district = customer?.district || savedLoc?.district || "কিশোরগঞ্জ";

          if (addresses.length > 0) {
            const defaultAddr = addresses.find((a) => a.isDefault) || addresses;
            applySavedAddress(defaultAddr, district, upazila);
          } else if (customer) {
            const profileAddr = [customer.address || customer.moholla, customer.union, upazila, district]
              .filter(Boolean)
              .join(", ");
            setFormData((prev) => ({
              name: customer.name || prev.name,
              phone: customer.phone || prev.phone,
              address: profileAddr || prev.address,
            }));
            if (customer.union) {
              setDeliveryZone(customer.union.includes("পৌরসভা") ? "inside" : "outside");
            }
          }
        }
      } catch {}
    };

    initCheckoutData();
  }, []);

  const handleRemoveItem = (id) => {
    const updatedCart = cartItems.filter((item) => item._id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("upazila_cart", JSON.stringify(updatedCart));
  };

  const subTotal = Math.round(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const deliveryCharge = cartItems.length > 0 ? (deliveryZone === "inside" ? rates.inside : rates.outside) : 0;
  const totalAmount = subTotal + deliveryCharge;

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert("আপনার কার্ট খালি!");

    setLoading(true);
    try {
      const savedLoc = JSON.parse(localStorage.getItem("upazila_full_location") || "null");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: formData.address,
          district: savedLoc?.district || "কিশোরগঞ্জ",
          upazila: savedLoc?.upazila || "ভৈরব",
          delivery_charge: deliveryCharge,
          payment_method: "Cash on Delivery",
          items: cartItems,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.removeItem("upazila_cart");
        alert(`ধন্যবাদ! আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে। অর্ডার আইডি: ${data.order.orderId}`);
        router.push("/orders");
      } else {
        alert(data.error || "অর্ডার করতে সমস্যা হয়েছে!");
      }
    } catch {
      alert("নেটওয়ার্ক সমস্যা হয়েছে! আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };
   return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto mb-3 sm:mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-xs sm:text-sm font-bold text-gray-600 hover:text-green-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> আরও কেনাকাটা করুন
        </Link>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-7">
        {/* ডেলিভারি ফর্ম কার্ড */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" />
              <span>ডেলিভারি তথ্য</span>
            </h2>
            {savedAddresses.length > 0 && (
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                সেভ করা ঠিকানা
              </span>
            )}
          </div>

          {/* কাস্টমারের সেভ করা ঠিকানা বাছাইয়ের স্লিম বার */}
          {savedAddresses.length > 0 && (
            <div className="space-y-1.5 bg-gray-50 p-2.5 rounded-xl border border-gray-200/70">
              <p className="text-[11px] font-bold text-gray-600">
                সেভ করা ঠিকানা থেকে বাছুন:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id;
                  return (
                    <button
                      key={addr._id}
                      type="button"
                      onClick={() => applySavedAddress(addr)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        isSelected
                          ? "bg-green-600 text-white border-green-600 shadow-2xs"
                          : "bg-white text-gray-700 border-gray-300 hover:border-green-500"
                      }`}
                    >
                      <Home className="w-3 h-3" />
                      <span>{addr.label}</span>
                      {addr.isDefault && (
                        <CheckCircle2
                          className={`w-3 h-3 ${isSelected ? "text-white" : "text-green-600"}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <form onSubmit={handleOrderSubmit} className="space-y-3.5">
            {/* নাম ও মোবাইল নাম্বার (পাশাপাশি বা স্লিম স্ট্যাক) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-400" /> প্রাপকের নাম
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ আব্দুর রহমান"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50/60 focus:bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> মোবাইল নাম্বার
                </label>
                <input
                  type="tel"
                  required
                  placeholder="উদাঃ 017XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-50/60 focus:bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition"
                />
              </div>
            </div>

            {/* ডেলিভারি এলাকা নির্বাচন */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                ডেলিভারি এলাকা নির্বাচন করুন
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeliveryZone("inside")}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                    deliveryZone === "inside"
                      ? "border-green-600 bg-green-50/80 text-green-900 ring-1 ring-green-600"
                      : "border-gray-200 bg-gray-50/50 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <div className="text-[11px] font-medium">পৌরসভা এলাকা</div>
                    <div className="text-xs sm:text-sm font-extrabold mt-0.5">
                      ৳{rates.inside} টাকা
                    </div>
                  </div>
                  {deliveryZone === "inside" && (
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryZone("outside")}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                    deliveryZone === "outside"
                      ? "border-green-600 bg-green-50/80 text-green-900 ring-1 ring-green-600"
                      : "border-gray-200 bg-gray-50/50 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <div className="text-[11px] font-medium">ইউনিয়ন / গ্রাম</div>
                    <div className="text-xs sm:text-sm font-extrabold mt-0.5">
                      ৳{rates.outside} টাকা
                    </div>
                  </div>
                  {deliveryZone === "outside" && (
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  )}
                </button>
              </div>
            </div>

            {/* সম্পূর্ণ ঠিকানা */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> সম্পূর্ণ ঠিকানা
              </label>
              <textarea
                required
                rows="2"
                placeholder="গ্রাম/মহল্লা, ইউনিয়ন, উপজেলা"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-gray-50/60 focus:bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition resize-none"
              />
            </div>

            {/* অর্ডার সাবমিট বাটন */}
            <button
              type="submit"
              disabled={loading || cartItems.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>অর্ডার সম্পন্ন হচ্ছে...</span>
                </>
              ) : (
                <span>ক্যাশ অন ডেলিভারিতে অর্ডার করুন • ৳{totalAmount}</span>
              )}
            </button>
          </form>
        </div>

        {/* ডান পাশের অর্ডার সামারি কার্ড */}
        <OrderSummaryCard
          cartItems={cartItems}
          subTotal={subTotal}
          deliveryCharge={deliveryCharge}
          totalAmount={totalAmount}
          onRemoveItem={handleRemoveItem}
        />
      </div>
    </div>
  );
}

