import React from "react";
import Link from "next/link";

export default function SellerRecentActivity({ recentOrders = [] }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 p-3.5 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 text-xs sm:text-sm">
          সাম্প্রতিক অর্ডারসমূহ
        </h3>
        <Link
          href="/seller/orders"
          className="text-[11px] sm:text-xs font-semibold text-emerald-600 hover:underline"
        >
          সব দেখুন →
        </Link>
      </div>

      {recentOrders.length === 0 ? (
        <div className="py-5 text-center bg-gray-50/70 rounded-xl border border-dashed border-gray-200">
          <p className="text-xs text-gray-500">এখনো কোনো অর্ডার আসেনি।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {recentOrders.map((order) => (
            <Link
              key={order._id}
              href="/seller/orders"
              className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-emerald-50/30 hover:border-emerald-200 transition flex items-center justify-between gap-2.5 text-xs min-w-0"
            >
              <div className="min-w-0">
                <p className="font-bold text-gray-800 truncate">
                  #{order.orderId}{" "}
                  <span className="text-[10px] font-normal text-gray-400">
                    ({order.date})
                  </span>
                </p>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">
                  {order.customerName} • {order.itemCount} টি আইটেম
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="font-extrabold text-gray-800">
                  ৳{Number(order.amount || 0).toLocaleString("bn-BD")}
                </p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold inline-block mt-0.5 ${
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
