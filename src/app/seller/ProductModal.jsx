// /src/app/seller/ProductModal.jsx
"use client";

export default function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  productData,
  setProductData,
  title,
  buttonText,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              প্রোডাক্টের নাম (Title)
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded text-sm text-gray-800"
              value={productData.title || ""}
              onChange={(e) =>
                setProductData({ ...productData, title: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              ক্যাটাগরি
            </label>
            <select
              className="w-full p-2 border rounded text-sm bg-white text-gray-800"
              value={productData.category || "সবজি"}
              onChange={(e) =>
                setProductData({ ...productData, category: e.target.value })
              }
            >
              <option value="সবজি">সবজি</option>
              <option value="ফলমূল">ফলমূল</option>
              <option value="চাল/ডাল">চাল/ডাল</option>
              <option value="medicine">medicine</option>
              <option value="অন্যান্য">অন্যান্য</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              স্টক পরিমাণ
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded text-sm text-gray-800"
              value={productData.stock ?? ""}
              onChange={(e) =>
                setProductData({
                  ...productData,
                  stock: Number(e.target.value),
                })
              }
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              মূল্য (৳)
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded text-sm text-gray-800"
              value={productData.price ?? ""}
              onChange={(e) =>
                setProductData({
                  ...productData,
                  price: Number(e.target.value),
                })
              }
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-xs font-medium text-gray-600"
            >
              বাতিল করুন
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 transition"
            >
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
