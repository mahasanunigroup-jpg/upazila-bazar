import { Suspense } from "react";
import { connection } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import AdminOrderTable from "@/components/admin/AdminOrderTable";

export const metadata = {
  title: "সব অর্ডার মনিটর | অ্যাডমিন প্যানেল",
};

async function AdminOrdersLoader() {
  await connection();
  await connectDB();

  const [rawOrders, rawRiders] = await Promise.all([
    Order.find({}).sort({ createdAt: -1 }).lean(),
    User.find({ role: "rider", isBlocked: { $ne: true } })
      .select("_id name phone upazila")
      .lean(),
  ]);

  const orders = rawOrders.map((o) => ({
    _id: o._id.toString(),
    orderId: o.orderId || o._id.toString().slice(-6).toUpperCase(),
    customerName: o.customer_name || "ক্রেতা",
    customerPhone: o.customer_phone || "",
    upazila: o.upazila || "",
    totalAmount: o.total_amount || 0,
    riderId: o.riderId ? o.riderId.toString() : "",
    status: o.deliveryStatus === "delivered" ? "delivered" : o.status || "pending",
    date: new Date(o.createdAt).toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  }));

  const riders = rawRiders.map((r) => ({
    _id: r._id.toString(),
    name: r.name || "রাইডার",
    phone: r.phone || "",
  }));

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          সকল অর্ডার কন্ট্রোল (Order Management)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          মোট অর্ডার:{" "}
          <span className="font-semibold text-emerald-600">
            {orders.length} টি
          </span>{" "}
          • এখান থেকে সরাসরি রাইডার অ্যাসাইন ও অর্ডার স্ট্যাটাস নিয়ন্ত্রণ করুন
        </p>
      </div>

      <AdminOrderTable initialOrders={orders} riders={riders} />
    </>
  );
}

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="bg-white p-10 text-center rounded-xl border text-gray-500">
            সকল অর্ডার লোড হচ্ছে...
          </div>
        }
      >
        <AdminOrdersLoader />
      </Suspense>
    </div>
  );
}
