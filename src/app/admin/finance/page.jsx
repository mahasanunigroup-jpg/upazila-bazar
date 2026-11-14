import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Setting from "@/models/Setting";

export const metadata = {
  title: "আয় ও কমিশন হিসাব | অ্যাডমিন প্যানেল",
};

async function FinanceDataSection() {
  await connection();
  await connectDB();

  const [deliveredOrders, sellers, globalSettings] = await Promise.all([
    Order.find({
      $or: [{ deliveryStatus: "delivered" }, { status: "delivered" }],
    }).lean(),
    User.find({ role: "seller" }).select("name phone shopName upazila").lean(),
    Setting.collection.findOne({ key: "global_settings" }),
  ]);

  const commissionPercent = Number(globalSettings?.commissionPercent ?? 5);
  const COMMISSION_RATE = commissionPercent / 100;

  const sellerMap = new Map(
    sellers.map((s) => [
      s._id.toString(),
      {
        name: s.name,
        shopName: s.shopName || s.name,
        phone: s.phone || "নম্বর নেই",
        upazila: s.upazila || "",
        totalSales: 0,
        orderCount: 0,
      },
    ])
  );

  let grandTotalSales = 0;

  deliveredOrders.forEach((order) => {
    const countedSellersInOrder = new Set();

    (order.items || []).forEach((item) => {
      const sId = item.sellerId?.toString();
      const itemTotal = Number(item.price || 0) * Number(item.qty || 1);
      grandTotalSales += itemTotal;

      if (sId && sellerMap.has(sId)) {
        const record = sellerMap.get(sId);
        record.totalSales += itemTotal;
        if (!countedSellersInOrder.has(sId)) {
          record.orderCount += 1;
          countedSellersInOrder.add(sId);
        }
      }
    });
  });

  const totalCommission = Math.round(grandTotalSales * COMMISSION_RATE);
  const totalSellerPayable = grandTotalSales - totalCommission;

  const sellerList = Array.from(sellerMap.entries())
    .map(([id, data]) => {
      const commission = Math.round(data.totalSales * COMMISSION_RATE);
      return {
        id,
        ...data,
        commission,
        netPayable: data.totalSales - commission,
      };
    })
    .sort((a, b) => b.totalSales - a.totalSales);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          আয়, কমিশন ও সেলার পেমেন্ট হিসাব
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          প্ল্যাটফর্ম কমিশন হার:{" "}
          <span className="font-semibold text-emerald-600">
            {commissionPercent}%
          </span>{" "}
          • সেলারের নামের ওপর ক্লিক করে Daily, Monthly ও Yearly রিপোর্ট দেখুন
        </p>
      </div>

      {/* ৩টি আর্থিক সারাংশ কার্ড */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">মোট ডেলিভারড বিক্রি</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            ৳{grandTotalSales.toLocaleString("bn-BD")}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-200 bg-emerald-50/30">
          <p className="text-xs font-medium text-emerald-700">
            প্ল্যাটফর্ম কমিশন আয় ({commissionPercent}%)
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            ৳{totalCommission.toLocaleString("bn-BD")}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">
            সেলারদের নিট পাওনা (Net Payable)
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            ৳{totalSellerPayable.toLocaleString("bn-BD")}
          </p>
        </div>
      </div>

      {/* সেলার ভিত্তিক ক্লিকেবল টেবিল */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600">
              <th className="py-3 px-4">দোকান ও সেলার (ক্লিক করুন)</th>
              <th className="py-3 px-4">ডেলিভারড অর্ডার</th>
              <th className="py-3 px-4">মোট বিক্রি</th>
              <th className="py-3 px-4">কমিশন ({commissionPercent}%)</th>
              <th className="py-3 px-4 text-right">সেলার পাওনা</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sellerList.map((seller) => (
              <tr key={seller.id} className="hover:bg-gray-50 transition">
                <td className="py-3 px-4">
                  <Link
                    href={`/admin/finance/${seller.id}`}
                    className="group block"
                  >
                    <p className="font-semibold text-blue-600 group-hover:underline">
                      {seller.shopName} →
                    </p>
                    <p className="text-xs text-gray-500">
                      {seller.name} • {seller.phone}
                    </p>
                  </Link>
                </td>
                <td className="py-3 px-4">{seller.orderCount} টি</td>
                <td className="py-3 px-4 font-medium">৳{seller.totalSales}</td>
                <td className="py-3 px-4 text-emerald-600 font-medium">
                  - ৳{seller.commission}
                </td>
                <td className="py-3 px-4 text-right font-bold text-blue-600">
                  ৳{seller.netPayable}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminFinancePage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white p-10 text-center rounded-xl border text-gray-500">
          আর্থিক হিসাব লোড হচ্ছে...
        </div>
      }
    >
      <FinanceDataSection />
    </Suspense>
  );
}
