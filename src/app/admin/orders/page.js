import { Suspense } from "react";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import AdminRiderAssign from "@/components/AdminRiderAssign";
import UniversalPrintButtons from "@/components/invoice/UniversalPrintButtons";
import { verifyAdmin } from "@/lib/adminAuth";
import { buildLocationScope } from "@/lib/adminScope";

async function getAdminData() {
  const admin = await verifyAdmin();
  if (!admin) redirect("/unauthorized");

  try {
    await connectDB();

    const locationFilter = buildLocationScope(admin);

    const [rawOrders, rawRiders] = await Promise.all([
      Order.find(locationFilter).sort({ createdAt: -1 }).limit(50).lean(),
      User.find({ role: "rider", ...locationFilter })
        .select("name phone upazila district")
        .lean(),
    ]);

    const orders = rawOrders.map((o) => ({
      ...o,
      _id: o._id.toString(),
      customerId: o.customerId ? o.customerId.toString() : null,
      orderId: o.orderId || o._id.toString().slice(-6).toUpperCase(),
      customer_name: o.customer_name || o.customerName || "ক্রেতা",
      customer_phone: o.customer_phone || o.customerPhone || "",
      total_amount: o.total_amount || o.totalAmount || 0,
      riderId: o.riderId ? o.riderId.toString() : "",
      createdAt: o.createdAt ? o.createdAt.toISOString() : null,
      updatedAt: o.updatedAt ? o.updatedAt.toISOString() : null,
      items: (o.items || []).map((i, idx) => ({
        ...i,
        _id: i._id ? i._id.toString() : `item_${idx}`,
        productId: i.productId ? i.productId.toString() : null,
        sellerId: i.sellerId ? i.sellerId.toString() : null,
        name: i.name || i.title || "পণ্য",
        qty: i.qty || i.quantity || 1,
        price: Number(i.price || 0),
        shopName: i.shopName || "উপজেলা ভেরিফায়েড স্টোর",
      })),
    }));

    const riders = rawRiders.map((r) => ({
      ...r,
      _id: r._id.toString(),
    }));

    return { orders, riders };
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    return { orders: [], riders: [] };
  }
}

async function AdminOrdersContent() {
  const { orders, riders } = await getAdminData();

  return (
    <>
      {/* হেডার অংশ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            অ্যাডমিন অর্ডার ও রাইডার ম্যানেজমেন্ট
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            সেলার প্যাক করা অর্ডারগুলোতে এলাকা অনুযায়ী রাইডার অ্যাসাইন করুন
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm font-semibold">
          <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
            মোট অর্ডার: {orders.length}
          </span>
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200">
            সক্রিয় রাইডার: {riders.length}
          </span>
        </div>
      </div>

      {/* ১. মোবাইল ও ট্যাবলেট ভিউ (স্ক্রল ছাড়া রেসপনসিভ কার্ড) */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3"
          >
            {/* কার্ডের উপরের অংশ */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div>
                <span className="font-bold text-emerald-700 text-base">
                  #{order.orderId}
                </span>
                <p className="font-semibold text-gray-800 text-sm mt-0.5">
                  {order.customer_name} ({order.customer_phone})
                </p>
                <p className="text-xs text-gray-500">
                  {order.upazila}{order.district ? `, ${order.district}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 text-base">৳{order.total_amount}</p>
                <span
                  className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    order.deliveryStatus === "delivered"
                      ? "bg-green-100 text-green-800"
                      : order.deliveryStatus === "assigned"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.deliveryStatus || "unassigned"}
                </span>
              </div>
            </div>

            {/* পণ্যের তালিকা */}
            <div className="bg-gray-50 p-2.5 rounded-lg space-y-1">
              {order.items.map((item) => (
                <div key={item._id} className="text-xs flex justify-between items-center">
                  <span className="text-gray-700 font-medium">
                    {item.name} (x{item.qty})
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white border text-gray-600 text-[11px]">
                    {item.itemStatus || "pending"}
                  </span>
                </div>
              ))}
            </div>

            {/* রাইডার অ্যাসাইন ও প্রিন্ট বাটন */}
            <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="w-full sm:w-auto">
                <AdminRiderAssign
                  orderId={order._id}
                  currentRiderId={order.riderId}
                  riders={riders}
                />
              </div>
              <div className="flex justify-end">
                <UniversalPrintButtons order={order} role="admin" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ২. ডেস্কটপ ভিউ (আগের প্রফেশনাল টেবিল ডিজাইন) */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-600 uppercase border-b">
              <th className="p-4">অর্ডার আইডি</th>
              <th className="p-4">ক্রেতা ও ঠিকানা</th>
              <th className="p-4">পণ্য ও সেলার স্ট্যাটাস</th>
              <th className="p-4">মোট বিল</th>
              <th className="p-4">ডেলিভারি স্ট্যাটাস</th>
              <th className="p-4">রাইডার অ্যাসাইন</th>
              <th className="p-4">প্রিন্ট</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50/50">
                <td className="p-4 font-bold text-emerald-700 whitespace-nowrap">
                  #{order.orderId}
                </td>
                <td className="p-4">
                  <p className="font-semibold text-gray-800">{order.customer_name}</p>
                  <p className="text-xs text-gray-500">{order.customer_phone}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {order.upazila}{order.district ? `, ${order.district}` : ""}
                  </p>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div key={item._id} className="text-xs flex items-center gap-2">
                        <span>{item.name} (x{item.qty})</span>
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                          {item.itemStatus || "pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="p-4 font-bold text-gray-800 whitespace-nowrap">
                  ৳{order.total_amount}
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      order.deliveryStatus === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.deliveryStatus === "assigned"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.deliveryStatus || "unassigned"}
                  </span>
                </td>
                <td className="p-4">
                  <AdminRiderAssign
                    orderId={order._id}
                    currentRiderId={order.riderId}
                    riders={riders}
                  />
                </td>
                <td className="p-4">
                  <UniversalPrintButtons order={order} role="admin" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function AdminOrdersPage() {
  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6">
      <Suspense fallback={<p className="text-center p-10 text-emerald-600 animate-pulse">অ্যাডমিন প্যানেল লোড হচ্ছে...</p>}>
        <AdminOrdersContent />
      </Suspense>
    </div>
  );
}
