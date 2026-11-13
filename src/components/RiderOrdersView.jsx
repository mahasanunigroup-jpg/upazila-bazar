"use client";

import { useState } from "react";
import RiderActionButtons from "./RiderActionButtons";

export default function RiderOrdersView({ orders }) {
  const [activeTab, setActiveTab] = useState("active"); // active, delivered

  // চলমান এবং সম্পন্ন ডেলিভারি আলাদা করা
  const activeOrders = orders.filter((o) => o.deliveryStatus !== "delivered");
  const deliveredOrders = orders.filter((o) => o.deliveryStatus === "delivered");

  const displayedOrders = activeTab === "active" ? activeOrders : deliveredOrders;

  return (
    <>
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">রাইডার ডেলিভারি প্যানেল</h1>
          <p className="text-sm text-gray-500 mt-1">
            আপনার জন্য নির্ধারিত পার্সেলগুলো সংগ্রহ করে কাস্টমারের ঠিকানায় পৌঁছে দিন
          </p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-semibold text-sm border border-emerald-200 self-start sm:self-auto">
          মোট ডেলিভারি: {orders.length} টি
        </div>
      </div>

      {/* ২টি ফাস্ট ফিল্টার ট্যাব */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
            activeTab === "active"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          চলমান ডেলিভারি ({activeOrders.length})
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
      </div>

      {/* অর্ডার কার্ড গ্রিড */}
      {displayedOrders.length === 0 ? (
        <div className="bg-white p-10 rounded-xl text-center border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-lg">
            {activeTab === "active"
              ? "বর্তমানে কোনো চলমান ডেলিভারি নেই।"
              : "এখনো কোনো ডেলিভারি সম্পন্ন হয়নি।"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {displayedOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center border-b pb-3 mb-3">
                  <span className="font-bold text-emerald-700 text-lg">#{order.orderId}</span>
                  <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">
                    ক্যাশ কালেকশন: ৳{order.total_amount}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm text-gray-700 mb-4">
                  <p>
                    <span className="font-semibold">ক্রেতার নাম:</span> {order.customer_name}
                  </p>
                  <p>
                    <span className="font-semibold">ফোন নম্বর:</span>{" "}
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="text-blue-600 underline font-medium"
                    >
                      {order.customer_phone}
                    </a>
                  </p>
                  <p>
                    <span className="font-semibold">ডেলিভারি ঠিকানা:</span>{" "}
                    {order.customer_address ? `${order.customer_address}, ` : ""}
                    {order.upazila}
                    {order.district ? `, ${order.district}` : ""}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg mb-4 text-xs space-y-1">
                  <p className="font-semibold text-gray-600 mb-1">পার্সেল বিবরণ:</p>
                  {order.items.map((item) => (
                    <p key={item._id} className="text-gray-700">
                      • {item.name} ({item.qty} টি) — দোকান: {item.shopName || "উপজেলা স্টোর"}
                    </p>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  স্ট্যাটাস:{" "}
                  <strong className="uppercase text-gray-800">{order.deliveryStatus}</strong>
                </span>
                <RiderActionButtons
                  orderId={order._id}
                  currentStatus={order.deliveryStatus}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
