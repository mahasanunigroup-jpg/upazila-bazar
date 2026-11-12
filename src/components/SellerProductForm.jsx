"use client";

import React, { useState } from "react";
import { BD_LOCATIONS } from "@/data/bdLocations";
import { PlusCircle, Image, Loader2, CheckCircle, Store } from "lucide-react";

export default function SellerProductForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    shopName: "",
    sellerName: "",
    district: "কিশোরগঞ্জ",
    upazila: "ভৈরব",
    union: "",
  });

  const districts = Object.keys(BD_LOCATIONS);
  const upazilas =
    formData.district && BD_LOCATIONS[formData.district]
      ? Object.keys(BD_LOCATIONS[formData.district])
      : [];
  const unions =
    formData.district &&
    formData.upazila &&
    BD_LOCATIONS[formData.district]?.[formData.upazila]
      ? BD_LOCATIONS[formData.district][formData.upazila]
      : [];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert("অনুগ্রহ করে একটি প্রোডাক্টের ছবি সিলেক্ট করুন");
      return;
    }

    setLoading(true);
    setSuccess("");

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    data.append("image", imageFile);

    try {
      const res = await fetch("/api/products/seller/upload-image", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      setLoading(false);

      if (res.ok) {
        setSuccess("অভিনন্দন! দোকানের তথ্য ও ছবিসহ নতুন পণ্যটি আপলোড হয়েছে।");
        setFormData({
          ...formData,
          title: "",
          description: "",
          price: "",
          category: "",
          stock: "",
        });
        setImageFile(null);
        e.target.reset();
      } else {
        alert(result.message || "আপলোড করতে সমস্যা হয়েছে");
      }
    } catch (err) {
      setLoading(false);
      alert("সার্ভার কানেকশনে সমস্যা হয়েছে");
    }
  };
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4">
        <PlusCircle className="w-6 h-6 text-green-600" /> নতুন পণ্য যোগ করুন
      </h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-2 text-sm font-semibold">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-green-50/60 p-4 rounded-xl border border-green-100 space-y-3">
          <h3 className="text-sm font-bold text-green-800 flex items-center gap-1.5">
            <Store className="w-4 h-4" /> দোকান ও বিক্রেতার তথ্য
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">দোকানের নাম</label>
              <input
                type="text"
                name="shopName"
                required
                placeholder="উদাঃ বিসমিল্লাহ স্টোর"
                value={formData.shopName}
                onChange={handleInputChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">দোকানদারের নাম</label>
              <input
                type="text"
                name="sellerName"
                required
                placeholder="উদাঃ মোঃ আব্দুল করিম"
                value={formData.sellerName}
                onChange={handleInputChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">জেলা</label>
              <select
                name="district"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value, upazila: "", union: "" })}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
              >
                {districts.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">উপজেলা</label>
              <select
                name="upazila"
                required
                value={formData.upazila}
                onChange={(e) => setFormData({ ...formData, upazila: e.target.value, union: "" })}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">নির্বাচন করুন</option>
                {upazilas.map((upz) => (
                  <option key={upz} value={upz}>{upz}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ইউনিয়ন / এলাকা</label>
              <input
                list="seller-unions"
                name="union"
                placeholder="ইউনিয়ন লিখুন..."
                value={formData.union}
                onChange={handleInputChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
              <datalist id="seller-unions">
                {unions.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">পণ্যের নাম</label>
          <input
            type="text"
            name="title"
            required
            placeholder="উদাঃ খাঁটি সরিষার তেল (১ লিটার)"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">মূল্য (টাকা)</label>
            <input
              type="number"
              name="price"
              required
              placeholder="উদাঃ ২২০"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">স্টক পরিমাণ</label>
            <input
              type="number"
              name="stock"
              placeholder="উদাঃ ২৫"
              value={formData.stock}
              onChange={handleInputChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">ক্যাটাগরি</label>
          <select
            name="category"
            required
            value={formData.category}
            onChange={handleInputChange}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">ক্যাটাগরি নির্বাচন করুন</option>
            <option value="মুদি">মুদি বাজার</option>
            <option value="চাল ও ডাল">চাল ও ডাল</option>
            <option value="ভোজ্য তেল">ভোজ্য তেল</option>
            <option value="সবজি">তাজা শাক-সবজি</option>
            <option value="নিত্যদিনের সবজি">নিত্যদিনের সবজি</option>
            <option value="আলু, পেঁয়াজ ও রসুন">আলু, পেঁয়াজ ও রসুন</option>
            <option value="ফল">দেশী ফলমূল</option>
            <option value="মাছ ও মাংস">মাছ ও মাংস</option>
            <option value="দুগ্ধ">দুধ ও ডিম</option>
            <option value="মসলা">মসলাপাতি</option>
            <option value="স্ন্যাকস">বেকারি ও স্ন্যাকস</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">পণ্যের বিবরণ</label>
          <textarea
            name="description"
            required
            rows="3"
            placeholder="পণ্যের গুণগত মান বা বিবরণ লিখুন..."
            value={formData.description}
            onChange={handleInputChange}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
            <Image className="w-4 h-4 text-gray-400" /> পণ্যের ছবি আপলোড
          </label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md disabled:bg-gray-300"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "পণ্যটি আপলোড করুন"}
        </button>
      </form>
    </div>
  );
}
