'use client';

import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

export default function UniversalPrintButtons({ order, role = 'admin' }) {
  const printRef = useRef(null);
  const [activePrint, setActivePrint] = useState({ type: 'pos', targetRole: 'customer' });

  const triggerPrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `UB-${activePrint.type.toUpperCase()}-${order?.orderId || '001'}`,
  });

  if (!order) return null;

  const handleQuickPrint = (type, targetRole = 'customer') => {
    setActivePrint({ type, targetRole });
    setTimeout(() => {
      triggerPrint();
    }, 100);
  };

  // ডেটা ও টাকার হিসাব
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
    ? 'একাধিক দোকান (Multi-Seller)'
    : uniqueSellers.at(0) || 'উপজেলা ভেরিফায়েড স্টোর';

  const fullAddress = [order.customer_address, order.upazila, order.district]
    .filter(Boolean)
    .join(', ');

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const isPaid = order.paymentStatus === 'Paid' || order.status === 'delivered';

  return (
    
      <div className="flex flex-wrap items-center gap-1.5 min-w-max">
      {/* ১. POS প্রিন্ট বাটন */}
      {(role === 'rider' || role === 'seller' || role === 'admin') && (
        <button
          type="button"
          onClick={() => handleQuickPrint('pos', 'customer')}
          className="bg-gray-800 hover:bg-gray-900 text-white px-2.5 py-1.5 rounded-md text-xs font-medium shadow-sm transition cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
        >
          <span>🧾 POS</span>
        </button>
      )}

      {/* ২. সেলার ইনভয়েস বাটন */}
      {(role === 'seller' || role === 'admin') && (
        <button
          type="button"
          onClick={() => handleQuickPrint('a4', 'seller')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-md text-xs font-medium shadow-sm transition cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
        >
          <span>📄 সেলার</span>
        </button>
      )}

      {/* ৩. কাস্টমার ইনভয়েস বাটন */}
      {role === 'admin' && (
        <button
          type="button"
          onClick={() => handleQuickPrint('a4', 'customer')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-md text-xs font-medium shadow-sm transition cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
        >
          <span>🖨️ কাস্টমার</span>
        </button>
      )}
        
      {/* অদৃশ্য প্রিন্ট এরিয়া */}
      <div className="hidden">
        <div ref={printRef}>
          {activePrint.type === 'pos' ? (
            /* মিনি প্রিন্টার (58mm/80mm POS Slip) */
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
                <p><span className="font-bold">পেমেন্ট:</span> {order.payment_method || 'Cash on Delivery'}</p>
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

              <div className="space-y-1 text-[11px] border-b border-dashed border-black pb-2 mb-2">
                <div className="flex justify-between">
                  <span>সাব-টোটাল:</span>
                  <span>৳{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ:</span>
                  <span>৳{deliveryCharge.toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-black pt-1">
                  <span>সর্বমোট বিল:</span>
                  <span>৳{grandTotal.toFixed(0)}</span>
                </div>
              </div>

              <div className="text-center text-[10px]">
                <p className="font-bold">ধন্যবাদ! আবার আসবেন।</p>
              </div>
            </div>
          ) : (
            /* হুবহু আপনার পছন্দের প্রিমিয়াম A4 ইনভয়েস ডিজাইন */
            <div className="max-w-3xl mx-auto bg-white p-8 text-gray-800">
              {/* হেডার */}
              <div className="flex justify-between items-start border-b pb-6">
                <div>
                  <h1 className="text-3xl font-bold text-emerald-700">উপজেলা বাজার</h1>
                  <p className="text-sm text-gray-500 mt-1">আপনার হাতের নাগালে বিশ্বস্ত অনলাইন শপ</p>
                  <p className="text-xs text-gray-500 mt-1">হেল্পলাইন: ০১৭XX-XXXXXX | ওয়েবসাইট: upazilabazar.com</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-semibold text-gray-700">
                    {activePrint.targetRole === 'seller'
                      ? 'সেলার পেমেন্ট ইনভয়েস'
                      : 'অফিশিয়াল কাস্টমার ইনভয়েস'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    ইনভয়েস নং: <span className="font-bold text-gray-900">#{order.orderId}</span>
                  </p>
                  <p className="text-sm text-gray-600">তারিখ: {formattedDate}</p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                      isPaid
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isPaid ? 'পরিশোধিত (Paid)' : 'ক্যাশ অন ডেলিভারি (Unpaid)'}
                  </span>
                </div>
              </div>
              {/* ক্রেতা ও বিক্রেতার বক্স কার্ড */}
              <div className="grid grid-cols-2 gap-6 my-6 text-sm">
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                  <h3 className="font-bold text-gray-700 border-b pb-1 mb-2">ক্রেতার তথ্য (Customer):</h3>
                  <p className="font-semibold text-gray-900">{order.customer_name}</p>
                  <p className="text-gray-600">ফোন: {order.customer_phone}</p>
                  <p className="text-gray-600">ঠিকানা: {fullAddress}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                  <h3 className="font-bold text-gray-700 border-b pb-1 mb-2">বিক্রেতার তথ্য (Seller):</h3>
                  <p className="font-semibold text-gray-900">{displaySellerName}</p>
                  <p className="text-gray-600">ফোন: হেল্পলাইন: ০১৭XX-XXXXXX</p>
                  <p className="text-gray-600">পেমেন্ট মাধ্যম: {order.payment_method || 'Cash on Delivery'}</p>
                </div>
              </div>

              {/* প্রোডাক্ট টেবিল (ক্রমিক নং সহ) */}
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
                  {items.map((item, idx) => (
                    <tr key={item._id || idx} className="border-b border-gray-200">
                      <td className="py-3 px-4">{idx + 1}</td>
                      <td className="py-3 px-4 font-medium">
                        {item.name}
                        {isMultiSeller && item.shopName && (
                          <span className="block text-xs text-gray-500">দোকান: {item.shopName}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">{item.qty}</td>
                      <td className="py-3 px-4 text-right">৳{Number(item.price || 0).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        ৳{(Number(item.price || 0) * Number(item.qty || 1)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* সর্বমোট হিসাব */}
              <div className="flex justify-end">
                {activePrint.targetRole === 'seller' ? (
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
                    <div className="flex justify-between text-gray-600">
                      <span>সাব-টোটাল:</span>
                      <span>৳{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>ডেলিভারি চার্জ:</span>
                      <span>৳{deliveryCharge.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>ডিসকাউন্ট:</span>
                        <span>- ৳{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base text-gray-900 border-t pt-2">
                      <span>সর্বমোট (Grand Total):</span>
                      <span className="text-emerald-700">৳{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ফুটার ও স্বাক্ষর */}
              <div className="mt-12 pt-6 border-t border-gray-200 flex justify-between items-end text-xs text-gray-500">
                <div>
                  <p className="font-semibold text-gray-700">শর্তাবলী:</p>
                  {activePrint.targetRole === 'seller' ? (
                    <>
                      <p>১. ডেলিভারি সম্পন্ন হওয়ার ২৪-৪৮ ঘণ্টার মধ্যে সেলারের অ্যাকাউন্টে পেমেন্ট পাঠানো হবে।</p>
                      <p>২. এটি একটি কম্পিউটার জেনারেটেড সেলার স্টেটমেন্ট।</p>
                    </>
                  ) : (
                    <>
                      <p>১. ডেলিভারি ম্যানের সামনে পণ্য চেক করে বুঝে নিন।</p>
                      <p>২. যেকোনো প্রয়োজনে ইনভয়েস নম্বরসহ আমাদের হেল্পলাইনে যোগাযোগ করুন।</p>
                    </>
                  )}
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-gray-400 mb-1"></div>
                  <p>কর্তৃপক্ষের স্বাক্ষর</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
