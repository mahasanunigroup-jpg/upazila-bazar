import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { verifyAdmin } from "@/lib/adminAuth";
import { getAdminHomeRoute } from "@/lib/adminScope";
import AdminDashboardView from "@/components/AdminDashboardView";

export const metadata = {
  title: "জেলা অ্যাডমিন প্যানেল | উপজেলা বাজার",
};

async function DistrictAdminContent() {
  await connection();
  const admin = await verifyAdmin();
  if (!admin) redirect("/unauthorized");

  if (!["admin", "super_admin", "division_admin", "district_admin"].includes(admin.role)) {
    redirect(getAdminHomeRoute(admin.role));
  }

  return <AdminDashboardView admin={admin} />;
}

export default function DistrictAdminPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">লোড হচ্ছে...</div>}>
      <DistrictAdminContent />
    </Suspense>
  );
}
