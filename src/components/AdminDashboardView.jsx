import Link from "next/link";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { buildLocationScope } from "@/lib/adminScope";

const ROLE_LABELS = {
  admin: "সুপার অ্যাডমিন (সারা দেশ)",
  super_admin: "সুপার অ্যাডমিন (সারা দেশ)",
  division_admin: "বিভাগীয় অ্যাডমিন",
  district_admin: "জেলা অ্যাডমিন",
  upazila_admin: "উপজেলা অ্যাডমিন",
  union_admin: "ইউনিয়ন অ্যাডমিন",
};

export default async function AdminDashboardView({ admin }) {
  await connectDB();

  // লগইন করা অ্যাডমিনের রোল ও এলাকা অনুযায়ী ডাটা ফিল্টার
  const locationFilter = buildLocationScope(admin);

  const [
    totalUsers,
    totalSellers,
    totalRiders,
    totalProducts,
    orders,
    recentUsersRaw,
  ] = await Promise.all([
    User.countDocuments({ role: "customer", ...locationFilter }),
    User.countDocuments({ role: "seller", ...locationFilter }),
    User.countDocuments({ role: "rider", ...locationFilter }),
    Product.countDocuments({ ...locationFilter }),
    Order.find({ ...locationFilter }).sort({ createdAt: -1 }).lean(),
    User.find({
      role: {
        $in: [
          "division_admin",
          "district_admin",
          "upazila_admin",
          "union_admin",
          "seller",
          "rider",
        ],
      },
      ...locationFilter,
    })
      .select("name phone role division district upazila union status isApproved createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  let totalSales = 0;
  let deliveredCount = 0;
  let pendingCount = 0;

  orders.forEach((o) => {
    const isDelivered =
      o.deliveryStatus === "delivered" || o.status === "delivered";
    if (isDelivered) {
      deliveredCount += 1;
      totalSales += Number(o.total_amount || 0);
    } else if (o.status !== "cancelled") {
      pendingCount += 1;
    }
  });

  const recentOrders = orders.slice(0, 5).map((o) => ({
    _id: o._id.toString(),
    orderId: o.orderId || o._id.toString().slice(-6).toUpperCase(),
    customerName: o.customer_name || "ক্রেতা",
    upazila: o.upazila || "",
    amount: o.total_amount || 0,
    status: o.deliveryStatus === "delivered" ? "delivered" : o.status || "pending",
    date: new Date(o.createdAt).toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "short",
    }),
  }));

  const recentPartners = recentUsersRaw.map((u) => ({
    _id: u._id.toString(),
    name: u.name || "নাম নেই",
    phone: u.phone || "",
    role: u.role,
    locationTag: u.union || u.upazila || u.district || u.division || "",
    isPending: u.isApproved === false || u.status === "pending",
  }));

  const areaTitle = [admin.union, admin.upazila, admin.district, admin.division]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      {/* বর্তমান অ্যাডমিনের স্তর ও এলাকার পরিচয় ব্যানার */}
      <div className="bg-white px-5 py-3.5 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            {ROLE_LABELS[admin.role] || "অ্যাডমিন প্যানেল"}
          </span>
          {areaTitle && (
            <span className="text-xs font-semibold text-gray-600 ml-2">
              📍 নির্ধারিত এলাকা: {areaTitle}
            </span>
          )}
        </div>
        {(admin.role === "admin" || admin.role === "super_admin") && (
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <Link href="/admin/division" className="text-slate-600 hover:text-emerald-600">বিভাগ</Link>
            <span>•</span>
            <Link href="/admin/district" className="text-slate-600 hover:text-emerald-600">জেলা</Link>
            <span>•</span>
            <Link href="/admin/upazila" className="text-slate-600 hover:text-emerald-600">উপজেলা</Link>
            <span>•</span>
            <Link href="/admin/union" className="text-slate-600 hover:text-emerald-600">ইউনিয়ন</Link>
          </div>
        )}
      </div>

      {/* আগের হুবহু ৪টি মেইন স্ট্যাটস কার্ড */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">মোট প্ল্যাটফর্ম বিক্রি</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            ৳{totalSales.toLocaleString("bn-BD")}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            ডেলিভারড: {deliveredCount} টি অর্ডার
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">চলমান অর্ডার</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {pendingCount} টি
          </p>
          <Link
            href="/admin/orders"
            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
          >
            সব অর্ডার দেখুন →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">সেলার ও রাইডার</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {totalSellers} / {totalRiders}
          </p>
          <Link
            href="/admin/users"
            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
          >
            অ্যাডমিন, সেলার ও রাইডার নিয়ন্ত্রণ →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">মোট পণ্য ও ক্রেতা</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {totalProducts} / {totalUsers}
          </p>
          <Link
            href="/admin/products"
            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
          >
            পণ্য মডারেশন →
          </Link>
        </div>
      </div>
      {/* আগের হুবহু নিচের ২ কলাম */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">সাম্প্রতিক অর্ডারসমূহ</h3>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-emerald-600 hover:underline"
            >
              সব দেখুন
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              এই এলাকায় এখনো কোনো অর্ডার নেই।
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
                      {order.customerName} {order.upazila ? `• ${order.upazila}` : ""}
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
              অধীনস্থ অ্যাডমিন, সেলার ও রাইডার
            </h3>
            <Link
              href="/admin/users"
              className="text-xs font-medium text-emerald-600 hover:underline"
            >
              ম্যানেজ করুন
            </Link>
          </div>

          {recentPartners.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              কোনো সদস্য পাওয়া যায়নি।
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentPartners.map((partner) => (
                <div
                  key={partner._id}
                  className="py-3 flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{partner.name}</p>
                    <p className="text-xs text-gray-500">
                      {partner.phone} {partner.locationTag ? `• ${partner.locationTag}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                      {partner.role}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        partner.isPending
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {partner.isPending ? "Pending" : "Active"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
