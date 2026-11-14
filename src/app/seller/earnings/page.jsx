import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import Link from "next/link";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Setting from "@/models/Setting";

export const metadata = {
  title: "আয় ও কমিশন বিবরণী | উপজেলা বাজার",
};

async function EarningsDetailsContent() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  let sellerId;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "seller" && payload.role !== "admin") redirect("/");
    sellerId = payload.userId || payload.id;
  } catch {
    redirect("/login");
  }

  await connectDB();
  const sellerObjectId = mongoose.Types.ObjectId.isValid(sellerId)
    ? new mongoose.Types.ObjectId(sellerId)
    : sellerId;

  const [orders, globalSettings] = await Promise.all([
    Order.find({
      "items.sellerId": sellerObjectId,
      $or: [{ deliveryStatus: "delivered" }, { status: "delivered" }],
    })
      .sort({ createdAt: -1 })
      .lean(),
    Setting.collection.findOne({ key: "global_settings" }),
  ]);

  const commissionPercent = Number(globalSettings?.commissionPercent ?? 5);

  const breakdownList = orders.map((order) => {
    const sellerItems = (order.items || []).filter(
      (item) => item.sellerId?.toString() === sellerId.toString()
    );
    const orderSales = sellerItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0
    );
    const orderCommission = Math.round((orderSales * commissionPercent) / 100);
    const orderNet = orderSales - orderCommission;

    return {
      _id: order._id.toString(),
      orderId: order.orderId || order._id.toString().slice(-6).toUpperCase(),
      customerName: order.customer_name || "ক্রেতা",
      date: new Date(order.createdAt).toLocaleDateString("bn-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      itemCount: sellerItems.length,
      sales: orderSales,
      commission: orderCommission,
      net: orderNet,
    };
  });

  const grandSales = breakdownList.reduce((sum, item) => sum + item.sales, 0);
  const grandCommission = breakdownList.reduce(
    (sum, item) => sum + item.commission,
    0
  );
  const grandNet = breakdownList.reduce((sum, item) => sum + item.net, 0);
  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            আয় ও কমিশন বিবরণী (Earnings)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            প্ল্যাটফর্ম কমিশন হার:{" "}
            <span className="font-semibold text-emerald-600">
              {commissionPercent}%
            </span>{" "}
            (শুধুমাত্র ডেলিভারড অর্ডার)
          </p>
        </div>

        <Link
          href="/seller/dashboard"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition w-fit"
        >
          ← ড্যাশবোর্ডে ফিরুন
        </Link>
      </div>

      {/* ৩টি সামারি কার্ড */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">মোট বিক্রি (ডেলিভারড)</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            ৳{grandSales.toLocaleString("bn-BD")}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-red-100 bg-red-50/20">
          <p className="text-xs font-medium text-red-600">
            প্ল্যাটফর্ম কমিশন ({commissionPercent}%)
          </p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            - ৳{grandCommission.toLocaleString("bn-BD")}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-200 bg-emerald-50/30">
          <p className="text-xs font-medium text-emerald-700">
            আপনার নিট পাওনা (Net Payable)
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            ৳{grandNet.toLocaleString("bn-BD")}
          </p>
        </div>
      </div>

      {/* অর্ডার ভিত্তিক বিস্তারিত টেবিল */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {breakdownList.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-sm">
            এখনো কোনো ডেলিভারড অর্ডার নেই।
          </p>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600">
                <th className="py-3.5 px-4">অর্ডার আইডি ও তারিখ</th>
                <th className="py-3.5 px-4">ক্রেতা</th>
                <th className="py-3.5 px-4">মোট বিক্রি</th>
                <th className="py-3.5 px-4">কমিশন ({commissionPercent}%)</th>
                <th className="py-3.5 px-4 text-right">নিট আয়</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {breakdownList.map((row) => (
                <tr key={row._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-gray-800">#{row.orderId}</p>
                    <p className="text-xs text-gray-400">
                      {row.date} • {row.itemCount} টি পণ্য
                    </p>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{row.customerName}</td>
                  <td className="py-3 px-4 font-medium">৳{row.sales}</td>
                  <td className="py-3 px-4 text-red-500 font-medium">
                    - ৳{row.commission}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600">
                    ৳{row.net}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function SellerEarningsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="bg-white p-12 text-center rounded-xl border text-gray-500">
            আয়ের বিস্তারিত হিসাব লোড হচ্ছে...
          </div>
        }
      >
        <EarningsDetailsContent />
      </Suspense>
    </div>
  );
}
