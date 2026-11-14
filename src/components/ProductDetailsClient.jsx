"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductReviewSection from "@/components/ProductReviewSection";

import {
  ShoppingCart,
  Zap,
  Store,
  MapPin,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Plus,
  Minus,
} from "lucide-react";

export default function ProductDetailsClient({ product, relatedProducts }) {
  const router = useRouter();
  const images =
    product.images?.length > 0
      ? product.images
      : [product.image || "/placeholder.png"];

  const [selectedImage, setSelectedImage] = useState(images);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const isOutOfStock = (product.stock || 0) <= 0;

  const handleQtyChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > product.stock) return product.stock;
      return next;
    });
  };

  const addToCartStorage = () => {
    if (isOutOfStock) return false;

    const existingCart = JSON.parse(
      localStorage.getItem("upazila_cart") || "[]"
    );
    const existingIndex = existingCart.findIndex(
      (item) => item._id === product._id
    );

    if (existingIndex > -1) {
      const newQty = existingCart[existingIndex].quantity + quantity;
      existingCart[existingIndex].quantity = Math.min(newQty, product.stock);
    } else {
      existingCart.push({
        _id: product._id,
        title: product.title,
        price: product.price,
        image: images,
        sellerId: product.sellerId,
        shopName: product.shopName,
        quantity,
      });
    }

    localStorage.setItem("upazila_cart", JSON.stringify(existingCart));
    window.dispatchEvent(new Event("storage"));
    return true;
  };

  const handleAddToCart = () => {
    if (addToCartStorage()) {
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    }
  };

  const handleOrderNow = () => {
    if (addToCartStorage()) {
      router.push("/checkout");
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> হোম পেজে ফিরুন
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-contain"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition ${
                    selectedImage === img
                      ? "border-emerald-600"
                      : "border-gray-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full">
                {product.category}
              </span>

              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-full">
                  <XCircle className="w-3.5 h-3.5" /> স্টক শেষ
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> স্টকে আছে ({product.stock} টি)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
              {product.title}
            </h1>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-emerald-600">
                ৳{product.price.toLocaleString("bn-BD")}
              </span>
              {product.oldPrice > product.price && (
                <span className="text-base text-gray-400 line-through">
                  ৳{product.oldPrice.toLocaleString("bn-BD")}
                </span>
              )}
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <Store className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-gray-800">{product.shopName}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {product.location || "ভৈরব, কিশোরগঞ্জ"}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                ভেরিফায়েড স্টোর
              </span>
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-bold text-gray-700 mb-1.5">
                পণ্যের বিস্তারিত বিবরণ:
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description || "এই পণ্যের জন্য কোনো অতিরিক্ত বিবরণ দেওয়া হয়নি।"}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700">পরিমাণ:</span>
                <div className="inline-flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(-1)}
                    className="p-2.5 hover:bg-gray-100 text-gray-600 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 font-bold text-gray-800">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQtyChange(1)}
                    className="p-2.5 hover:bg-gray-100 text-gray-600 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="py-3.5 px-5 rounded-xl font-bold text-sm border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <ShoppingCart className="w-4 h-4" />
                {addedFeedback ? "✅ ব্যাগে যোগ হয়েছে!" : "ব্যাগে যোগ করুন"}
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleOrderNow}
                className="py-3.5 px-5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition flex items-center justify-center gap-2 disabled:bg-gray-300"
              >
                <Zap className="w-4 h-4" />
                এখনই অর্ডার করুন
              </button>
            </div>
          </div>
        </div>
      </div>
      <ProductReviewSection productId={product._id} />
      {relatedProducts?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">
            এই ক্যাটাগরির আরও পণ্য
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((item) => (
              <Link
                key={item._id}
                href={`/product/${item._id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden group"
              >
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-sm font-bold text-emerald-600 mt-1">
                    ৳{item.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
