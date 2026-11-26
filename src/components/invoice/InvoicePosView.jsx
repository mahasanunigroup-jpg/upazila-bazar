import React from 'react';

export default function InvoicePosView({
  posRef,
  order,
  role,
  displaySellerName,
  isMultiSeller,
  subtotal,
  deliveryCharge,
  discount,
  grandTotal,
  commissionRate,
  platformCommission,
  sellerNetPayout,
}) {
  return (
    <div
      ref={posRef}
      className="w-full max-w-[330px] mx-auto bg-white p-4 border border-dashed border-gray-400 rounded-lg shadow-xs text-gray-900 font-mono text-xs"
    >
      <div className="text-center border-b border-dashed border-gray-400 pb-2.5 mb-2.5">
        <h2 className="text-base font-bold">উপজেলা বাজার</h2>
        <p className="text-[11px]">বিশ্বস্ত অনলাইন মার্কেটপ্লেস</p>
        <p className="text-[10px]">হেল্পলাইন: ০১৭XX-XXXXXX</p>
      </div>

      <div className="space-y-1 text-[11px] border-b border-dashed border-gray-400 pb-2.5 mb-2.5">
        <p><strong>ইনভয়েস:</strong> #{order.invoiceNo}</p>
        <p><strong>তারিখ:</strong> {order.orderDate}</p>
        <p className="break-words"><strong>সেলার/দোকান:</strong> {displaySellerName}</p>
        <p><strong>ক্রেতা:</strong> {order.customerName}</p>
        <p><strong>ফোন:</strong> {order.customerPhone}</p>
        <p className="break-words"><strong>ঠিকানা:</strong> {order.customerAddress}</p>
        <p><strong>পেমেন্ট:</strong> {order.paymentMethod} ({order.paymentStatus})</p>
      </div>

      <table className="w-full text-[11px] border-b border-dashed border-gray-400 pb-2 mb-2.5">
        <thead>
          <tr className="border-b border-dashed border-gray-400">
            <th className="text-left py-1">পণ্য</th>
            <th className="text-center py-1">পরিমাণ</th>
            <th className="text-right py-1">মোট</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={item.id || idx}>
              <td className="py-1 pr-1 break-words">
                {item.name}
                {isMultiSeller && item.shopName && (
                  <span className="block text-[9px] text-gray-600">({item.shopName})</span>
                )}
              </td>
              <td className="text-center py-1">{item.quantity}</td>
              <td className="text-right py-1">৳{item.price * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {role === 'seller' ? (
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span>মোট বিক্রয়:</span>
            <span>৳{subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>কমিশন ({commissionRate}%):</span>
            <span>-৳{platformCommission.toFixed(0)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-400 pt-1.5 mt-1">
            <span>নিট প্রাপ্য:</span>
            <span>৳{sellerNetPayout.toFixed(0)}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span>সাব-টোটাল:</span>
            <span>৳{subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>ডেলিভারি চার্জ:</span>
            <span>৳{deliveryCharge}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span>ডিসকাউন্ট:</span>
              <span>-৳{discount}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-400 pt-1.5 mt-1">
            <span>সর্বমোট বিল:</span>
            <span>৳{grandTotal}</span>
          </div>
        </div>
      )}

      <div className="text-center border-t border-dashed border-gray-400 pt-2.5 mt-3 text-[11px]">
        <p>ধন্যবাদ! আবার আসবেন।</p>
      </div>
    </div>
  );
}
