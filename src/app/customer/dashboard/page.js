import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Order from "@/models/Order";

import CustomerTopBar from "@/components/customer/CustomerTopBar";
import CustomerStats from "@/components/customer/CustomerStats";
import ProfileInfoForm from "@/components/customer/ProfileInfoForm";
import AddressBook from "@/components/customer/AddressBook";
import RecentOrdersPreview from "@/components/customer/RecentOrdersPreview";

// টোকেন ভেরিফাই হেল্পার
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

// ইনস্ট্যান্ট নেভিগেশনের জন্য স্কেলিটন লোডার
function DashboardSkeleton() {
  return (
    <div>
      <div className="h-14 sm:h-16 bg-white border-b border-gray-200 animate-pulse" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6 pt-6 animate-pulse">
        <div className="h-20 bg-white rounded-xl border border-gray-200" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="h-24 bg-white rounded-xl border border-gray-200" />
          <div className="h-24 bg-white rounded-xl border border-gray-200" />
          <div className="h-24 bg-white rounded-xl border border-gray-200" />
          <div className="h-24 bg-white rounded-xl border border-gray-200" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white rounded-xl border border-gray-200" />
          <div className="lg:col-span-1 h-80 bg-white rounded-xl border border-gray-200" />
        </div>
      </div>
    </div>
  );
}
// ডায়নামিক ডাটা ও অথেনটিকেশন কম্পোনেন্ট
async function DashboardContent() {
  const auth = await getAuthenticatedCustomer();

  if (!auth) {
    redirect("/login?redirect=/customer/dashboard");
  }

  await dbConnect();

  const userId = auth.userId || auth.id || auth._id || auth.sub;

  const [userDoc, ordersDoc] = await Promise.all([
    User.findById(userId).select("-password").lean(),
    Order.find({ customer: userId }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!userDoc) {
    redirect("/login");
  }

  const customer = JSON.parse(JSON.stringify(userDoc));
  const orders = JSON.parse(JSON.stringify(ordersDoc));

  // চলতি মাস ও বছরের হিসাব (মাসিক খরচের সামারির জন্য)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyExpense = orders
    .filter((o) => {
      const orderDate = new Date(o.createdAt);
      return (
        o.status !== "cancelled" &&
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, o) => sum + Number(o.totalAmount || o.grandTotal || 0), 0);

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) =>
      ["pending", "confirmed", "processing", "shipped"].includes(o.status)
    ).length,
    deliveredOrders: orders.filter((o) => o.status === "delivered").length,
    monthlyExpense,
  };

  return (
    <>
      {/* ১. একদম উপরে স্টিকি নেভিগেশন ও কর্পোরেট বার */}
      <CustomerTopBar customer={customer} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6 pt-6">
        {/* স্বাগতম কার্ড */}
        <div className="bg-white px-4 py-3.5 sm:p-5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h1 className="text-base sm:text-xl font-bold text-gray-900">
              স্বাগতম, {customer.name}!
            </h1>
            <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              রেজিস্টার্ড কর্পোরেট অ্যাকাউন্ট
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
            আপনার অর্ডার, কর্পোরেট প্রোফাইল এবং ডেলিভারি ঠিকানা এখান থেকে পরিচালনা করুন।
          </p>
        </div>

        {/* ২. অর্ডার ও মাসিক খরচের সামারি কার্ডস */}
        <CustomerStats stats={stats} />

        {/* ৩. মূল গ্রিড */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProfileInfoForm customer={customer} />
            <AddressBook initialAddresses={customer.addresses || []} />
          </div>

          <div className="lg:col-span-1">
            <RecentOrdersPreview orders={orders.slice(0, 3)} />
          </div>
        </div>
      </div>
    </>
  );
}

// মূল পেজ এক্সপোর্ট
export default function CustomerDashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
