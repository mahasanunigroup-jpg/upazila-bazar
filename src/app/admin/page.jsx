import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";

export const metadata = {
  title: "অ্যাডমিন ওভারভিউ | উপজেলা বাজার",
};

async function OverviewStatsSection() {
  await connection();
  await connectDB();

  const [
    totalUsers,
    totalSellers,
    totalRiders,
    totalProducts,
    orders,
    recentUsersRaw,
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "seller" }),
    User.countDocuments({ role: "rider" }),
    Product.countDocuments({}),
    Order.find({}).sort({ createdAt: -1 }).lean(),
    User.find({ role: { $in: ["seller", "rider"] } })
      .select("name phone role upazila status isApproved createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  let totalSales = 0;
  let deliveredCount = 0;
  let pendingCount = 0;

  orders.forEach((o) => {
    const isDelivered =
      o.deliveryStatus === "delivered" || o.status === "delivered";
    if (isDelivered) {
      deliveredCount += 1;
      totalSales += Number(o.total_amount || 0);
    } else if (o.status !== "cancelled") {
      pendingCount += 1;
    }
  });

  const recentOrders = orders.slice(0, 5).map((o) => ({
    _id: o._id.toString(),
    orderId: o.orderId || o._id.toString().slice(-6).toUpperCase(),
    customerName: o.customer_name || "ক্রেতা",
    upazila: o.upazila || "",
    amount: o.total_amount || 0,
    status: o.deliveryStatus === "delivered" ? "delivered" : o.status || "pending",
    date: new Date(o.createdAt).toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "short",
    }),
  }));

  const recentPartners = recentUsersRaw.map((u) => ({
    _id: u._id.toString(),
    name: u.name || "নাম নেই",
    phone: u.phone || "",
    role: u.role,
    upazila: u.upazila || "",
    isPending: u.isApproved === false || u.status === "pending",
  }));

  return (
    <div className="space-y-6">
      {/* ৪টি মেইন স্ট্যাটস কার্ড */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">মোট প্ল্যাটফর্ম বিক্রি</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            ৳{totalSales.toLocaleString("bn-BD")}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            ডেলিভারড: {deliveredCount} টি অর্ডার
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">চলমান অর্ডার</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {pendingCount} টি
          </p>
          <Link
            href="/admin/orders"
            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
          >
            সব অর্ডার দেখুন →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">সেলার ও রাইডার</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {totalSellers} / {totalRiders}
          </p>
          <Link
            href="/admin/users"
            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
          >
            সেলার ও রাইডার নিয়ন্ত্রণ →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">মোট পণ্য ও ক্রেতা</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {totalProducts} / {totalUsers}
          </p>
          <Link
            href="/admin/products"
            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
          >
            পণ্য মডারেশন →
          </Link>
        </div>
      </div>
      {/* নিচের ২ কলাম: সাম্প্রতিক অর্ডার ও নতুন সেলার/রাইডার */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* বাম কলাম: প্ল্যাটফর্মের সাম্প্রতিক অর্ডার */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">সাম্প্রতিক অর্ডারসমূহ</h3>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-emerald-600 hover:underline"
            >
              সব দেখুন
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              এখনো কোনো অর্ডার নেই।
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="py-3 flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      #{order.orderId}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        ({order.date})
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.customerName} {order.upazila ? `• ${order.upazila}` : ""}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-800">৳{order.amount}</p>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        order.status === "delivered"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ডান কলাম: সাম্প্রতিক সেলার ও রাইডার */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">
              সাম্প্রতিক সেলার ও রাইডার
            </h3>
            <Link
              href="/admin/users"
              className="text-xs font-medium text-emerald-600 hover:underline"
            >
              ম্যানেজ করুন
            </Link>
          </div>

          {recentPartners.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              কোনো সেলার বা রাইডার পাওয়া যায়নি।
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentPartners.map((partner) => (
                <div
                  key={partner._id}
                  className="py-3 flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{partner.name}</p>
                    <p className="text-xs text-gray-500">
                      {partner.phone} {partner.upazila ? `• ${partner.upazila}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded capitalize">
                      {partner.role}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        partner.isPending
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {partner.isPending ? "পেন্ডিং" : "সক্রিয়"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          প্ল্যাটফর্ম ওভারভিউ
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          উপজেলা বাজারের সর্বমোট বিক্রি, ইউজার এবং অপারেশনের লাইভ চিত্র
        </p>
      </div>

      <Suspense
        fallback={
          <div className="bg-white p-10 text-center rounded-xl border border-gray-100 text-gray-500">
            প্ল্যাটফর্মের পরিসংখ্যান লোড হচ্ছে...
          </div>
        }
      >
        <OverviewStatsSection />
      </Suspense>
    </div>
  );
}
