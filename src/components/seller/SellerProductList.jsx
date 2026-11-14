"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      <div className="mb-4">
        <input
          type="text"
          placeholder="পণ্যের নাম লিখে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
      </div>
      {filteredProducts.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-xl border border-gray-100 text-gray-500">
          কোনো পণ্য পাওয়া যায়নি।
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="py-3.5 px-4">পণ্য</th>
                <th className="py-3.5 px-4">ক্যাটাগরি</th>
                <th className="py-3.5 px-4">মূল্য</th>
                <th className="py-3.5 px-4">স্টক</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={product.images?.[0] || product.image || "/placeholder.png"}
                      alt={product.title}
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                    <span className="font-medium text-gray-800 line-clamp-1">
                      {product.title}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {product.category || "সাধারণ"}
                  </td>
                  <td className="py-3 px-4">
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
                  <td className="py-3 px-4">
                    {product.stock <= 0 ? (
                      <span className="px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                        স্টক শেষ (0)
                      </span>
                    ) : product.stock <= 5 ? (
                      <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                        কম স্টক ({product.stock})
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">
                        {product.stock} টি
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                    >
                      এডিট
                    </button>
                    <button
                      onClick={() => handleDelete(product._id, product.title)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition"
                    >
                      ডিলিট
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              পণ্য আপডেট করুন
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  পণ্যের নাম
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  বর্তমান স্টক (পরিমাণ)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editingProduct.stock}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      stock: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
                >
                  {loading ? "সেভ হচ্ছে..." : "পরিবর্তন সেভ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
