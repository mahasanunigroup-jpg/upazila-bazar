// src/app/seller/wallet/page.jsx
import { Suspense } from 'react';
import { connection } from 'next/server'; // <-- Next.js 16-এর জন্য নতুন ইম্পোর্ট
import connectDB from '@/lib/mongodb';
import SellerWallet from '@/models/SellerWallet';
import Withdrawal from '@/models/Withdrawal';
import WalletClient from '@/components/seller/WalletClient';

export const metadata = {
  title: 'সেলার ওয়ালেট ও পেআউট | উপজেলা বাজার',
  description: 'আপনার বিক্রয়ের আয় দেখুন এবং সহজেই টাকা উত্তোলন করুন।',
};

async function WalletDataLoader() {
  // Next.js 16-কে জানানো হচ্ছে যে এটি প্রতি রিকোয়েস্টে ডাইনামিকভাবে রান হবে
  await connection();
  await connectDB();

  const sellerId = 'seller_001';

  // ১. ডেটাবেস থেকে সেলারের ওয়ালেট খোঁজা (না থাকলে নতুন তৈরি করবে)
  let walletDoc = await SellerWallet.findOne({ sellerId }).lean();
  if (!walletDoc) {
    const createdWallet = await SellerWallet.create({
      sellerId,
      availableBalance: 0,
      pendingBalance: 0,
      totalWithdrawn: 0,
    });
    walletDoc = createdWallet.toObject();
  }

  // ২. ডেটাবেস থেকে উইথড্রয়াল হিস্ট্রি আনা
  const historyDocs = await Withdrawal.find({ sellerId })
    .sort({ createdAt: -1 })
    .lean();

  const walletData = {
    _id: walletDoc._id.toString(),
    sellerId: walletDoc.sellerId,
    availableBalance: walletDoc.availableBalance || 0,
    pendingBalance: walletDoc.pendingBalance || 0,
    totalWithdrawn: walletDoc.totalWithdrawn || 0,
  };

  const historyData = historyDocs.map((item) => ({
    _id: item._id.toString(),
    amount: item.amount,
    method: item.method,
    accountDetails: item.accountDetails,
    status: item.status,
    transactionId: item.transactionId || '-',
    createdAt: new Date(item.createdAt).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  }));

  return <WalletClient initialWallet={walletData} initialHistory={historyData} />;
}

export default function SellerWalletPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            সেলার ওয়ালেট ও পেআউট
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            আপনার বিক্রয়ের ব্যালেন্স পরিচালনা করুন এবং মোবাইল ব্যাংকিং বা ব্যাংকে টাকা তুলুন।
          </p>
        </div>

        <Suspense
          fallback={
            <div className="p-10 text-center text-gray-500 bg-white rounded-2xl border">
              ওয়ালেট তথ্য লোড হচ্ছে...
            </div>
          }
        >
          <WalletDataLoader />
        </Suspense>
      </div>
    </main>
  );
}
