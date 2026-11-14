import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyAdmin } from "@/lib/adminAuth";

async function ProtectedAdminWrapper({ children }) {
  const admin = await verifyAdmin();
  if (!admin) {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* সাইডবার নেভিগেশন */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-lg font-bold text-emerald-400">
            🛡️ অ্যাডমিন প্যানেল
          </h2>
          <p className="text-xs text-slate-400 mt-1">লগইন: {admin.name}</p>
        </div>

        <nav className="p-4 flex md:flex-col gap-2 overflow-x-auto text-sm">
          <Link
            href="/admin"
            className="px-3.5 py-2.5 rounded-lg hover:bg-slate-800 transition whitespace-nowrap"
          >
            📊 ওভারভিউ ও রিপোর্ট
          </Link>
          <Link
            href="/admin/users"
            className="px-3.5 py-2.5 rounded-lg hover:bg-slate-800 transition whitespace-nowrap"
          >
            👥 ইউজার, সেলার ও রাইডার
          </Link>
          <Link
            href="/admin/orders"
            className="px-3.5 py-2.5 rounded-lg hover:bg-slate-800 transition whitespace-nowrap"
          >
            📦 সব অর্ডার মনিটর
          </Link>
          <Link
            href="/admin/products"
            className="px-3.5 py-2.5 rounded-lg hover:bg-slate-800 transition whitespace-nowrap"
          >
            🛍️ পণ্য মডারেশন
          </Link>
          <Link
            href="/admin/finance"
            className="px-3.5 py-2.5 rounded-lg hover:bg-slate-800 transition whitespace-nowrap"
          >
            💰 আয় ও কমিশন হিসাব
          </Link>

          <Link
            href="/admin/settings"
            className="px-3.5 py-2.5 rounded-lg hover:bg-slate-800 transition whitespace-nowrap"
          >
            ⚙️ সাইট সেটিংস
          </Link>

          <Link
            href="/"
            className="px-3.5 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition whitespace-nowrap md:mt-6"
          >
            ← মূল সাইটে ফিরুন
          </Link>
        </nav>
      </aside>

      {/* মেইন কন্টেন্ট এরিয়া */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
          অ্যাডমিন সিকিউরিটি যাচাই হচ্ছে...
        </div>
      }
    >
      <ProtectedAdminWrapper>{children}</ProtectedAdminWrapper>
    </Suspense>
  );
}
