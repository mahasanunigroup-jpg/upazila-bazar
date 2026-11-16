import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Setting from "@/models/Setting";
import Expense from "@/models/Expense";
import { verifyAdmin } from "@/lib/adminAuth";
import { buildLocationScope } from "@/lib/adminScope";
import RegionalExpenseSection from "@/components/admin/RegionalExpenseSection";

export const metadata = {
  title: "আয় ও কমিশন হিসাব | অ্যাডমিন প্যানেল",
};

async function FinanceDataSection() {
  await connection();
  const admin = await verifyAdmin();
  if (!admin) redirect("/unauthorized");

  await connectDB();

  const isSuper = admin.role === "admin" || admin.role === "super_admin";
  const locationFilter = buildLocationScope(admin);

  const [deliveredOrders, sellers, globalSettings, rawExpenses] = await Promise.all([
    Order.find({
      ...locationFilter,
      $or: [{ deliveryStatus: "delivered" }, { status: "delivered" }],
    }).lean(),
    User.find({ role: "seller", ...locationFilter })
      .select("name phone shopName upazila")
      .lean(),
    Setting.collection.findOne({ key: "global_settings" }),
    Expense.find(locationFilter).sort({ createdAt: -1 }).limit(30).lean(),
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

  // অনুমোদিত ব্যয় ও নিট লাভ হিসাব
  const approvedExpenses = rawExpenses
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const netProfit = totalCommission - approvedExpenses;

  const expenses = rawExpenses.map((e) => ({
    _id: e._id.toString(),
    type: e.type || "expense",
    title: e.title,
    amount: e.amount,
    partyName: e.partyName || e.note || "উল্লেখ নেই", // পুরনো এন্ট্রির জন্য নোট ব্যাকআপ
    partyPhone: e.partyPhone || "",
    note: e.note || "",
    division: e.division || "",
    district: e.district || "",
    upazila: e.upazila || "",
    union: e.union || "",
    createdBy: e.createdBy?.toString() || "",
    creatorName: e.creatorName || "",
    creatorPhone: e.creatorPhone || "",
    creatorRole: e.creatorRole || "",
    status: e.status,
    createdAt: e.createdAt ? e.createdAt.toISOString() : "",
  }));


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
          আয়, ব্যয় ও কমিশন হিসাব
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          প্ল্যাটফর্ম কমিশন হার:{" "}
          <span className="font-semibold text-emerald-600">
            {commissionPercent}%
          </span>{" "}
          • সেলারের নামের ওপর ক্লিক করে Daily, Monthly ও Yearly রিপোর্ট দেখুন
        </p>
      </div>

      {/* আর্থিক সারাংশ কার্ড (আয়, ব্যয় ও নিট লাভসহ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">মোট ডেলিভারড বিক্রি</p>
          <p className="text-xl font-bold text-gray-800 mt-1">
            ৳{grandTotalSales.toLocaleString("bn-BD")}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-200 bg-emerald-50/30">
          <p className="text-xs font-medium text-emerald-700">
            মোট কমিশন আয় ({commissionPercent}%)
          </p>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            ৳{totalCommission.toLocaleString("bn-BD")}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-red-200 bg-red-50/30">
          <p className="text-xs font-medium text-red-700">অনুমোদিত ব্যয়</p>
          <p className="text-xl font-bold text-red-600 mt-1">
            - ৳{approvedExpenses.toLocaleString("bn-BD")}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-200 bg-indigo-50/30">
          <p className="text-xs font-medium text-indigo-700">নিট লাভ (Net Profit)</p>
          <p className="text-xl font-bold text-indigo-600 mt-1">
            ৳{netProfit.toLocaleString("bn-BD")}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">
            সেলারদের নিট পাওনা
          </p>
          <p className="text-xl font-bold text-blue-600 mt-1">
            ৳{totalSellerPayable.toLocaleString("bn-BD")}
          </p>
        </div>
      </div>

      {/* সেলার ভিত্তিক ক্লিকেবল টেবিল */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[650px] text-left border-collapse text-sm">
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

      {/* আঞ্চলিক ব্যয় এন্ট্রি ও অনুমোদন সেকশন */}
      <RegionalExpenseSection
        initialExpenses={expenses}
        currentAdminId={admin._id}
        isSuper={isSuper}
      />
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
