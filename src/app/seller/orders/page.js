import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import SellerOrdersView from "@/components/SellerOrdersView";

async function getSellerDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const sellerId = (payload.userId || payload.id)?.toString();

    await connectDB();

    const [rawOrders, rawRiders] = await Promise.all([
      Order.find({ "items.sellerId": sellerId }).sort({ createdAt: -1 }).limit(50).lean(),
      User.find({ role: "rider" }).select("name phone upazila district").lean(),
    ]);

    const orders = rawOrders.map((order) => {
      const myItems = (order.items || []).filter(
        (item) => item.sellerId?.toString() === sellerId
      );

      let myTotal = 0;
      const formattedItems = myItems.map((item, idx) => {
        const itemPrice = Number(item.price) || 0;
        const itemQty = Number(item.qty || item.quantity) || 1;
        myTotal += itemPrice * itemQty;

        return {
          _id: item._id ? item._id.toString() : `item_${idx}`,
          name: item.name || item.title || item.productName || "পণ্য #" + (idx + 1),
          qty: itemQty,
          price: itemPrice,
          itemStatus: item.itemStatus || order.status || "pending",
        };
      });

      const riderIdStr = order.riderId ? order.riderId.toString() : "";
      
      // রাইডার অ্যাসাইন করা থাকলে স্ট্যাটাস সিঙ্ক রাখা
      let effectiveDeliveryStatus = order.deliveryStatus || "unassigned";
      if (riderIdStr && effectiveDeliveryStatus === "unassigned") {
        effectiveDeliveryStatus = "assigned";
      }

      const orderPackingStatus =
        effectiveDeliveryStatus === "delivered"
          ? "delivered"
          : order.status === "cancelled"
          ? "cancelled"
          : formattedItems?.itemStatus || "pending";

      return {
        _id: order._id.toString(),
        orderId: order.orderId || order._id.toString().slice(-6).toUpperCase(),
        customer_name: order.customer_name || order.customerName || "সম্মানিত ক্রেতা",
        customer_phone: order.customer_phone || order.customerPhone || "নম্বর নেই",
        district: order.district || "",
        upazila: order.upazila || "",
        customer_address: order.customer_address || order.address || "",
        deliveryStatus: effectiveDeliveryStatus,
        riderId: riderIdStr,
        createdAt: order.createdAt ? order.createdAt.toISOString() : new Date().toISOString(),
        myItems: formattedItems,
        myTotal,
        orderPackingStatus,
      };
    });

    const riders = rawRiders.map((r) => ({
      ...r,
      _id: r._id.toString(),
    }));

    return { orders, riders };
  } catch (error) {
    console.error("Seller Dashboard Error:", error);
    return { orders: [], riders: [] };
  }
}

async function OrdersList() {
  const { orders, riders } = await getSellerDashboardData();
  return <SellerOrdersView orders={orders} riders={riders} />;
}

export default function SellerOrdersPage() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <Suspense
        fallback={
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-emerald-600 font-semibold animate-pulse">
              সেলার ড্যাশবোর্ড লোড হচ্ছে...
            </p>
          </div>
        }
      >
        <OrdersList />
      </Suspense>
    </div>
  );
}
