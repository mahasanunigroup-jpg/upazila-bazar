// src/app/seller/cash-receive/page.jsx
import { Suspense } from 'react';
import { connection } from 'next/server';
import connectDB from '@/lib/mongodb';
import CashHandover from '@/models/CashHandover';
import SellerCashReceiveClient from '@/components/seller/SellerCashReceiveClient';

export const metadata = {
  title: 'রাইডার ক্যাশ রিসিভ ও সিগনেচার | সেলার প্যানেল',
};

async function SellerCashLoader() {
  await connection();
  await connectDB();

  const sellerId = 'seller_001'; // আপনার Auth সেশন থেকে সেলার আইডি দিন
  const docs = await CashHandover.find({ sellerId }).sort({ createdAt: -1 }).lean();

  const records = docs.map((item) => ({
    _id: item._id.toString(),
    riderName: item.riderName,
    amount: item.amount,
    referenceNote: item.referenceNote || '-',
    status: item.status,
    sellerSignature: item.sellerSignature || '',
    createdAt: new Date(item.createdAt).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  }));

  return <SellerCashReceiveClient initialRecords={records} />;
}

export default function SellerCashReceivePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            রাইডার ক্যাশ রিসিভ ও সিগনেচার
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            রাইডারের কাছ থেকে COD পণ্যের নগদ টাকা বুঝে পেয়ে ডিজিটাল সিগনেচার দিয়ে অনুমোদন দিন।
          </p>
        </div>

        <Suspense fallback={<div className="p-10 text-center bg-white rounded-2xl border">লোড হচ্ছে...</div>}>
          <SellerCashLoader />
        </Suspense>
      </div>
    </main>
  );
}
