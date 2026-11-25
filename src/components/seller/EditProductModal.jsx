"use client";

import React from "react";

export default function EditProductModal({
  editingProduct,
  setEditingProduct,
  onSubmit,
  loading,
}) {
  if (!editingProduct) return null;

  return (
    <div
      onClick={() => setEditingProduct(null)}
      className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center z-50 p-3 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-xl"
      >
        <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4">
          পণ্য আপডেট করুন
        </h2>

        <form onSubmit={onSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              পণ্যের নাম
            </label>
            <input
              type="text"
              required
              value={editingProduct.title}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, title: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                রেগুলার দাম (৳)
              </label>
              <input
                type="number"
                required
                min="1"
                value={editingProduct.price}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    price: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                ডিসকাউন্ট দাম (৳)
              </label>
              <input
                type="number"
                min="0"
                value={editingProduct.discountPrice || 0}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    discountPrice: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              স্টক পরিমাণ (টি)
            </label>
            <input
              type="number"
              required
              min="0"
              value={editingProduct.stock ?? 0}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  stock: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-60 cursor-pointer"
            >
              {loading ? "সেভ হচ্ছে..." : "আপডেট সেভ করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
