// src/app/admin/withdrawals/page.jsx
import { Suspense } from 'react';
import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { verifyAdmin } from '@/lib/adminAuth';
import connectDB from '@/lib/mongodb';
import Withdrawal from '@/models/Withdrawal';
import AdminWithdrawalsClient from '@/components/admin/AdminWithdrawalsClient';

export const metadata = {
  title: 'সেলার পেআউট ম্যানেজমেন্ট | অ্যাডমিন প্যানেল',
  description: 'সেলারদের উইথড্রয়াল রিকোয়েস্ট যাচাই এবং অনুমোদন করুন।',
};

async function WithdrawalsLoader() {
  // Next.js 16 ডাইনামিক রেন্ডারিং নিশ্চিত করা হচ্ছে
  await connection();

  // সিকিউরিটি চেক: শুধুমাত্র super_admin এবং admin এই পেজে প্রবেশ করতে পারবে
  const admin = await verifyAdmin();
  if (!admin || (admin.role !== 'super_admin' && admin.role !== 'admin')) {
    redirect('/unauthorized');
  }

  // MongoDB কানেকশন ও ডাটা ফেচিং
  await connectDB();
  const docs = await Withdrawal.find({}).sort({ createdAt: -1 }).lean();

  // ক্লায়েন্ট কম্পোনেন্টে পাঠানোর জন্য ডাটা সিরিয়ালাইজ করা
  const withdrawals = docs.map((item) => ({
    _id: item._id.toString(),
    sellerId: item.sellerId,
    amount: item.amount,
    method: item.method,
    accountDetails: item.accountDetails,
    status: item.status,
    transactionId: item.transactionId || '',
    createdAt: new Date(item.createdAt).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  }));

  return <AdminWithdrawalsClient initialWithdrawals={withdrawals} />;
}

export default function AdminWithdrawalsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
          সুপার অ্যাডমিন কন্ট্রোল
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          সেলার পেআউট ও উইথড্রয়াল রিকোয়েস্ট
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          সেলারদের টাকা উত্তোলনের আবেদন যাচাই করে TrxID-সহ অনুমোদন দিন অথবা বাতিল করুন।
        </p>
      </div>

      <Suspense
        fallback={
          <div className="p-10 text-center text-gray-500 bg-white rounded-2xl border">
            পেআউট রিকোয়েস্টগুলো লোড হচ্ছে...
          </div>
        }
      >
        <WithdrawalsLoader />
      </Suspense>
    </div>
  );
}
