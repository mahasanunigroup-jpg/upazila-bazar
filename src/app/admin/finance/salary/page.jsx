// src/app/admin/finance/salary/page.jsx
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Expense from "@/models/Expense";
import { verifyAdmin } from "@/lib/adminAuth";
import { buildLocationScope } from "@/lib/adminScope";
import SalaryPaymentClient from "@/components/admin/SalaryPaymentClient";

export const metadata = {
  title: "স্যালারি প্রদান ও হিসাব | অ্যাডমিন প্যানেল",
};

async function SalaryPageContent({ searchParams }) {
  await connection();
  const admin = await verifyAdmin();
  if (!admin) redirect("/unauthorized");

  const resolvedParams = await searchParams;
  const targetUserId = resolvedParams?.userId || "";

  await connectDB();
  const locationFilter = buildLocationScope(admin);

  let selectedStaff = null;
  if (targetUserId && mongoose.Types.ObjectId.isValid(targetUserId)) {
    const userDoc = await User.findById(targetUserId)
      .select("name phone role customId division district upazila union")
      .lean();
    if (userDoc) {
      selectedStaff = {
        ...userDoc,
        _id: userDoc._id.toString(),
      };
    }
  }

  const historyQuery = selectedStaff
    ? {
        title: { $regex: "স্যালারি|Salary", $options: "i" },
        partyPhone: selectedStaff.phone,
      }
    : {
        ...locationFilter,
        title: { $regex: "স্যালারি|Salary", $options: "i" },
      };

  const rawHistory = await Expense.find(historyQuery)
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const salaryHistory = rawHistory.map((item) => ({
    _id: item._id.toString(),
    title: item.title,
    amount: item.amount,
    partyName: item.partyName,
    partyPhone: item.partyPhone,
    creatorName: item.creatorName,
    note: item.note || "",
    createdAt: item.createdAt ? item.createdAt.toISOString() : "",
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">
            💰 অ্যাডমিন ও স্টাফ স্যালারি প্রদান
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            স্যালারি প্রদান করলে তা স্বয়ংক্রিয়ভাবে ব্যয়ের খাতায় ও সুপার অ্যাডমিন রিপোর্টে যুক্ত হবে
          </p>
        </div>
        <Link
          href="/admin/users"
          className="px-4 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg w-fit"
        >
          ← ইউজার তালিকায় ফিরুন
        </Link>
      </div>

      <SalaryPaymentClient
        selectedStaff={selectedStaff}
        initialHistory={salaryHistory}
      />
    </div>
  );
}

export default function AdminSalaryPage({ searchParams }) {
  return (
    <Suspense
      fallback={
        <div className="bg-white p-10 text-center rounded-xl border text-gray-500">
          স্যালারি প্যানেল লোড হচ্ছে...
        </div>
      }
    >
      <SalaryPageContent searchParams={searchParams} />
    </Suspense>
  );
}
