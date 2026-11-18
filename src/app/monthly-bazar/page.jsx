// src/app/monthly-bazar/page.jsx
import MonthlyBazarClient from '@/components/MonthlyBazarClient';

const READYMADE_PACKS = [
  {
    id: 'small-family',
    name: 'ছোট পরিবার প্যাক (২-৩ জন)',
    badge: 'জনপ্রিয়',
    discountPrice: 3450,
    regularPrice: 3800,
    items: [
      { name: 'মিনিকেট চাল', quantity: 15, unit: 'কেজি', price: 1050 },
      { name: 'সয়াবিন তেল', quantity: 3, unit: 'লিটার', price: 510 },
      { name: 'মসুর ডাল (দেশি)', quantity: 2, unit: 'কেজি', price: 280 },
      { name: 'পেঁয়াজ ও রসুন', quantity: 4, unit: 'কেজি', price: 360 },
      { name: 'আটা, লবণ ও চিনি', quantity: 5, unit: 'কেজি', price: 450 },
      { name: 'হলুদ, মরিচ ও জিরা গুঁড়া', quantity: 1, unit: 'প্যাক', price: 800 },
    ],
  },
  {
    id: 'medium-family',
    name: 'মাঝারি পরিবার প্যাক (৪-৫ জন)',
    badge: 'সেরা সাশ্রয়',
    discountPrice: 5890,
    regularPrice: 6450,
    items: [
      { name: 'মিনিকেট / নাজিরশাইল চাল', quantity: 25, unit: 'কেজি', price: 1850 },
      { name: 'সয়াবিন তেল', quantity: 5, unit: 'লিটার', price: 850 },
      { name: 'মসুর ও মুগ ডাল', quantity: 4, unit: 'কেজি', price: 560 },
      { name: 'পেঁয়াজ, আলু ও রসুন', quantity: 10, unit: 'কেজি', price: 780 },
      { name: 'চিনি, আটা, লবণ ও চা পাতা', quantity: 8, unit: 'কেজি', price: 850 },
      { name: 'সম্পূর্ণ মসলা ও সাবান প্যাক', quantity: 1, unit: 'সেট', price: 1000 },
    ],
  },
];

const CATALOG_ITEMS = [
  { id: 'p1', name: 'নাজিরশাইল চাল', unit: 'কেজি', price: 78 },
  { id: 'p2', name: 'সয়াবিন তেল (বোতল)', unit: 'লিটার', price: 170 },
  { id: 'p3', name: 'দেশি মসুর ডাল', unit: 'কেজি', price: 140 },
  { id: 'p4', name: 'দেশি পেঁয়াজ', unit: 'কেজি', price: 85 },
  { id: 'p5', name: 'প্যাকেট আটা', unit: 'কেজি', price: 55 },
  { id: 'p6', name: 'চিনি', unit: 'কেজি', price: 130 },
  { id: 'p7', name: 'খাঁটি সরিষার তেল', unit: 'লিটার', price: 260 },
  { id: 'p8', name: 'ফার্মের ডিম', unit: 'ডজন', price: 150 },
];

export const metadata = {
  title: 'মাসিক বাজার প্যাকেজ ও সাবস্ক্রিপশন | উপজেলা বাজার',
  description: 'প্রতি মাসে নিশ্চিন্তে বাজার পান, যেকোনো সময় পজ বা স্কিপ করুন।',
};

export default function MonthlyBazarPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* হিরো সেকশন */}
      <section className="bg-emerald-700 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-block bg-emerald-600 text-emerald-100 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            ঝামেলাহীন মাসিক বাজার
          </span>
          <h1 className="text-2xl md:text-4xl font-bold mb-3">
            মাসিক বাজার প্যাকেজ ও সাবস্ক্রিপশন
          </h1>
          <p className="text-emerald-100 max-w-2xl mx-auto text-sm md:text-base">
            রেডিমেড ফ্যামিলি প্যাক বেছে নিন অথবা নিজের পছন্দমতো বাজার লিস্ট তৈরি করুন। 
            প্রয়োজনে এক ক্লিকেই পরের মাসের ডেলিভারি <strong>পজ (Pause)</strong> বা <strong>স্কিপ (Skip)</strong> করুন।
          </p>
        </div>
      </section>

      {/* ক্লায়েন্ট ইন্টারঅ্যাক্টিভ সেকশন */}
      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <MonthlyBazarClient
          readymadePacks={READYMADE_PACKS}
          catalogItems={CATALOG_ITEMS}
        />
      </div>
    </main>
  );
}
