import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import Link from "next/link";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";

export const metadata = {
  title: "সেলার ড্যাশবোর্ড | উপজেলা বাজার",
};

async function DashboardContent() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  let sellerId;
  let sellerName = "সেলার";
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "seller" && payload.role !== "admin") {
      redirect("/");
    }
    sellerId = payload.userId || payload.id;
    sellerName = payload.name || "সেলার";
  } catch {
    redirect("/login");
  }

  await connectDB();

  const sellerObjectId = mongoose.Types.ObjectId.isValid(sellerId)
    ? new mongoose.Types.ObjectId(sellerId)
    : sellerId;

  const [products, orders] = await Promise.all([
    Product.find({ sellerId: sellerObjectId }).sort({ createdAt: -1 }).lean(),
    Order.find({ "items.sellerId": sellerObjectId })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => (p.stock || 0) <= 5);

  let totalRevenue = 0;
  let pendingOrdersCount = 0;
  let deliveredOrdersCount = 0;

  const recentOrders = orders.slice(0, 5).map((order) => {
    const sellerItems = (order.items || []).filter(
      (item) => item.sellerId?.toString() === sellerId.toString()
    );
    const sellerSubtotal = sellerItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0
    );

    return {
      _id: order._id.toString(),
      orderId: order.orderId || order._id.toString().slice(-6).toUpperCase(),
      customerName: order.customer_name || "ক্রেতা",
      status:
        order.deliveryStatus === "delivered"
          ? "delivered"
          : order.status || "pending",
      amount: sellerSubtotal,
      itemCount: sellerItems.length,
      date: new Date(order.createdAt).toLocaleDateString("bn-BD", {
        day: "numeric",
        month: "short",
      }),
    };
  });

  orders.forEach((order) => {
    const isDelivered =
      order.deliveryStatus === "delivered" || order.status === "delivered";
    const isCancelled = order.status === "cancelled";

    const sellerItems = (order.items || []).filter(
      (item) => item.sellerId?.toString() === sellerId.toString()
    );
    const sellerSubtotal = sellerItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0
    );

    if (isDelivered) {
      deliveredOrdersCount += 1;
      totalRevenue += sellerSubtotal;
    } else if (!isCancelled) {
      pendingOrdersCount += 1;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            স্বাগতম, {sellerName}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            আপনার দোকানের সারসংক্ষেপ এবং অর্ডার ও পণ্যের নিয়ন্ত্রণ কেন্দ্র
          </p>
        </div>

        <Link
          href="/seller/add-product"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
        >
          + নতুন পণ্য যোগ করুন
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">মোট বিক্রি (ডেলিভারড)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            ৳{totalRevenue.toLocaleString("bn-BD")}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            সম্পন্ন অর্ডার: {deliveredOrdersCount} টি
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">চলমান / পেন্ডিং অর্ডার</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {pendingOrdersCount} টি
          </p>
          <Link
            href="/seller/orders"
            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
          >
            অর্ডারগুলো দেখুন →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">মোট তালিকাভুক্ত পণ্য</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {totalProducts} টি
          </p>
          <Link
            href="/seller/products"
            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
          >
            পণ্য ম্যানেজ করুন →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">লো-স্টক / স্টক শেষ</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              lowStockProducts.length > 0 ? "text-red-600" : "text-gray-800"
            }`}
          >
            {lowStockProducts.length} টি
          </p>
          <p className="text-xs text-gray-400 mt-1">৫টি বা তার কম স্টক</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/seller/orders"
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-emerald-500 transition flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
            📦
          </div>
          <div>
            <h2 className="font-bold text-gray-800">অর্ডার ও ডেলিভারি</h2>
            <p className="text-xs text-gray-500">অর্ডার প্যাক ও রাইডার পাঠান</p>
          </div>
        </Link>

        <Link
          href="/seller/products"
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-emerald-500 transition flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
            🛍️
          </div>
          <div>
            <h2 className="font-bold text-gray-800">আমার পণ্যসমূহ</h2>
            <p className="text-xs text-gray-500">দাম, স্টক এডিট ও ডিলিট</p>
          </div>
        </Link>

        <Link
          href="/seller/add-product"
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-emerald-500 transition flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-2xl">
            ➕
          </div>
          <div>
            <h2 className="font-bold text-gray-800">নতুন পণ্য যোগ</h2>
            <p className="text-xs text-gray-500">নতুন পণ্য আপলোড করুন</p>
          </div>
        </Link>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">সাম্প্রতিক অর্ডারসমূহ</h3>
            <Link
              href="/seller/orders"
              className="text-xs font-medium text-emerald-600 hover:underline"
            >
              সব দেখুন
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              এখনো কোনো অর্ডার আসেনি।
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="py-3 flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      #{order.orderId}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        ({order.date})
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.customerName} • {order.itemCount} টি আইটেম
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-800">৳{order.amount}</p>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        order.status === "delivered"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">
              লো-স্টক সতর্কতা (Low Stock Alert)
            </h3>
            <Link
              href="/seller/products"
              className="text-xs font-medium text-emerald-600 hover:underline"
            >
              স্টক আপডেট করুন
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-6 text-center text-sm text-emerald-600 bg-emerald-50/50 rounded-lg">
              ✅ সব পণ্যের পর্যাপ্ত স্টক রয়েছে!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lowStockProducts.slice(0, 5).map((prod) => (
                <div
                  key={prod._id.toString()}
                  className="py-3 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.images?.[0] || prod.image || "/placeholder.png"}
                      alt={prod.title || prod.name}
                      className="w-10 h-10 rounded object-cover border"
                    />
                    <div>
                      <p className="font-medium text-gray-800 line-clamp-1">
                        {prod.title || prod.name}
                      </p>
                      <p className="text-xs text-gray-500">দাম: ৳{prod.price}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                      (prod.stock || 0) <= 0
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {(prod.stock || 0) <= 0
                      ? "স্টক শেষ (0)"
                      : `বাকি: ${prod.stock} টি`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SellerDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="bg-white p-12 text-center rounded-xl border border-gray-100 text-gray-500">
            সেলার ড্যাশবোর্ড লোড হচ্ছে...
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  );
}
