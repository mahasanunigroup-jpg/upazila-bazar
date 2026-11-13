"use client";

import { useState } from "react";
import SellerStatusSelect from "./SellerStatusSelect";
import SellerRiderSelect from "./SellerRiderSelect";

export default function SellerOrdersView({ orders, riders }) {
  const [activeTab, setActiveTab] = useState("active"); // active, delivered, cancelled

  // ট্যাব অনুযায়ী অর্ডার ফিল্টার করা
  const activeOrders = orders.filter(
    (o) => o.orderPackingStatus !== "cancelled" && o.deliveryStatus !== "delivered"
  );
  const deliveredOrders = orders.filter(
    (o) => o.deliveryStatus === "delivered" && o.orderPackingStatus !== "cancelled"
  );
  const cancelledOrders = orders.filter(
    (o) => o.orderPackingStatus === "cancelled"
  );

  const displayedOrders =
    activeTab === "active"
      ? activeOrders
      : activeTab === "delivered"
      ? deliveredOrders
      : cancelledOrders;

  return (
    <>
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">সেলার অর্ডার ও ডেলিভারি ড্যাশবোর্ড</h1>
          <p className="text-sm text-gray-500 mt-1">
            পণ্য প্যাক করুন এবং ডেলিভারির জন্য আপনার এলাকার রাইডার অ্যাসাইন করুন
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-3.5 py-2 rounded-lg border border-blue-200 text-sm font-semibold self-start sm:self-auto">
          সক্রিয় রাইডার: {riders.length} জন
        </div>
      </div>

      {/* ৩টি ফাস্ট ফিল্টার ট্যাব */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
            activeTab === "active"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          চলমান অর্ডার ({activeOrders.length})
        </button>

        <button
          onClick={() => setActiveTab("delivered")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
            activeTab === "delivered"
              ? "bg-green-600 text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          সম্পন্ন ডেলিভারি ({deliveredOrders.length})
        </button>

        <button
          onClick={() => setActiveTab("cancelled")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
            activeTab === "cancelled"
              ? "bg-red-600 text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          বাতিলকৃত অর্ডার ({cancelledOrders.length})
        </button>
      </div>

      {/* অর্ডার লিস্ট */}
      {displayedOrders.length === 0 ? (
        <div className="bg-white p-10 rounded-xl text-center border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-lg">এই তালিকায় কোনো অর্ডার নেই।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* টপ বার */}
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-emerald-700">#{order.orderId}</span>
                  <span className="text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("bn-BD", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      order.deliveryStatus === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.deliveryStatus === "assigned"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    ডেলিভারি: {order.deliveryStatus}
                  </span>
                </div>

                {/* অ্যাকশন বাটনসমূহ */}
                <div className="flex flex-wrap items-center gap-3">
                  <SellerStatusSelect
                    orderId={order._id}
                    currentStatus={
                      order.deliveryStatus === "delivered"
                        ? "delivered"
                        : order.orderPackingStatus
                    }
                  />
                  {order.orderPackingStatus !== "cancelled" &&
                    order.deliveryStatus !== "delivered" && (
                      <SellerRiderSelect
                        orderId={order._id}
                        currentRiderId={order.riderId}
                        riders={riders}
                      />
                    )}
                  <span className="font-bold text-gray-800 pl-1">
                    বিল: ৳{order.myTotal}
                  </span>
                </div>
              </div>

              {/* ক্রেতার ঠিকানা */}
              <div className="px-5 py-3 bg-emerald-50/30 border-b border-gray-100 text-sm flex flex-wrap gap-x-6 gap-y-1 text-gray-700">
                <p><span className="font-semibold">ক্রেতা:</span> {order.customer_name}</p>
                <p><span className="font-semibold">ফোন:</span> {order.customer_phone}</p>
                <p>
                  <span className="font-semibold">এলাকা:</span> {order.upazila}
                  {order.district ? `, ${order.district}` : ""}{" "}
                  {order.customer_address ? `(${order.customer_address})` : ""}
                </p>
              </div>

              {/* পণ্যের তালিকা */}
              <div className="p-5 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b">
                      <th className="pb-2">পণ্যের নাম</th>
                      <th className="pb-2">পরিমাণ</th>
                      <th className="pb-2 text-right">দাম</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {order.myItems.map((item) => (
                      <tr key={item._id}>
                        <td className="py-2.5 font-medium text-gray-800">{item.name}</td>
                        <td className="py-2.5 text-gray-600">{item.qty} টি</td>
                        <td className="py-2.5 font-semibold text-gray-800 text-right">
                          ৳{item.price * item.qty}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
