// /src/app/seller/dashboard/FormSection.jsx
"use client";

export default function FormSection({ formData, setFormData, onSubmit, editingId, setEditingId, successMessage }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border h-fit space-y-4">
      <h2 className="text-lg font-bold text-gray-700 border-b pb-2">
        {editingId ? "প্রোডাক্ট সংশোধন করুন" : "নতুন প্রোডাক্ট যুক্ত করুন"}
      </h2>
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-2 text-xs rounded font-medium text-center">
          {successMessage}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <input 
          type="text" 
          placeholder="প্রোডাক্টের নাম" 
          className="w-full p-2 border rounded text-sm text-gray-800" 
          value={formData.title || ""} 
          onChange={(e) => setFormData({...formData, title: e.target.value})} 
          required 
        />
        <textarea 
          placeholder="বিবরণ" 
          rows="3" 
          className="w-full p-2 border rounded text-sm text-gray-800" 
          value={formData.description || ""} 
          onChange={(e) => setFormData({...formData, description: e.target.value})} 
        />
        <input 
          type="number" 
          placeholder="মূল্য (৳)" 
          className="w-full p-2 border rounded text-sm text-gray-800" 
          value={formData.price || ""} 
          onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} 
          required 
        />
        <input 
          type="number" 
          placeholder="স্টক পরিমাণ (সংখ্যা)" 
          className="w-full p-2 border rounded text-sm text-gray-800" 
          value={formData.stock || ""} 
          onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} 
          required 
        />
        <select 
          className="w-full p-2 border rounded text-sm bg-white text-gray-800" 
          value={formData.category || "সবজি"} 
          onChange={(e) => setFormData({...formData, category: e.target.value})}
        >
          <option value="সবজি">সবজি</option>
          <option value="ফলমূল">ফলমূল</option>
          <option value="চাল/ডাল">চাল/ডাল</option>
          <option value="medicine">medicine</option>
          <option value="অন্যান্য">অন্যান্য</option>
        </select>
        <input 
          type="text" 
          placeholder="ইমেজ ইউআরএল (ঐচ্ছিক)" 
          className="w-full p-2 border rounded text-sm text-gray-800" 
          value={formData.imageUrl || ""} 
          onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} 
        />

        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold p-2.5 rounded text-sm transition">
          {editingId ? "হালনাগাদ করুন" : "আপলোড করুন"}
        </button>
        
        {editingId && (
          <button 
            type="button" 
            onClick={() => { setEditingId(null); setFormData({ title: "", description: "", price: "", stock: "", category: "সবজি", imageUrl: "" }); }} 
            className="w-full bg-gray-200 text-gray-700 font-semibold p-2 rounded text-sm mt-1"
          >
            বাতিল করুন
          </button>
        )}
      </form>
    </div>
  );
}
