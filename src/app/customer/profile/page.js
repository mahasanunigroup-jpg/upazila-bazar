import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { ArrowLeft } from "lucide-react";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

import CustomerTopBar from "@/components/customer/CustomerTopBar";
import ProfileEditForm from "@/components/customer/ProfileEditForm";

async function getAuthenticatedCustomer() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "customer") return null;
    return payload;
  } catch {
    return null;
  }
}

async function ProfilePageContent() {
  const auth = await getAuthenticatedCustomer();
  if (!auth) {
    redirect("/login?redirect=/customer/profile");
  }

  await dbConnect();
  const userId = auth.userId || auth.id || auth._id || auth.sub;
  const userDoc = await User.findById(userId).select("-password").lean();

  if (!userDoc) {
    redirect("/login");
  }

  const customer = JSON.parse(JSON.stringify(userDoc));

  return (
    <>
      <CustomerTopBar customer={customer} />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 pt-6 space-y-5">
        <Link
          href="/customer/dashboard"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ড্যাশবোর্ডে ফিরে যান</span>
        </Link>

        <ProfileEditForm customer={customer} />
      </div>
    </>
  );
}

export default function CustomerProfileEditPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <Suspense
        fallback={
          <div className="mx-auto max-w-2xl px-4 pt-10">
            <div className="h-80 bg-white rounded-xl border border-gray-200 animate-pulse" />
          </div>
        }
      >
        <ProfilePageContent />
      </Suspense>
    </main>
  );
}
