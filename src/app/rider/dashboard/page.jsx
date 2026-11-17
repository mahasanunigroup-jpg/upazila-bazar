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
      .limit(100)
      .lean();

    return rawOrders.map((o) => {
      const deliveryCharge = Number(
        o.deliveryCharge || o.delivery_charge || o.shippingCost || 50
      );

      return {
        _id: o._id.toString(),
        orderId: o.orderId || o._id.toString().slice(-6).toUpperCase(),
        customer_name: o.customer_name || o.customerName || "সম্মানিত ক্রেতা",
        customer_phone: o.customer_phone || o.customerPhone || "",
        district: o.district || "",
        upazila: o.upazila || "",
        customer_address: o.customer_address || o.address || "",
        payment_method: o.payment_method || "Cash on Delivery",
        delivery_charge: deliveryCharge,
        total_amount: Number(o.total_amount || o.totalAmount || 0),
        rider_earning: deliveryCharge,
        deliveryStatus: o.deliveryStatus || "assigned",
        deliveryDateRaw: (o.updatedAt || o.createdAt || new Date()).toISOString(),
        deliveryDateFormatted: new Date(
          o.updatedAt || o.createdAt || new Date()
        ).toLocaleDateString("bn-BD", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        feedback:
          o.feedback && (o.feedback.isSubmitted || o.feedback.riderRating)
            ? {
                riderRating: Number(o.feedback.riderRating),
                riderComment: o.feedback.riderComment || "",
              }
            : null,
        items: (o.items || []).map((i, idx) => ({
          _id: i._id ? i._id.toString() : `item_${idx}`,
          name: i.name || i.title || "পণ্য",
          qty: Number(i.qty || i.quantity || 1),
          price: Number(i.price || 0),
          shopName: i.shopName || "উপজেলা স্টোর",
        })),
      };
    });
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
              ডেলিভারি ও আয়ের তালিকা লোড হচ্ছে...
            </p>
          </div>
        }
      >
        <RiderOrdersList />
      </Suspense>
    </div>
  );
}
