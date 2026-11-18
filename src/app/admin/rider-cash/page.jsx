// src/app/admin/rider-cash/page.jsx
import { Suspense } from 'react';
import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { verifyAdmin } from '@/lib/adminAuth';
import connectDB from '@/lib/mongodb';
import CashHandover from '@/models/CashHandover';
import AdminRiderCashClient from '@/components/admin/AdminRiderCashClient';

export const metadata = {
  title: 'রাইডার ক্যাশ ভেরিফিকেশন | অ্যাডমিন প্যানেল',
  description: 'রাইডারদের জমাকৃত COD ক্যাশ যাচাই এবং গ্রহণ করুন।',
};

async function RiderCashAdminLoader() {
  await connection();

  const admin = await verifyAdmin();
  if (!admin) {
    redirect('/unauthorized');
  }

  await connectDB();
  const docs = await CashHandover.find({}).sort({ createdAt: -1 }).lean();

  const handovers = docs.map((item) => ({
    _id: item._id.toString(),
    riderId: item.riderId,
    riderName: item.riderName,
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

  return <AdminRiderCashClient initialHandovers={handovers} adminName={admin.name} />;
}

export default function AdminRiderCashPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
          COD ক্যাশ ম্যানেজমেন্ট
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          রাইডার ক্যাশ হ্যান্ডওভার রিকোয়েস্ট
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          রাইডারদের কাছ থেকে নগদ বা মার্চেন্ট অ্যাকাউন্টে টাকা বুঝে পেয়ে Verify করুন।
        </p>
      </div>

      <Suspense
        fallback={
          <div className="p-10 text-center text-gray-500 bg-white rounded-2xl border">
            রাইডার ক্যাশ তালিকা লোড হচ্ছে...
          </div>
        }
      >
        <RiderCashAdminLoader />
      </Suspense>
    </div>
  );
}
