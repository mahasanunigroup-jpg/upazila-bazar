"use client";

import React, { useState, useEffect } from "react";
import { BD_LOCATIONS } from "@/data/bdLocations";
import { PlusCircle, Loader2, CheckCircle, Plus } from "lucide-react";
import ProductItemCard from "@/components/ProductItemCard";
import SellerShopInfoBox from "@/components/seller/SellerShopInfoBox";
import { uploadSellerProducts } from "@/lib/uploadSellerProducts";

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
  const [items, setItems] = useState([{ ...EMPTY_PRODUCT }]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [sellerInfo, setSellerInfo] = useState({
    sellerId: "",
    shopName: "",
    sellerName: "",
    district: "কিশোরগঞ্জ",
    upazila: "ভৈরব",
    union: "",
    moholla: "",
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const storedUser = JSON.parse(
          localStorage.getItem("upazila_user") ||
            localStorage.getItem("user") ||
            "null",
        );
        const storedLoc = JSON.parse(
          localStorage.getItem("upazila_full_location") || "null",
        );

        if (storedUser || storedLoc) {
          setSellerInfo((prev) => ({
            ...prev,
            sellerId: storedUser?._id || storedUser?.id || prev.sellerId,
            shopName: storedUser?.shopName || prev.shopName,
            sellerName: storedUser?.name || prev.sellerName,
            district:
              storedUser?.district || storedLoc?.district || prev.district,
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

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
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
          : item,
      ),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (let i = 0; i < items.length; i++) {
      if (!items[i].imageFile && !items[i].existingImage) {
        alert(
          `পণ্য #${i + 1} (${items[i].title || "নামহীন"})-এর ছবি সিলেক্ট করুন`,
        );
        return;
      }
    }

    setLoading(true);
    setSuccess("");
    try {
      const count = await uploadSellerProducts({
        items,
        sellerInfo,
        onProgress: setUploadProgress,
      });
      setSuccess(`সফলভাবে ${count}টি পণ্য আপলোড হয়েছে!`);
      setItems([{ ...EMPTY_PRODUCT }]);
      setActiveIndex(0);
    } catch (err) {
      alert(err.message || "আপলোড ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-4 sm:p-6 rounded-2xl shadow-2xs border border-gray-100">
      <div className="flex items-center justify-between gap-1.5 pb-3 mb-4 border-b border-gray-100">
        <h2 className="text-sm min-[380px]:text-base sm:text-xl font-extrabold text-gray-800 flex items-center gap-1.5 min-w-0">
          <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
          <span className="truncate">নতুন পণ্য যোগ করুন</span>
        </h2>
        <span className="text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
          {items.length} টি পণ্য
        </span>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs sm:text-sm font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <SellerShopInfoBox
          sellerInfo={sellerInfo}
          setSellerInfo={setSellerInfo}
          districts={districts}
          upazilas={upazilas}
          unions={unions}
        />

        <div className="space-y-3">
          {items.map((item, index) => (
            <ProductItemCard
              key={index}
              item={item}
              index={index}
              total={items.length}
              isCollapsed={activeIndex !== index}
              onToggleCollapse={(idx) =>
                setActiveIndex((prev) => (prev === idx ? -1 : idx))
              }
              suggestions={suggestions}
              extraCategories={extraCategories}
              onChange={handleItemChange}
              onSelectSuggestion={handleSelectSuggestion}
              onRemove={(idx) => {
                if (items.length <= 1) return;
                setItems((prev) => prev.filter((_, i) => i !== idx));
                setActiveIndex(0);
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setItems((prev) => {
              const next = [...prev, { ...EMPTY_PRODUCT }];
              setActiveIndex(next.length - 1);
              return next;
            });
          }}
          className="w-full border-2 border-dashed border-green-400 hover:border-green-600 bg-green-50/40 hover:bg-green-50 text-green-700 font-bold py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> আরও একটি পণ্য যোগ করুন
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm disabled:bg-gray-300 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
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
