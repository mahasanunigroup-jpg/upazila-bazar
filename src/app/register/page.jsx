// src/app/register/page.jsx
'use client';
import { useState } from 'react';

// জেলা-উপজেলা ডাটা (বাংলাদেশ সরকারের ডাটা অনুযায়ী প্রাথমিক তালিকা)
const locationData = {
  "Dhaka": ["Savar", "Dhamrai", "Keraniganj"],
  "Kushtia": ["Kushtia Sadar", "Kumarkhali", "Mirpur", "Bheramara"],
  "Chittagong": ["Hathazari", "Patiya", "Sitakunda"]
};

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    role: 'customer', district: '', upazila: '', address: ''
  });
  const [message, setMessage] = useState('');

  // সাবমিট হ্যান্ডলার ফাংশনটি সবসময় return এর ওপরে থাকবে
  const handleSubmit = async (e) => {
    e.preventDefault(); // পেজ রিফ্রেশ হওয়া বন্ধ করবে
    setMessage(''); // আগের কোনো মেসেজ থাকলে তা ক্লিয়ার করবে

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage("নিবন্ধন সফল হয়েছে! এখন লগইন করুন।");
      } else {
        setMessage(data.error || "কিছু একটা ভুল হয়েছে।");
      }
    } catch (error) {
      setMessage("সার্ভারে কানেক্ট করা যাচ্ছে না।");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">উপজেলা বাজার - রেজিস্ট্রেশন</h2>
      
      {message && (
        <p className="mb-4 text-center font-semibold text-blue-600 bg-blue-50 p-2 rounded">
          {message}
        </p>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="নাম" className="w-full p-2 border rounded" onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input type="email" placeholder="ইমেইল" className="w-full p-2 border rounded" onChange={e => setFormData({...formData, email: e.target.value})} required />
        <input type="password" placeholder="পাসওয়ার্ড" className="w-full p-2 border rounded" onChange={e => setFormData({...formData, password: e.target.value})} required />
        <input type="text" placeholder="মোবাইল নম্বর" className="w-full p-2 border rounded" onChange={e => setFormData({...formData, phone: e.target.value})} required />
        
        {/* রোল সিলেকশন */}
        <select className="w-full p-2 border rounded" onChange={e => setFormData({...formData, role: e.target.value})}>
          <option value="customer">আমি একজন ক্রেতা (Customer)</option>
          <option value="seller">আমি একজন দোকানদার (Seller)</option>
          <option value="rider">আমি একজন ডেলিভারি ম্যান (Rider)</option>
        </select>

        {/* জেলা সিলেকশন */}
        <select className="w-full p-2 border rounded" onChange={e => setFormData({...formData, district: e.target.value, upazila: ''})} required>
          <option value="">জেলা নির্বাচন করুন</option>
          {Object.keys(locationData).map(dist => <option key={dist} value={dist}>{dist}</option>)}
        </select>

        {/* উপজেলা সিলেকশন (জেলার ওপর ভিত্তি করে ডায়নামিক হবে) */}
        <select className="w-full p-2 border rounded" onChange={e => setFormData({...formData, upazila: e.target.value})} disabled={!formData.district} required>
          <option value="">উপজেলা নির্বাচন করুন</option>
          {formData.district && locationData[formData.district].map(upz => <option key={upz} value={upz}>{upz}</option>)}
        </select>

        <textarea placeholder="গ্রাম/মহল্লা, রোড নম্বর এবং বিস্তারিত ঠিকানা" className="w-full p-2 border rounded" onChange={e => setFormData({...formData, address: e.target.value})} required></textarea>

        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold p-2 rounded transition">
          রেজিস্ট্রেশন করুন
        </button>
      </form>
    </div>
  );
}
