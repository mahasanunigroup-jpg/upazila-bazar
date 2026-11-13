import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import RiderOrdersView from "@/components/RiderOrdersView";

async function getRiderOrders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const riderId = (payload.userId || payload.id)?.toString();

    await connectDB();

    const rawOrders = await Order.find({ riderId: riderId })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    // শুধুমাত্র Plain JSON ডাটা রিটার্ন করা (যাতে ObjectId বা Date এরর না আসে)
    return rawOrders.map((o) => ({
      _id: o._id.toString(),
      orderId: o.orderId || o._id.toString().slice(-6).toUpperCase(),
      customer_name: o.customer_name || o.customerName || "সম্মানিত ক্রেতা",
      customer_phone: o.customer_phone || o.customerPhone || "",
      district: o.district || "",
      upazila: o.upazila || "",
      customer_address: o.customer_address || o.address || "",
      total_amount: Number(o.total_amount || o.totalAmount || 0),
      deliveryStatus: o.deliveryStatus || "assigned",
      items: (o.items || []).map((i, idx) => ({
        _id: i._id ? i._id.toString() : `item_${idx}`,
        name: i.name || i.title || "পণ্য",
        qty: Number(i.qty || i.quantity || 1),
        shopName: i.shopName || "উপজেলা স্টোর",
      })),
    }));
  } catch (error) {
    console.error("Rider Dashboard Error:", error);
    return [];
  }
}

async function RiderOrdersList() {
  const orders = await getRiderOrders();
  return <RiderOrdersView orders={orders} />;
}

export default function RiderDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <Suspense
        fallback={
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-emerald-600 font-semibold animate-pulse">
              ডেলিভারি তালিকা লোড হচ্ছে...
            </p>
          </div>
        }
      >
        <RiderOrdersList />
      </Suspense>
    </div>
  );
}
