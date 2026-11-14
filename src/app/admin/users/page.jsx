import { Suspense } from "react";
import { connection } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyAdmin } from "@/lib/adminAuth";
import AdminUserTable from "@/components/admin/AdminUserTable";

export const metadata = {
  title: "ইউজার ও সেলার কন্ট্রোল | অ্যাডমিন প্যানেল",
};

async function UsersDataSection() {
  await connection();
  const admin = await verifyAdmin();
  await connectDB();

  const rawUsers = await User.find({})
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();

  const users = rawUsers.map((u) => ({
    _id: u._id.toString(),
    name: u.name || "নাম নেই",
    email: u.email || "",
    phone: u.phone || "",
    role: u.role || "customer",
    upazila: u.upazila || "",
    isApproved: u.isApproved ?? true,
    isBlocked: u.isBlocked ?? false,
    status: u.status || (u.isBlocked ? "blocked" : "active"),
  }));

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          ইউজার, সেলার ও রাইডার নিয়ন্ত্রণ
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          মোট নিবন্ধিত অ্যাকাউন্ট:{" "}
          <span className="font-semibold text-emerald-600">
            {users.length} টি
          </span>
        </p>
      </div>

      <AdminUserTable initialUsers={users} currentAdminId={admin?._id} />
    </>
  );
}

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="bg-white p-10 text-center rounded-xl border border-gray-100 text-gray-500">
            ইউজার তালিকা লোড হচ্ছে...
          </div>
        }
      >
        <UsersDataSection />
      </Suspense>
    </div>
  );
}
