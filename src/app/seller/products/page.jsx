"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // স্থায়ী ফর্মের ইনপুট স্টেট
  const [formData, setFormData] = useState({ 
    title: "", description: "", price: "", stock: "", category: "সবজি"
  });

  const [editingId, setEditingId] = useState(null);

  async function loadProducts() {
    try {
      const res = await fetch("/api/products/seller");
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isEdit = !!editingId;
      const payload = {
        title: formData.title,
        description: formData.description || "তাজা পণ্য।",
        price: Number(formData.price),
        stock: Number(formData.stock), // 🚀 ইনপুট থেকে সরাসরি পিওর নাম্বারে কাস্ট করা হলো
        category: formData.category
      };

      const res = await fetch("/api/products/seller", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: editingId, ...payload } : payload)
      });
      const data = await res.json();
      
      if (data.success) {
        setFormData({ title: "", description: "", price: "", stock: "", category: "সবজি" });
        setEditingId(null);
        loadProducts();
      } else {
        alert(data.error || "অ্যাকশন সফল হয়নি।");
      }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`/api/products/seller?id=${id}`, { method: "DELETE" });
      if (res.ok) loadProducts();
    } catch (error) { console.error(error); }
  };

  if (loading) return <div className="text-center p-12 text-emerald-600 animate-pulse">লোড হচ্ছে...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-6xl mx-auto">
      {/* ব্যাক টু ড্যাশবোর্ড লিংক */}
      <div className="mb-4">
        <Link href="/seller" className="text-emerald-600 hover:underline text-sm font-medium">
          ← ওয়ান-ক্লিক ওভারভিউ ড্যাশবোর্ডে ফিরুন
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* বাম পাশ: প্রোডাক্ট আপলোড ফর্ম */}
        <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
          <h2 className="text-lg font-bold text-gray-700 border-b pb-2 mb-4">
            {editingId ? "প্রোডাক্ট সংশোধন করুন" : "নতুন প্রোডাক্ট যুক্ত করুন"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="প্রোডাক্টের নাম" className="w-full p-2 border rounded text-sm text-gray-800" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
            <textarea placeholder="বিবরণ" rows="3" className="w-full p-2 border rounded text-sm text-gray-800" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            <input type="number" placeholder="মূল্য" className="w-full p-2 border rounded text-sm text-gray-800" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
            <input type="number" placeholder="স্টক পরিমাণ (সংখ্যা)" className="w-full p-2 border rounded text-sm text-gray-800" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required />
            <select className="w-full p-2 border rounded text-sm bg-white text-gray-800" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
              <option value="সবজি">সবজি</option><option value="ফলমূল">ফলমূল</option><option value="চাল/ডাল">চাল/ডাল</option><option value="medicine">medicine</option><option value="অন্যান্য">অন্যান্য</option>
            </select>
            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold p-2.5 rounded transition">
              {editingId ? "হালনাগাদ করুন" : "আপলোড করুন"}
            </button>
          </form>
        </div>

        {/* ডান পাশ: প্রোডাক্ট টেবিল */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold text-gray-700 mb-4">আপনার দোকানের প্রোডাক্টসমূহ ({products.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-semibold border-b">
                  <th className="p-3">নাম</th><th className="p-3">ক্যাটাগরি</th><th className="p-3">স্টক</th><th className="p-3">মূল্য</th><th className="p-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{p.title}</td>
                    <td className="p-3 text-blue-600">{p.category}</td>
                    <td className="p-3 text-orange-600 font-medium">{p.stock} কেজি</td>
                    <td className="p-3 font-bold text-gray-900">৳{p.price}</td>
                    <td className="p-3 text-center flex justify-center gap-3">
                      <button onClick={() => { setEditingId(p._id); setFormData({ title: p.title, description: p.description, price: p.price, stock: p.stock, category: p.category }); }} className="text-blue-600 hover:underline font-medium">সম্পাদনা</button>
                      <button onClick={() => handleDelete(p._id)} className="text-red-600 hover:underline font-medium">মুছুন</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
