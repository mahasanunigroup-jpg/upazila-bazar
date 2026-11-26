import React from 'react';

export default function InvoiceA4View({
  a4Ref,
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
      ref={a4Ref}
      className="max-w-3xl mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow-sm text-gray-800"
    >
      <div className="flex justify-between items-start border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-emerald-700">উপজেলা বাজার</h1>
          <p className="text-sm text-gray-500 mt-1">আপনার হাতের নাগালে বিশ্বস্ত অনলাইন শপ</p>
          <p className="text-xs text-gray-500 mt-1">হেল্পলাইন: ০১৭XX-XXXXXX | ওয়েবসাইট: upazilabazar.com</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold text-gray-700">
            {role === 'seller' ? 'সেলার পেমেন্ট ইনভয়েস' : 'অফিশিয়াল কাস্টমার ইনভয়েস'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            ইনভয়েস নং: <span className="font-bold text-gray-900">#{order.invoiceNo}</span>
          </p>
          <p className="text-sm text-gray-600">তারিখ: {order.orderDate}</p>
          <span
            className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
              order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {order.paymentStatus === 'Paid' ? 'পরিশোধিত (Paid)' : 'ক্যাশ অন ডেলিভারি (Unpaid)'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 my-6 text-sm">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-bold text-gray-700 border-b pb-1 mb-2">ক্রেতার তথ্য (Customer):</h3>
          <p className="font-semibold text-gray-900">{order.customerName}</p>
          <p className="text-gray-600">ফোন: {order.customerPhone}</p>
          <p className="text-gray-600">ঠিকানা: {order.customerAddress}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-bold text-gray-700 border-b pb-1 mb-2">বিক্রেতার তথ্য (Seller):</h3>
          <p className="font-semibold text-gray-900">{displaySellerName}</p>
          <p className="text-gray-600">ফোন: {order.sellerPhone}</p>
          <p className="text-gray-600">পেমেন্ট মাধ্যম: {order.paymentMethod}</p>
        </div>
      </div>

      <table className="w-full text-left border-collapse my-6 text-sm">
        <thead>
          <tr className="bg-emerald-700 text-white">
            <th className="py-2.5 px-4 rounded-tl-md">ক্রমিক</th>
            <th className="py-2.5 px-4">পণ্যের বিবরণ</th>
            <th className="py-2.5 px-4 text-center">পরিমাণ</th>
            <th className="py-2.5 px-4 text-right">একক মূল্য</th>
            <th className="py-2.5 px-4 text-right rounded-tr-md">মোট মূল্য</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={item.id || index} className="border-b border-gray-200">
              <td className="py-3 px-4">{index + 1}</td>
              <td className="py-3 px-4 font-medium">
                {item.name}
                {isMultiSeller && item.shopName && (
                  <span className="block text-xs text-gray-500">দোকান: {item.shopName}</span>
                )}
              </td>
              <td className="py-3 px-4 text-center">{item.quantity}</td>
              <td className="py-3 px-4 text-right">৳{Number(item.price).toFixed(2)}</td>
              <td className="py-3 px-4 text-right font-semibold">
                ৳{(Number(item.price) * Number(item.quantity)).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        {role === 'seller' ? (
          <div className="w-72 text-sm space-y-2 bg-emerald-50/50 p-4 rounded-md border border-emerald-100">
            <div className="flex justify-between text-gray-700">
              <span>মোট পণ্য বিক্রয় (Subtotal):</span>
              <span>৳{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>উপজেলা বাজার কমিশন ({commissionRate}%):</span>
              <span>- ৳{platformCommission.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-gray-900 border-t border-emerald-200 pt-2">
              <span>সেলারের নিট প্রাপ্য:</span>
              <span className="text-emerald-700">৳{sellerNetPayout.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <div className="w-64 text-sm space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>সাব-টোটাল:</span>
              <span>৳{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>ডেলিভারি চার্জ:</span>
              <span>৳{deliveryCharge.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>ডিসকাউন্ট:</span>
                <span>- ৳{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-gray-900 border-t pt-2">
              <span>সর্বমোট বিল:</span>
              <span className="text-emerald-700">৳{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 pt-4 border-t text-center text-xs text-gray-500">
        <p>উপজেলা বাজারের সাথে কেনাকাটা করার জন্য আপনাকে অসংখ্য ধন্যবাদ!</p>
      </div>
    </div>
  );
}
