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
      .select("orderId customer_name items createdAt")
      .sort({ createdAt: -1 })
      .lean(),
    Setting.collection.findOne(
      { key: "global_settings" },
      { projection: { commissionPercent: 1 } }
    ),
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
        month: "short",
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
    <div className="space-y-4 sm:space-y-5">
      {/* স্লিম ও স্মার্ট হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3.5 sm:p-5 rounded-2xl shadow-2xs border border-gray-100">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base sm:text-xl font-bold text-gray-800">
              আয় ও কমিশন বিবরণী
            </h1>
            <span className="text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
              কমিশন: {commissionPercent}%
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
            শুধুমাত্র ডেলিভারি সম্পন্ন হওয়া অর্ডারের হিসাব
          </p>
        </div>

        <Link
          href="/seller/dashboard"
          className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition w-fit whitespace-nowrap shrink-0"
        >
          ← ড্যাশবোর্ড
        </Link>
      </div>

      {/* ৩টি স্মার্ট সামারি কার্ড */}
            {/* ৩টি স্মার্ট সামারি কার্ড (মোবাইলে ১ কলাম, বড় ডিভাইসে ৩ কলাম) */}
            {/* ১. ওপরের ৩টি সামারি কার্ড: মোবাইলে ১, ট্যাবে ২, ল্যাপটপে ৩ কলাম */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-2xs border border-emerald-200 bg-emerald-50/25">
          <p className="text-[11px] sm:text-xs font-semibold text-emerald-700">
            আপনার নিট পাওনা (Net)
          </p>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5">
            ৳{grandNet.toLocaleString("bn-BD")}
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-2xs border border-gray-100">
          <p className="text-[11px] sm:text-xs font-medium text-gray-500">
            মোট বিক্রি
          </p>
          <p className="text-lg sm:text-xl font-extrabold text-gray-800 mt-0.5">
            ৳{grandSales.toLocaleString("bn-BD")}
          </p>
        </div>

        <div className="sm:col-span-2 lg:col-span-1 bg-white p-3.5 sm:p-4 rounded-2xl shadow-2xs border border-red-100 bg-red-50/20">
          <p className="text-[11px] sm:text-xs font-medium text-red-600">
            কমিশন ({commissionPercent}%)
          </p>
          <p className="text-lg sm:text-xl font-extrabold text-red-600 mt-0.5">
            - ৳{grandCommission.toLocaleString("bn-BD")}
          </p>
        </div>
      </div>

      {/* ২. নিচের সব অর্ডার কার্ড: মোবাইলে ১, ট্যাবে ২, ল্যাপটপে ৩ কলাম */}
      {breakdownList.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 py-10 text-center text-xs sm:text-sm text-gray-500">
          এখনো কোনো ডেলিভারড অর্ডার নেই।
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5 xl:hidden">
            {breakdownList.map((row) => (
              <div
                key={row._id}
                className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs flex flex-col justify-between gap-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="min-w-0">
                    <p className="font-extrabold text-gray-800 truncate">#{row.orderId}</p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">
                      {row.date} • {row.customerName} ({row.itemCount} পণ্য)
                    </p>
                  </div>
                  <span className="font-extrabold text-sm text-emerald-600 whitespace-nowrap shrink-0">
                    +৳{row.net.toLocaleString("bn-BD")}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 text-[11px] text-gray-500">
                  <span>বিক্রি: ৳{row.sales.toLocaleString("bn-BD")}</span>
                  <span className="text-red-500">
                    কমিশন: -৳{row.commission.toLocaleString("bn-BD")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* বড় ডেস্কটপ টেবিল ভিউ */}
          <div className="hidden xl:block bg-white rounded-2xl shadow-2xs border border-gray-100 overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-600">
                  <th className="py-3 px-4">অর্ডার আইডি ও তারিখ</th>
                  <th className="py-3 px-4">ক্রেতা</th>
                  <th className="py-3 px-4">মোট বিক্রি</th>
                  <th className="py-3 px-4">কমিশন ({commissionPercent}%)</th>
                  <th className="py-3 px-4 text-right">নিট আয়</th>
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
                    <td className="py-3 px-4 font-medium">
                      ৳{row.sales.toLocaleString("bn-BD")}
                    </td>
                    <td className="py-3 px-4 text-red-500 font-medium">
                      - ৳{row.commission.toLocaleString("bn-BD")}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      ৳{row.net.toLocaleString("bn-BD")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
}

export default function SellerEarningsPage() {
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <Suspense
        fallback={
          <div className="bg-white p-10 text-center rounded-2xl border border-gray-100 text-xs sm:text-sm text-gray-500">
            আয়ের বিস্তারিত হিসাব লোড হচ্ছে...
          </div>
        }
      >
        <EarningsDetailsContent />
      </Suspense>
    </div>
  );
}
