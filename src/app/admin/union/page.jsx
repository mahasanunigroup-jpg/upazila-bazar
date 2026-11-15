import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { verifyAdmin } from "@/lib/adminAuth";
import AdminDashboardView from "@/components/AdminDashboardView";

export const metadata = {
  title: "ইউনিয়ন অ্যাডমিন প্যানেল | উপজেলা বাজার",
};

async function UnionAdminContent() {
  await connection();
  const admin = await verifyAdmin();
  if (!admin) redirect("/unauthorized");

  return <AdminDashboardView admin={admin} />;
}

export default function UnionAdminPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">লোড হচ্ছে...</div>}>
      <UnionAdminContent />
    </Suspense>
  );
}
