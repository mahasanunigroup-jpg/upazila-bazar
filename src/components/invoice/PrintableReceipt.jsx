import React from "react";

export default function PrintableReceipt({ order, activePrint }) {
  const items = order.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0
  );
  const deliveryCharge = Number(order.delivery_charge || 0);
  const discount = Number(order.discount || 0);
  const grandTotal = order.total_amount
    ? Number(order.total_amount)
    : subtotal + deliveryCharge - discount;

  const commissionRate = Number(order.commissionRate || 5);
  const platformCommission = (subtotal * commissionRate) / 100;
  const sellerNetPayout = subtotal - platformCommission;

  const uniqueSellers = [...new Set(items.map((item) => item.shopName).filter(Boolean))];
  const isMultiSeller = uniqueSellers.length > 1;
  const displaySellerName = isMultiSeller
    ? "একাধিক দোকান (Multi-Seller)"
    : uniqueSellers.at(0) || "উপজেলা ভেরিফায়েড স্টোর";

  const fullAddress = [order.customer_address, order.upazila, order.district]
    .filter(Boolean)
    .join(", ");

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const isPaid = order.paymentStatus === "Paid" || order.status === "delivered";

  if (activePrint.type === "pos") {
    return (
      <div className="w-[300px] bg-white p-4 text-black font-mono text-xs">
        <div className="text-center border-b border-dashed border-black pb-2 mb-2">
          <h2 className="text-base font-bold">উপজেলা বাজার</h2>
          <p className="text-[10px]">বিশ্বস্ত অনলাইন মার্কেটপ্লেস</p>
          <p className="text-[10px]">হেল্পলাইন: ০১৭XX-XXXXXX</p>
        </div>

        <div className="border-b border-dashed border-black pb-2 mb-2 space-y-0.5 text-[11px]">
          <p><span className="font-bold">ইনভয়েস:</span> #{order.orderId}</p>
          <p><span className="font-bold">তারিখ:</span> {formattedDate}</p>
          <p><span className="font-bold">সেলার:</span> {displaySellerName}</p>
          <p><span className="font-bold">ক্রেতা:</span> {order.customer_name}</p>
          <p><span className="font-bold">ফোন:</span> {order.customer_phone}</p>
          <p><span className="font-bold">ঠিকানা:</span> {fullAddress}</p>
          <p><span className="font-bold">পেমেন্ট:</span> {order.payment_method || "Cash on Delivery"}</p>
        </div>

        <table className="w-full text-left border-b border-dashed border-black pb-2 mb-2 text-[11px]">
          <thead>
            <tr className="border-b border-black">
              <th className="py-1">পণ্য</th>
              <th className="py-1 text-center">পরিমাণ</th>
              <th className="py-1 text-right">মোট</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item._id || idx}>
                <td className="py-1 pr-1">
                  <div>{item.name}</div>
                  {isMultiSeller && item.shopName && (
                    <div className="text-[9px]">({item.shopName})</div>
                  )}
                </td>
                <td className="py-1 text-center align-top">{item.qty}</td>
                <td className="py-1 text-right align-top">
                  ৳{(Number(item.price || 0) * Number(item.qty || 1)).toFixed(0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-0.5 text-[11px] border-b border-dashed border-black pb-2 mb-2">
          <div className="flex justify-between"><span>উপমোট:</span><span>৳{subtotal}</span></div>
          {deliveryCharge > 0 && (
            <div className="flex justify-between"><span>ডেলিভারি চার্জ:</span><span>৳{deliveryCharge}</span></div>
          )}
          {discount > 0 && (
            <div className="flex justify-between"><span>ডিসকাউন্ট:</span><span>-৳{discount}</span></div>
          )}
          <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
            <span>সর্বমোট:</span><span>৳{grandTotal}</span>
          </div>
        </div>

        <p className="text-center text-[10px]">ধন্যবাদ! আবার আসবেন।</p>
      </div>
    );
  }

  return (
    <div className="w-[750px] bg-white p-8 text-gray-800 font-sans text-sm">
      <div className="flex justify-between items-start border-b-2 border-emerald-600 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-700">উপজেলা বাজার</h1>
          <p className="text-xs text-gray-500">হাইপারলোকাল অনলাইন মার্কেটপ্লেস</p>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            {activePrint.targetRole === "seller" ? "সেলার ইনভয়েস" : "কাস্টমার ইনভয়েস"}
          </span>
          <p className="font-bold mt-2">ইনভয়েস: #{order.orderId}</p>
          <p className="text-xs text-gray-500">তারিখ: {formattedDate}</p>
          <p className="text-xs font-bold mt-1">{isPaid ? "স্ট্যাটাস: পরিশোধিত (PAID)" : "স্ট্যাটাস: বকেয়া (COD)"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6 text-xs bg-gray-50 p-4 rounded-lg">
        <div>
          <p className="font-bold text-gray-600 mb-1">ক্রেতার তথ্য:</p>
          <p className="font-bold text-sm">{order.customer_name}</p>
          <p>ফোন: {order.customer_phone}</p>
          <p>ঠিকানা: {fullAddress}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-600 mb-1">বিক্রেতার তথ্য:</p>
          <p className="font-bold text-sm">{displaySellerName}</p>
          <p>পেমেন্ট মাধ্যম: {order.payment_method || "Cash on Delivery"}</p>
        </div>
      </div>

      <table className="w-full text-left border-collapse mb-6 text-xs">
        <thead>
          <tr className="bg-emerald-600 text-white">
            <th className="p-2.5">#</th>
            <th className="p-2.5">পণ্যের বিবরণ</th>
            <th className="p-2.5 text-center">পরিমাণ</th>
            <th className="p-2.5 text-right">একক মূল্য</th>
            <th className="p-2.5 text-right">মোট</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 border-b">
          {items.map((item, idx) => (
            <tr key={item._id || idx}>
              <td className="p-2.5">{idx + 1}</td>
              <td className="p-2.5 font-medium">{item.name}</td>
              <td className="p-2.5 text-center">{item.qty}</td>
              <td className="p-2.5 text-right">৳{item.price}</td>
              <td className="p-2.5 text-right font-bold">
                ৳{Number(item.price || 0) * Number(item.qty || 1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 space-y-1.5 text-xs">
          <div className="flex justify-between"><span>উপমোট:</span><span>৳{subtotal}</span></div>
          {activePrint.targetRole === "seller" ? (
            <>
              <div className="flex justify-between text-red-600">
                <span>প্ল্যাটফর্ম কমিশন ({commissionRate}%):</span>
                <span>-৳{platformCommission.toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t pt-1.5 text-emerald-700">
                <span>সেলার নিট প্রাপ্য:</span>
                <span>৳{sellerNetPayout.toFixed(0)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between"><span>ডেলিভারি চার্জ:</span><span>৳{deliveryCharge}</span></div>
              {discount > 0 && <div className="flex justify-between"><span>ডিসকাউন্ট:</span><span>-৳{discount}</span></div>}
              <div className="flex justify-between font-bold text-sm border-t pt-1.5">
                <span>সর্বমোট বিল:</span><span>৳{grandTotal}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
