// src/app/admin/transactions/page.jsx
import { Suspense } from 'react';
import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { verifyAdmin } from '@/lib/adminAuth';
import connectDB from '@/lib/mongodb';
import CashHandover from '@/models/CashHandover';
import Withdrawal from '@/models/Withdrawal';
import AdminTransactionsClient from '@/components/admin/AdminTransactionsClient';

export const metadata = {
  title: 'সকল লেনদেন ও ক্যাশ লেজার | সুপার অ্যাডমিন',
  description: 'রাইডার, সেলার এবং অ্যাডমিনের সকল আর্থিক লেনদেনের বিস্তারিত রিপোর্ট।',
};

async function TransactionsDataLoader() {
  await connection();

  // শুধুমাত্র super_admin এবং admin প্রবেশ করতে পারবে
  const admin = await verifyAdmin();
  if (!admin || (admin.role !== 'super_admin' && admin.role !== 'admin')) {
    redirect('/unauthorized');
  }

  await connectDB();

  // সমান্তরালভাবে (Promise.all) দুটি কালেকশন থেকে দ্রুত ডাটা আনা হচ্ছে
  const [handoverDocs, withdrawalDocs] = await Promise.all([
    CashHandover.find({}).sort({ createdAt: -1 }).lean(),
    Withdrawal.find({}).sort({ createdAt: -1 }).lean(),
  ]);

  // ১. রাইডার -> সেলার ক্যাশ হ্যান্ডওভার লেনদেন ফরম্যাট
  const riderToSellerList = handoverDocs.map((item) => ({
    id: item._id.toString(),
    type: 'COD_HANDOVER',
    fromName: `${item.riderName} (${item.riderId})`,
    toName: `${item.sellerName} (${item.sellerId})`,
    amount: item.amount,
    method: 'নগদ (COD Cash)',
    reference: item.referenceNote || '-',
    signature: item.sellerSignature || '',
    verifiedBy: item.verifiedByAdmin || 'অপেক্ষমাণ',
    status: item.status,
    rawDate: item.createdAt,
    date: new Date(item.createdAt).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  }));

  // ২. সেলার -> অ্যাডমিন উইথড্রয়াল লেনদেন ফরম্যাট
  const sellerPayoutList = withdrawalDocs.map((item) => ({
    id: item._id.toString(),
    type: 'SELLER_PAYOUT',
    fromName: 'উপজেলা বাজার (Admin)',
    toName: `সেলার (${item.sellerId})`,
    amount: item.amount,
    method: `${item.method} (${item.accountDetails})`,
    reference: item.transactionId ? `TrxID: ${item.transactionId}` : '-',
    signature: '',
    verifiedBy: item.status === 'approved' ? admin.name : 'অপেক্ষমাণ',
    status: item.status,
    rawDate: item.createdAt,
    date: new Date(item.createdAt).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  }));

  // সব লেনদেন একসাথে মিশিয়ে নতুন থেকে পুরনো অনুযায়ী সাজানো হলো
  const allTransactions = [...riderToSellerList, ...sellerPayoutList].sort(
    (a, b) => new Date(b.rawDate) - new Date(a.rawDate)
  );

  // সামারি হিসাব
  const totalCodVerified = handoverDocs
    .filter((i) => i.status === 'admin_verified')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalSellerPaid = withdrawalDocs
    .filter((i) => i.status === 'approved')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <AdminTransactionsClient
      transactions={allTransactions}
      summary={{
        totalCodVerified,
        totalSellerPaid,
        totalCount: allTransactions.length,
      }}
    />
  );
}

export default function AdminTransactionsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
          মাস্টার ফাইন্যান্স লেজার
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          সকল লেনদেনের বিস্তারিত হিসাব (Master Ledger)
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          কোন রাইডার কোন সেলারকে কত টাকা দিয়েছেন, কার সিগনেচারে অনুমোদিত হয়েছে এবং সেলার পেআউটের সম্পূর্ণ তথ্য।
        </p>
      </div>

      <Suspense
        fallback={
          <div className="p-10 text-center text-gray-500 bg-white rounded-2xl border">
            সকল লেনদেনের ডাটা লোড হচ্ছে...
          </div>
        }
      >
        <TransactionsDataLoader />
      </Suspense>
    </div>
  );
}
