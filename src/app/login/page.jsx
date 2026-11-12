// src/app/login/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // 🚀 ১. useRouter ইম্পোর্ট করা হলো

export default function Login() {
  const router = useRouter(); // 🚀 ২. রাউটার ইনিশিয়ালাইজ করা হলো
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(`স্বাগতম ${data.user.name}! আপনার রোল: ${data.user.role}`);
        
        // লোকাল স্টোরেজে ইউজারের তথ্য সেভ করা
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 🚀 ৩. রোল অনুযায়ী অটোমেটিক ড্যাশবোর্ডে রিডাইরেক্ট করার লজিক
        setTimeout(() => {
          if (data.user.role === 'customer') {
            router.push('/orders');
          } else if (data.user.role === 'seller') {
            router.push('/seller');
          } else if (data.user.role === 'rider') {
            router.push('/rider');
          }
        }, 1200); // ১.২ সেকেন্ড মেসেজটি দেখিয়ে পেজ চেঞ্জ হবে

      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("সার্ভার কানেকশন ব্যর্থ হয়েছে।");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">উপজেলা বাজার - লগইন</h2>
      
      {message && <p className="mb-4 text-center font-semibold text-green-600 bg-green-50 p-2 rounded">{message}</p>}
      {error && <p className="mb-4 text-center font-semibold text-red-600 bg-red-50 p-2 rounded">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="email" 
          placeholder="ইমেইল" 
          className="w-full p-2 border rounded" 
          onChange={e => setFormData({...formData, email: e.target.value})} 
          required 
        />
        <input 
          type="password" 
          placeholder="পাসওয়ার্ড" 
          className="w-full p-2 border rounded" 
          onChange={e => setFormData({...formData, password: e.target.value})} 
          required 
        />
        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold p-2 rounded transition">
          লগইন করুন
        </button>
      </form>
    </div>
  );
}
