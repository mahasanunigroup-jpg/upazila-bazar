// src/app/rider/cash-handover/page.jsx
import { Suspense } from 'react';
import { connection } from 'next/server';
import connectDB from '@/lib/mongodb';
import RiderCashWallet from '@/models/RiderCashWallet';
import CashHandover from '@/models/CashHandover';
import RiderCashClient from '@/components/rider/RiderCashClient';

export const metadata = {
  title: 'রাইডার ক্যাশ হ্যান্ডওভার | উপজেলা বাজার',
  description: 'COD ডেলিভারির সংগৃহীত ক্যাশ হিসাব ও অফিসে জমা দেওয়ার ট্র্যাকার।',
};

async function RiderCashLoader() {
  await connection();
  await connectDB();

  // TODO: লগইন করা রাইডারের সেশন থেকে আসল riderId ও riderName বসাবেন
  const riderId = 'rider_001';
  const riderName = 'সাকিব (রাইডার)';

  let walletDoc = await RiderCashWallet.findOne({ riderId }).lean();
  if (!walletDoc) {
    const created = await RiderCashWallet.create({
      riderId,
      riderName,
      cashInHand: 0,
      totalHandedOver: 0,
    });
    walletDoc = created.toObject();
  }

  const historyDocs = await CashHandover.find({ riderId }).sort({ createdAt: -1 }).lean();

  const walletData = {
    riderId: walletDoc.riderId,
    riderName: walletDoc.riderName || riderName,
    cashInHand: walletDoc.cashInHand || 0,
    totalHandedOver: walletDoc.totalHandedOver || 0,
  };

  const historyData = historyDocs.map((item) => ({
    _id: item._id.toString(),
    amount: item.amount,
    handoverMethod: item.handoverMethod,
    referenceNote: item.referenceNote || '-',
    status: item.status,
    verifiedBy: item.verifiedBy || '-',
    createdAt: new Date(item.createdAt).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  }));

  return <RiderCashClient initialWallet={walletData} initialHistory={historyData} />;
}

export default function RiderCashHandoverPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            রাইডার ক্যাশ হ্যান্ডওভার ট্র্যাকার
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            কাস্টমারদের কাছ থেকে সংগৃহীত COD নগদ টাকার হিসাব দেখুন এবং অফিসে বা মার্চেন্ট নম্বরে জমা দিন।
          </p>
        </div>

        <Suspense
          fallback={
            <div className="p-10 text-center text-gray-500 bg-white rounded-2xl border">
              ক্যাশ হিসাব লোড হচ্ছে...
            </div>
          }
        >
          <RiderCashLoader />
        </Suspense>
      </div>
    </main>
  );
}
