import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Setting from "@/models/Setting";
import SellerOverviewCards from "@/components/seller/SellerOverviewCards";
import SellerRecentActivity from "@/components/seller/SellerRecentActivity";

export const metadata = {
  title: "সেলার ড্যাশবোর্ড | উপজেলা বাজার",
};

async function DashboardContent() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  let sellerId;
  let sellerName = "সেলার";
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "seller" && payload.role !== "admin") redirect("/");
    sellerId = payload.userId || payload.id;
    sellerName = payload.name || "সেলার";
  } catch {
    redirect("/login");
  }

  await connectDB();
  const sellerObjectId = mongoose.Types.ObjectId.isValid(sellerId)
    ? new mongoose.Types.ObjectId(sellerId)
    : sellerId;

  // শুধু প্রয়োজনীয় ফিল্ডগুলো সিলেক্ট করে দ্রুত কুয়েরি চালানো
  const [totalProducts, orders, globalSettings] = await Promise.all([
    Product.countDocuments({ sellerId: sellerObjectId }),
    Order.find({ "items.sellerId": sellerObjectId })
      .select("orderId customer_name status deliveryStatus items createdAt")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
    Setting.collection.findOne(
      { key: "global_settings" },
      { projection: { commissionPercent: 1 } }
    ),
  ]);

  let totalRevenue = 0;
  let pendingOrdersCount = 0;

  const recentOrders = orders.slice(0, 5).map((order) => {
    const sellerItems = (order.items || []).filter(
      (item) => item.sellerId?.toString() === sellerId.toString()
    );
    const amount = sellerItems.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);

    return {
      _id: order._id.toString(),
      orderId: order.orderId || order._id.toString().slice(-6).toUpperCase(),
      customerName: order.customer_name || "ক্রেতা",
      status: order.deliveryStatus === "delivered" ? "delivered" : order.status || "pending",
      amount,
      itemCount: sellerItems.length,
      date: new Date(order.createdAt).toLocaleDateString("bn-BD", { day: "numeric", month: "short" }),
    };
  });

  orders.forEach((order) => {
    const isDelivered = order.deliveryStatus === "delivered" || order.status === "delivered";
    const sellerItems = (order.items || []).filter(
      (item) => item.sellerId?.toString() === sellerId.toString()
    );
    const subtotal = sellerItems.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);

    if (isDelivered) totalRevenue += subtotal;
    else if (order.status !== "cancelled") pendingOrdersCount += 1;
  });

  const commissionPercent = Number(globalSettings?.commissionPercent ?? 5);
  const commissionAmount = Math.round((totalRevenue * commissionPercent) / 100);
  const netReceivable = totalRevenue - commissionAmount;

  return (
    <div className="space-y-5">
      <SellerOverviewCards
        sellerName={sellerName}
        netReceivable={netReceivable}
        totalRevenue={totalRevenue}
        commissionPercent={commissionPercent}
        commissionAmount={commissionAmount}
        pendingOrdersCount={pendingOrdersCount}
        totalProducts={totalProducts}
      />

      <SellerRecentActivity recentOrders={recentOrders} />
    </div>
  );
}

export default function SellerDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
      <Suspense
        fallback={
          <div className="space-y-4 animate-pulse">
            <div className="h-24 bg-emerald-100/70 rounded-2xl w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div className="h-24 bg-white rounded-2xl border border-gray-100" />
              <div className="h-24 bg-white rounded-2xl border border-gray-100" />
              <div className="h-24 bg-white rounded-2xl border border-gray-100" />
            </div>
            <div className="h-44 bg-white rounded-2xl border border-gray-100" />
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  );
}
