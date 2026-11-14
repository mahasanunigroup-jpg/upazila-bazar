"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminProductTable({ initialProducts }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts || []);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.shopName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id, title) => {
    if (!window.confirm(`অ্যাডমিন অ্যাকশন: আপনি কি নিশ্চিতভাবে "${title}" পণ্যটি ডিলিট করতে চান?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setProducts((prev) => prev.filter((item) => item._id !== id));
      router.refresh();
    } catch (err) {
      alert(err.message || "ডিলিট ব্যর্থ হয়েছে");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="পণ্যের নাম বা দোকানের নাম লিখে খুঁজুন..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:w-80 px-4 py-2 text-sm border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600">
              <th className="py-3 px-4">পণ্য</th>
              <th className="py-3 px-4">দোকান (Shop)</th>
              <th className="py-3 px-4">মূল্য</th>
              <th className="py-3 px-4">স্টক</th>
              <th className="py-3 px-4 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((prod) => (
              <tr key={prod._id} className="hover:bg-gray-50">
                <td className="py-3 px-4 flex items-center gap-3">
                  <img
                    src={prod.image}
                    alt={prod.title}
                    className="w-11 h-11 rounded-lg object-cover border"
                  />
                  <div>
                    <p className="font-medium text-gray-800 line-clamp-1">
                      {prod.title}
                    </p>
                    <p className="text-xs text-gray-400">{prod.category}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600 font-medium">
                  {prod.shopName}
                </td>
                <td className="py-3 px-4 font-bold text-gray-800">
                  ৳{prod.price}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      prod.stock <= 0
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {prod.stock} টি
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    disabled={deletingId === prod._id}
                    onClick={() => handleDelete(prod._id, prod.title)}
                    className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded-md disabled:opacity-50"
                  >
                    {deletingId === prod._id ? "মুছছে..." : "ডিলিট"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
