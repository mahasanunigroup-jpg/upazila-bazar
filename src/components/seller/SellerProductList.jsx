"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EditProductModal from "./EditProductModal";

export default function SellerProductList({ initialProducts }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts || []);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const filteredProducts = products.filter((p) =>
    (p.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/seller/products/${editingProduct._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingProduct.title,
          price: editingProduct.price,
          discountPrice: editingProduct.discountPrice || 0,
          stock: editingProduct.stock,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setProducts((prev) =>
        prev.map((item) =>
          item._id === editingProduct._id ? { ...item, ...editingProduct } : item
        )
      );
      setEditingProduct(null);
      router.refresh();
      alert("পণ্য সফলভাবে আপডেট হয়েছে!");
    } catch (err) {
      alert(err.message || "আপডেট ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    const confirmDelete = window.confirm(
      `আপনি কি নিশ্চিতভাবে "${title}" পণ্যটি ডিলিট করতে চান?`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/seller/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setProducts((prev) => prev.filter((item) => item._id !== id));
      router.refresh();
    } catch (err) {
      alert(err.message || "ডিলিট করা সম্ভব হয়নি");
    }
  };

  return (
    <div>
      {/* সার্চ বার */}
      <div className="mb-2 sm:mb-3.5">
        <input
          type="text"
          placeholder="পণ্যের নাম লিখে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-2xl border border-gray-100 text-xs sm:text-sm text-gray-500">
          কোনো পণ্য পাওয়া যায়নি।
        </div>
      ) : (
        <>
          {/* ১. আল্ট্রা-কম্প্যাক্ট কার্ড গ্রিড (একদম ছোট উচ্চতা, বাটন নিচে) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2.5 xl:hidden">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white p-1.5 sm:p-2 rounded-xl border border-gray-100 shadow-2xs space-y-1"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={product.images?.[0] || product.image || "/placeholder.png"}
                    alt={product.title}
                    className="w-7 h-7 rounded-md object-contain border border-gray-100 bg-gray-50 p-0.5 shrink-0"
                  />

                  <div className="min-w-0 flex-1 flex items-center justify-between gap-1.5">
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-800 text-[11px] sm:text-xs leading-none truncate">
                        {product.title}
                      </h3>
                      <p className="text-[9px] sm:text-[10px] text-gray-400 leading-none mt-0.5 truncate">
                        {product.category || "সাধারণ"}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      {product.discountPrice > 0 ? (
                        <div className="flex items-baseline gap-1">
                          <span className="font-extrabold text-emerald-600 text-[11px] sm:text-xs leading-none">
                            ৳{product.discountPrice}
                          </span>
                          <span className="text-[9px] text-gray-400 line-through leading-none">
                            ৳{product.price}
                          </span>
                        </div>
                      ) : (
                        <span className="font-extrabold text-gray-800 text-[11px] sm:text-xs leading-none">
                          ৳{product.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* নিচে একদম স্লিম ২টি বাটন */}
                <div className="grid grid-cols-2 gap-1 pt-1 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(product)}
                    className="py-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition cursor-pointer leading-tight"
                  >
                    এডিট করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product._id, product.title)}
                    className="py-0.5 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition cursor-pointer leading-tight"
                  >
                    ডিলিট করুন
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ২. বড় ডেস্কটপ টেবিল ভিউ */}
          <div className="hidden xl:block bg-white rounded-2xl shadow-2xs border border-gray-100 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                  <th className="py-3 px-4">পণ্য</th>
                  <th className="py-3 px-4">ক্যাটাগরি</th>
                  <th className="py-3 px-4">মূল্য</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition">
                    <td className="py-2.5 px-4 flex items-center gap-3">
                      <img
                        src={product.images?.[0] || product.image || "/placeholder.png"}
                        alt={product.title}
                        className="w-10 h-10 rounded-lg object-contain border bg-gray-50 p-0.5"
                      />
                      <span className="font-medium text-gray-800 line-clamp-1">
                        {product.title}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-gray-600">
                      {product.category || "সাধারণ"}
                    </td>
                    <td className="py-2.5 px-4">
                      {product.discountPrice > 0 ? (
                        <div>
                          <span className="font-bold text-emerald-600">
                            ৳{product.discountPrice}
                          </span>
                          <span className="text-xs text-gray-400 line-through ml-1.5">
                            ৳{product.price}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-gray-800">৳{product.price}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(product)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition cursor-pointer"
                      >
                        এডিট
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product._id, product.title)}
                        className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition cursor-pointer"
                      >
                        ডিলিট
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <EditProductModal
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        onSubmit={handleUpdate}
        loading={loading}
      />
    </div>
  );
}
