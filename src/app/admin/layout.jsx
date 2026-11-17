import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyAdmin } from "@/lib/adminAuth";
import { ROLE_ROUTES } from "@/utils/roleRedirect";
import SecurityAlertBanner from "@/components/admin/SecurityAlertBanner";
import ImpersonateBanner from "@/components/admin/ImpersonateBanner";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import NotificationBell from "@/components/NotificationBell";

const ROLE_LABELS = {
  super_admin: "সুপার অ্যাডমিন",
  division_admin: "বিভাগীয় অ্যাডমিন",
  district_admin: "জেলা অ্যাডমিন",
  upazila_admin: "উপজেলা অ্যাডমিন",
  union_admin: "ইউনিয়ন অ্যাডমিন",
  admin: "সেন্ট্রাল অ্যাডমিন",
};

async function ProtectedAdminWrapper({ children }) {
  const admin = await verifyAdmin();
  if (!admin) {
    redirect("/unauthorized");
  }

  const cookieStore = await cookies();
  const isImpersonating = Boolean(cookieStore.get("super_admin_token")?.value);

  const isSuper = admin.role === "super_admin" || admin.role === "admin";
  const myDashboardLink = ROLE_ROUTES[admin.role] || "/admin";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* সাইডবার নেভিগেশন (আপনার অরিজিনাল ডিজাইন) */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-emerald-400">
              🛡️ {ROLE_LABELS[admin.role] || "অ্যাডমিন প্যানেল"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">লগইন: {admin.name}</p>
            {(admin.division ||
              admin.district ||
              admin.upazila ||
              admin.union) && (
              <p className="text-xs text-emerald-400/90 mt-0.5">
                এলাকা:{" "}
                {admin.union || admin.upazila || admin.district || admin.division}
              </p>
            )}
          </div>
          {/* 🔔 নোটিফিকেশন বেল */}
          <NotificationBell />
        </div>

        <nav className="p-4 flex md:flex-col gap-2 overflow-x-auto text-sm">
          <Link
            href={myDashboardLink}
            className="px-3.5 py-2.5 rounded-lg hover:bg-slate-800 transition whitespace-nowrap"
          >
            📊 {isSuper ? "ওভারভিউ ও রিপোর্ট" : "আমার ড্যাশবোর্ড"}
          </Link>

          <Link
            href="/admin/users"
            className="px-3.5 py-2.5 rounded-lg hover:bg-slate-800 transition whitespace-nowrap"
          >
            👥 {isSuper ? "ইউজার, সেলার ও রাইডার" : "অধীনস্থ অ্যাডমিন ও সেলার"}
          </Link>

          <Link
            href="/admin/orders"
            className="px-3.5 py-2.5 rounded-lg hover:bg-slate-800 transition whitespace-nowrap"
          >
            📦 {isSuper ? "সব অর্ডার মনিটর" : "এলাকার অর্ডারসমূহ"}
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

          {isSuper && (
            <>
              <Link
                href="/admin/audit-logs"
                className="px-3.5 py-2.5 rounded-lg hover:bg-slate-800 transition whitespace-nowrap"
              >
                🕵️ অ্যাক্টিভিটি ও অডিট লগ
              </Link>

              <Link
                href="/admin/settings"
                className="px-3.5 py-2.5 rounded-lg hover:bg-slate-800 transition whitespace-nowrap"
              >
                ⚙️ সাইট সেটিংস
              </Link>
            </>
          )}

          <Link
            href="/"
            className="px-3.5 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition whitespace-nowrap md:mt-6"
          >
            ← মূল সাইটে ফিরুন
          </Link>

          {/* 🚪 লগআউট বাটন */}
          <AdminLogoutButton />
        </nav>
      </aside>

      {/* মেইন কন্টেন্ট এরিয়া (সব ডিভাইসের জন্য রেসপনসিভ ফিক্স) */}
      <main className="flex-1 min-w-0 w-full p-3 sm:p-5 md:p-8 max-w-7xl mx-auto overflow-x-hidden">
        {isImpersonating && (
          <ImpersonateBanner targetName={admin.name} targetRole={admin.role} />
        )}
        <SecurityAlertBanner />
        {children}
      </main>
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
