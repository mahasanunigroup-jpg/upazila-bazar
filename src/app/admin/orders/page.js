import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import AdminRiderAssign from "@/components/AdminRiderAssign";

async function getAdminData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "admin") redirect("/unauthorized");

    await connectDB();

    // প্যারালাল কুয়েরি: অর্ডার এবং রাইডার একসাথে লোড হবে (সুপার-ফাস্ট)
    const [rawOrders, rawRiders] = await Promise.all([
      Order.find({}).sort({ createdAt: -1 }).limit(50).lean(),
      User.find({ role: "rider" }).select("name phone upazila district").lean(),
    ]);

    const orders = rawOrders.map((o) => ({
      ...o,
      _id: o._id.toString(),
      orderId: o.orderId || o._id.toString().slice(-6).toUpperCase(),
      customer_name: o.customer_name || o.customerName || "ক্রেতা",
      customer_phone: o.customer_phone || o.customerPhone || "",
      total_amount: o.total_amount || o.totalAmount || 0,
      riderId: o.riderId ? o.riderId.toString() : "",
      items: (o.items || []).map((i, idx) => ({
        ...i,
        _id: i._id ? i._id.toString() : `item_${idx}`,
        name: i.name || i.title || "পণ্য",
        qty: i.qty || i.quantity || 1,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">অ্যাডমিন অর্ডার ও রাইডার ম্যানেজমেন্ট</h1>
          <p className="text-sm text-gray-500 mt-1">
            সেলার প্যাক করা অর্ডারগুলোতে এলাকা অনুযায়ী রাইডার অ্যাসাইন করুন
          </p>
        </div>
        <div className="flex gap-3 text-sm font-semibold">
          <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
            মোট অর্ডার: {orders.length}
          </span>
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200">
            সক্রিয় রাইডার: {riders.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-600 uppercase border-b">
              <th className="p-4">অর্ডার আইডি</th>
              <th className="p-4">ক্রেতা ও ঠিকানা</th>
              <th className="p-4">পণ্য ও সেলার স্ট্যাটাস</th>
              <th className="p-4">মোট বিল</th>
              <th className="p-4">ডেলিভারি স্ট্যাটাস</th>
              <th className="p-4">রাইডার অ্যাসাইন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50/50">
                <td className="p-4 font-bold text-emerald-700">#{order.orderId}</td>
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
                <td className="p-4 font-bold text-gray-800">৳{order.total_amount}</td>
                <td className="p-4">
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <Suspense fallback={<p className="text-center p-10 text-emerald-600 animate-pulse">অ্যাডমিন প্যানেল লোড হচ্ছে...</p>}>
        <AdminOrdersContent />
      </Suspense>
    </div>
  );
}
