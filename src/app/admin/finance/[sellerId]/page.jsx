import { Suspense } from "react";
import { connection } from "next/server";
import mongoose from "mongoose";
import Link from "next/link";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Setting from "@/models/Setting";
import SellerFinanceReportClient from "@/components/admin/SellerFinanceReportClient";

export const metadata = {
  title: "সেলার বিক্রয় ও কমিশন রিপোর্ট | অ্যাডমিন প্যানেল",
};

async function SellerFinanceLoader({ params }) {
  await connection();
  const { sellerId } = await params;

  if (!mongoose.Types.ObjectId.isValid(sellerId)) {
    return <div className="p-6 text-red-600">অবৈধ সেলার আইডি!</div>;
  }

  await connectDB();
  const sellerObjId = new mongoose.Types.ObjectId(sellerId);

  const [seller, orders, globalSettings] = await Promise.all([
    User.findById(sellerObjId).select("name shopName phone upazila").lean(),
    Order.find({
      "items.sellerId": sellerObjId,
      $or: [{ deliveryStatus: "delivered" }, { status: "delivered" }],
    })
      .sort({ createdAt: -1 })
      .lean(),
    Setting.collection.findOne({ key: "global_settings" }),
  ]);

  if (!seller) {
    return <div className="p-6 text-red-600">সেলার পাওয়া যায়নি!</div>;
  }

  const commissionPercent = Number(globalSettings?.commissionPercent ?? 5);

  const serializedOrders = orders.map((order) => {
    const sellerItems = (order.items || []).filter(
      (item) => item.sellerId?.toString() === sellerId
    );
    const sales = sellerItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
      0
    );

    return {
      _id: order._id.toString(),
      orderId: order.orderId || order._id.toString().slice(-6).toUpperCase(),
      customerName: order.customer_name || "ক্রেতা",
      itemCount: sellerItems.length,
      sales,
      createdAt: order.createdAt.toISOString(),
    };
  });

  const sellerInfo = {
    name: seller.name || "সেলার",
    shopName: seller.shopName || seller.name || "দোকান",
    phone: seller.phone || "নম্বর নেই",
    upazila: seller.upazila || "",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            🏪 {sellerInfo.shopName} ({sellerInfo.name})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            ফোন: {sellerInfo.phone} {sellerInfo.upazila ? `• ${sellerInfo.upazila}` : ""} • কমিশন হার: {commissionPercent}%
          </p>
        </div>

        <Link
          href="/admin/finance"
          className="px-4 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg w-fit"
        >
          ← সব সেলারের হিসাবে ফিরুন
        </Link>
      </div>

      <SellerFinanceReportClient
        orders={serializedOrders}
        commissionPercent={commissionPercent}
      />
    </div>
  );
}

export default function SellerFinanceDetailPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="bg-white p-10 text-center rounded-xl border text-gray-500">
          সেলারের বিস্তারিত রিপোর্ট লোড হচ্ছে...
        </div>
      }
    >
      <SellerFinanceLoader params={params} />
    </Suspense>
  );
}
