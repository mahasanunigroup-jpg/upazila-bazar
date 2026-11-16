import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyAdmin } from "@/lib/adminAuth";
import { buildLocationScope, MANAGEABLE_ROLES } from "@/lib/adminScope";
import AdminUserTable from "@/components/admin/AdminUserTable";
import { getDisplayUserId } from "@/lib/generateUserId";

export const metadata = {
  title: "অ্যাডমিন, ইউজার ও সেলার কন্ট্রোল | উপজেলা বাজার",
};

async function UsersDataSection() {
  await connection();
  const admin = await verifyAdmin();
  if (!admin) redirect("/unauthorized");

  await connectDB();

  // লগইন করা অ্যাডমিনের এলাকা ও অধীনস্থ রোল অনুযায়ী ফিল্টার
  const locationFilter = buildLocationScope(admin);
  const allowedRoles = MANAGEABLE_ROLES[admin.role] || [];
  const isSuper = admin.role === "admin" || admin.role === "super_admin";

  // Super Admin সবাইকে দেখবেন, আর আঞ্চলিক অ্যাডমিনরা কেবল নিজ এলাকার অধীনস্থ রোলগুলো দেখবেন
  const query = isSuper
    ? {}
    : {
        ...locationFilter,
        role: { $in: [...allowedRoles, "customer"] },
      };

  const rawUsers = await User.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();

  // পদমর্যাদা অনুযায়ী সিরিয়াল নির্ধারণ (১ নম্বর সবার উপরে থাকবে)
  const ROLE_PRIORITY = {
    super_admin: 1,
    admin: 1,
    division_admin: 2,
    district_admin: 3,
    upazila_admin: 4,
    union_admin: 5,
    seller: 6,
    rider: 7,
    customer: 8,
  };

  const users = rawUsers
    .map((u) => ({
      customId: getDisplayUserId(u),
      _id: u._id.toString(),
      name: u.name || "নাম নেই",
      email: u.email || "",
      phone: u.phone || "",
      role: u.role || "customer",
      division: u.division || "",
      district: u.district || "",
      upazila: u.upazila || "",
      union: u.union || "",
      address: u.address || "",
      biodata: u.biodata || {},
      isApproved: u.isApproved ?? true,
      isBlocked: u.isBlocked ?? false,
      status: u.status || (u.isBlocked ? "blocked" : "active"),
    }))
    // 👇 সুপার অ্যাডমিনকে সবার উপরে এবং বাকিদের পদমর্যাদা অনুযায়ী সাজানো হলো
    .sort((a, b) => (ROLE_PRIORITY[a.role] || 99) - (ROLE_PRIORITY[b.role] || 99));


  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          অ্যাডমিন, সেলার ও রাইডার নিয়ন্ত্রণ
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          আপনার আওতাধীন মোট নিবন্ধিত অ্যাকাউন্ট:{" "}
          <span className="font-semibold text-emerald-600">
            {users.length} টি
          </span>
        </p>
      </div>

      <AdminUserTable
        initialUsers={users}
        currentAdminId={admin._id}
        currentAdmin={admin}
        allowedRoles={allowedRoles}
      />
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
