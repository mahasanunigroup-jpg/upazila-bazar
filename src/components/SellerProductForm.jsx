"use client";

import React, { useState, useEffect } from "react";
import { BD_LOCATIONS } from "@/data/bdLocations";
import { getCategoryRules } from "@/data/productOptions";
import { PlusCircle, Loader2, CheckCircle, Store, Plus } from "lucide-react";
import { optimizeImageFile } from "@/lib/optimizeImage";
import ProductItemCard from "@/components/ProductItemCard";

const EMPTY_PRODUCT = {
  title: "",
  description: "",
  price: "",
  discountPrice: "",
  unit: "কেজি (kg)",
  packagingType: "📦 প্যাকেটজাত",
  category: "",
  smartField1: "",
  smartField2: "",
  prescriptionRequired: false,
  isCustomCategory: false,
  imageFile: null,
  existingImage: "",
};

export default function SellerProductForm() {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [success, setSuccess] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [extraCategories, setExtraCategories] = useState([]);

  const [sellerInfo, setSellerInfo] = useState({
    sellerId: "",
    shopName: "",
    sellerName: "",
    district: "কিশোরগঞ্জ",
    upazila: "ভৈরব",
    union: "",
    moholla: "",
  });

  const [items, setItems] = useState([{ ...EMPTY_PRODUCT }]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const storedUser = JSON.parse(
          localStorage.getItem("upazila_user") || localStorage.getItem("user") || "null"
        );
        const storedLoc = JSON.parse(
          localStorage.getItem("upazila_full_location") || "null"
        );

        if (storedUser || storedLoc) {
          setSellerInfo((prev) => ({
            ...prev,
            sellerId: storedUser?._id || storedUser?.id || prev.sellerId,
            shopName: storedUser?.shopName || prev.shopName,
            sellerName: storedUser?.name || prev.sellerName,
            district: storedUser?.district || storedLoc?.district || prev.district,
            upazila: storedUser?.upazila || storedLoc?.upazila || prev.upazila,
            union: storedUser?.union || storedLoc?.union || prev.union,
            moholla:
              storedUser?.marketName ||
              storedUser?.moholla ||
              storedLoc?.moholla ||
              prev.moholla,
          }));
        }

        const [meRes, sugRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/products/suggestions"),
        ]);

        if (meRes.ok) {
          const data = await meRes.json();
          const u = data.user || data;
          if (u && (u.name || u.shopName)) {
            setSellerInfo((prev) => ({
              ...prev,
              sellerId: u._id || u.id || prev.sellerId,
              shopName: u.shopName || prev.shopName,
              sellerName: u.name || prev.sellerName,
              district: u.district || prev.district,
              upazila: u.upazila || prev.upazila,
              union: u.union || prev.union,
              moholla: u.marketName || u.moholla || prev.moholla,
            }));
          }
        }

        if (sugRes.ok) {
          const sugData = await sugRes.json();
          setSuggestions(sugData.suggestions || []);
          setExtraCategories(sugData.categories || []);
        }
      } catch (err) {
        console.error("Seller auto-fill error:", err);
      }
    };

    loadInitialData();
  }, []);

  const districts = Object.keys(BD_LOCATIONS);
  const upazilas =
    sellerInfo.district && BD_LOCATIONS[sellerInfo.district]
      ? Object.keys(BD_LOCATIONS[sellerInfo.district])
      : [];
  const unions =
    sellerInfo.district &&
    sellerInfo.upazila &&
    BD_LOCATIONS[sellerInfo.district]?.[sellerInfo.upazila]
      ? BD_LOCATIONS[sellerInfo.district][sellerInfo.upazila]
      : [];

  const handleSellerChange = (e) => {
    setSellerInfo({ ...sellerInfo, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSelectSuggestion = (index, sug) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              title: sug.title,
              existingImage: sug.image || "",
              smartField1: sug.field1 || item.smartField1 || "",
              smartField2: sug.field2 || item.smartField2 || "",
              imageFile: null,
            }
          : item
      )
    );
  };

  const handleAddMoreAndCollapsePrev = () => {
    setItems((prev) => {
      const next = [...prev, { ...EMPTY_PRODUCT }];
      setActiveIndex(next.length - 1);
      return next;
    });
  };

  const handleToggleCollapse = (index) => {
    setActiveIndex((prev) => (prev === index ? -1 : index));
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
    setActiveIndex(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (let i = 0; i < items.length; i++) {
      if (!items[i].imageFile && !items[i].existingImage) {
        alert(`পণ্য #${i + 1} (${items[i].title || "নামহীন"})-এর ছবি সিলেক্ট করুন`);
        return;
      }
    }

    setLoading(true);
    setSuccess("");
    let uploadedCount = 0;

    const bnToEn = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
    const parseCleanNum = (val) =>
      String(val || "").replace(/[০-৯]/g, (d) => bnToEn[d]).replace(/[^0-9.]/g, "");

    try {
      for (let i = 0; i < items.length; i++) {
        const current = items[i];
        setUploadProgress(`পণ্য ${i + 1} / ${items.length} আপলোড হচ্ছে...`);

        const data = new FormData();
        Object.keys(sellerInfo).forEach((key) => {
          if (sellerInfo[key]) data.append(key, sellerInfo[key]);
        });

        const unitLabel = current.unit || "কেজি (kg)";
        const packLabel = current.packagingType || "প্যাকেটজাত";
        const rxTag = current.prescriptionRequired ? "📄 প্রেসক্রিপশন বাধ্যতামূলক" : "";
        const smartMeta = [
          current.smartField1?.trim(),
          current.smartField2?.trim(),
          rxTag,
        ]
          .filter(Boolean)
          .join(" • ");
        const extraInfo = smartMeta ? ` [${smartMeta}]` : "";

        const regularPrice = Number(parseCleanNum(current.price) || 0);
        const discountPrice = Number(parseCleanNum(current.discountPrice) || 0);
        const hasValidDiscount = discountPrice > 0 && discountPrice < regularPrice;
        const finalSellingPrice = hasValidDiscount ? discountPrice : regularPrice;
        const discountBadge = hasValidDiscount ? ` • 🔥 ছাড় (আগের দাম ৳${regularPrice})` : "";

        const formattedTitle = `${current.title.trim()} (প্রতি ${unitLabel})`;
        const formattedDesc = `[${packLabel} • প্রতি ${unitLabel}${discountBadge}]${extraInfo} ${current.description.trim()}`;

        const ruleKey = getCategoryRules(current.category).key;
        if (current.smartField1?.trim()) {
          const prev1 = JSON.parse(localStorage.getItem(`upazila_smart_${ruleKey}_f1`) || "[]");
          localStorage.setItem(
            `upazila_smart_${ruleKey}_f1`,
            JSON.stringify([...new Set([current.smartField1.trim(), ...prev1])])
          );
        }
        if (current.smartField2?.trim()) {
          const prev2 = JSON.parse(localStorage.getItem(`upazila_smart_${ruleKey}_f2`) || "[]");
          localStorage.setItem(
            `upazila_smart_${ruleKey}_f2`,
            JSON.stringify([...new Set([current.smartField2.trim(), ...prev2])])
          );
        }

        data.append("marketName", sellerInfo.moholla);
        data.append("title", formattedTitle);
        data.append("description", formattedDesc);
        data.append("price", String(finalSellingPrice));
        if (hasValidDiscount) {
          data.append("originalPrice", String(regularPrice));
        }
        data.append("unit", unitLabel);
        data.append("packagingType", packLabel);
        data.append("category", current.category);
        data.append("stock", "100");

        if (current.imageFile) {
          const optimizedImage = await optimizeImageFile(current.imageFile, 1200, 0.92);
          data.append("image", optimizedImage || current.imageFile);
        } else if (current.existingImage) {
          data.append("existingImage", current.existingImage);
        }

        const res = await fetch("/api/products/seller/upload-image", {
          method: "POST",
          body: data,
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.message || `পণ্য #${i + 1} আপলোড করতে সমস্যা হয়েছে`);
        }
        uploadedCount++;
      }

      setSuccess(`অভিনন্দন! মোট ${uploadedCount}টি পণ্য সফলভাবে আপলোড হয়েছে।`);
      setItems([{ ...EMPTY_PRODUCT }]);
      setActiveIndex(0);
      e.target.reset();
    } catch (err) {
      alert(err.message || "সার্ভার কানেকশনে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
      setUploadProgress("");
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-green-50/60 p-4 rounded-xl border border-green-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-green-800 flex items-center gap-1.5">
              <Store className="w-4 h-4" /> দোকান ও বাজারের তথ্য (অটোমেটিক)
            </h3>
            <span className="text-[11px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium">
              প্রোফাইল থেকে সংযুক্ত
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">দোকানের নাম</label>
              <input
                type="text"
                name="shopName"
                required
                placeholder="উদাঃ বিসমিল্লাহ স্টোর"
                value={sellerInfo.shopName}
                onChange={handleSellerChange}
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
                value={sellerInfo.sellerName}
                onChange={handleSellerChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">জেলা</label>
              <select
                name="district"
                value={sellerInfo.district}
                onChange={(e) =>
                  setSellerInfo({ ...sellerInfo, district: e.target.value, upazila: "", union: "" })
                }
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
                value={sellerInfo.upazila}
                onChange={(e) => setSellerInfo({ ...sellerInfo, upazila: e.target.value, union: "" })}
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
                placeholder="ইউনিয়ন..."
                value={sellerInfo.union}
                onChange={handleSellerChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
              <datalist id="seller-unions">
                {unions.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">বাজার / হাটের নাম</label>
              <input
                type="text"
                name="moholla"
                required
                placeholder="উদাঃ আমতলা বাজার"
                value={sellerInfo.moholla}
                onChange={handleSellerChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <ProductItemCard
              key={index}
              item={item}
              index={index}
              total={items.length}
              isCollapsed={activeIndex !== index}
              onToggleCollapse={handleToggleCollapse}
              suggestions={suggestions}
              extraCategories={extraCategories}
              onChange={handleItemChange}
              onSelectSuggestion={handleSelectSuggestion}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddMoreAndCollapsePrev}
          className="w-full border-2 border-dashed border-green-400 hover:border-green-600 bg-green-50/40 hover:bg-green-50 text-green-700 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-5 h-5" /> আরও একটি পণ্য যোগ করুন
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md disabled:bg-gray-300 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{uploadProgress || "আপলোড হচ্ছে..."}</span>
            </>
          ) : (
            `সবগুলো পণ্য আপলোড করুন (${items.length}টি)`
          )}
        </button>
      </form>
    </div>
  );
}
