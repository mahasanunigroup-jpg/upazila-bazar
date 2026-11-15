import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { verifyAdmin } from "@/lib/adminAuth";
import { getAdminHomeRoute } from "@/lib/adminScope";
import AdminDashboardView from "@/components/AdminDashboardView";

export const metadata = {
  title: "বিভাগীয় অ্যাডমিন প্যানেল | উপজেলা বাজার",
};

async function DivisionAdminContent() {
  await connection();
  const admin = await verifyAdmin();
  if (!admin) redirect("/unauthorized");

  if (!["admin", "super_admin", "division_admin"].includes(admin.role)) {
    redirect(getAdminHomeRoute(admin.role));
  }

  return <AdminDashboardView admin={admin} />;
}

export default function DivisionAdminPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">লোড হচ্ছে...</div>}>
      <DivisionAdminContent />
    </Suspense>
  );
}
