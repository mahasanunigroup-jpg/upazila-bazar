import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { verifyAdmin } from "@/lib/adminAuth";
import { getAdminHomeRoute } from "@/lib/adminScope";
import AdminDashboardView from "@/components/AdminDashboardView";

export const metadata = {
  title: "উপজেলা অ্যাডমিন প্যানেল | উপজেলা বাজার",
};

async function UpazilaAdminContent() {
  await connection();
  const admin = await verifyAdmin();
  if (!admin) redirect("/unauthorized");

  if (admin.role === "union_admin") {
    redirect(getAdminHomeRoute(admin.role));
  }

  return <AdminDashboardView admin={admin} />;
}

export default function UpazilaAdminPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">লোড হচ্ছে...</div>}>
      <UpazilaAdminContent />
    </Suspense>
  );
}
