'use client';

import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

export default function InvoiceTemplate({ order, role = 'customer' }) {
  const a4Ref = useRef(null);
  const posRef = useRef(null);
  const [printMode, setPrintMode] = useState('a4');

  const handleA4Print = useReactToPrint({
    contentRef: a4Ref,
    documentTitle: `${role === 'seller' ? 'Seller-Invoice' : 'Invoice'}-${order?.invoiceNo || '001'}`,
  });

  const handlePosPrint = useReactToPrint({
    contentRef: posRef,
    documentTitle: `POS-Receipt-${order?.invoiceNo || '001'}`,
  });

  if (!order) return <p className="text-center p-4">অর্ডার তথ্য পাওয়া যায়নি।</p>;

  // টাকার হিসাব
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = Number(order.deliveryCharge || 0);
  const discount = Number(order.discount || 0);
  const grandTotal = subtotal + deliveryCharge - discount;

  // সেলার কমিশন হিসাব
  const commissionRate = Number(order.commissionRate || 5);
  const platformCommission = (subtotal * commissionRate) / 100;
  const sellerNetPayout = subtotal - platformCommission;

  // স্মার্ট মাল্টি-সেলার চেক লজিক
  const uniqueSellers = [...new Set(order.items.map((item) => item.shopName).filter(Boolean))];
  const isMultiSeller = uniqueSellers.length > 1;
  const displaySellerName = isMultiSeller
    ? 'একাধিক দোকান (Multi-Seller)'
    : uniqueSellers.at(0) || order.sellerName;

  return (
    <div className="p-4">
      {/* উপরের কন্ট্রোল ও প্রিন্ট বাটনসমূহ */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-3 max-w-3xl mx-auto bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-md text-xs font-medium">
          <button
            onClick={() => setPrintMode('a4')}
            className={`px-3 py-1.5 rounded transition cursor-pointer ${
              printMode === 'a4' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600'
            }`}
          >
            📄 A4 ভিউ
          </button>
          <button
            onClick={() => setPrintMode('pos')}
            className={`px-3 py-1.5 rounded transition cursor-pointer ${
              printMode === 'pos' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600'
            }`}
          >
            🧾 মিনি প্রিন্টার ভিউ
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleA4Print()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>🖨️ A4 প্রিন্ট / PDF</span>
          </button>

          <button
            onClick={() => handlePosPrint()}
            className="bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>🧾 মিনি প্রিন্টার (POS)</span>
          </button>
        </div>
      </div>
      {/* ১. সাধারণ A4 ইনভয়েস ডিজাইন */}
      <div className={printMode === 'a4' ? 'block' : 'hidden'}>
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
                  order.paymentStatus === 'Paid'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
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

          <div className="mt-12 pt-6 border-t border-gray-200 flex justify-between items-end text-xs text-gray-500">
            <div>
              <p className="font-semibold text-gray-700">শর্তাবলী:</p>
              {role === 'seller' ? (
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
      </div>
      {/* ২. মিনি থার্মাল প্রিন্টার (58mm/80mm POS Slip) ডিজাইন */}
      <div className={printMode === 'pos' ? 'flex justify-center' : 'hidden'}>
        <div
          ref={posRef}
          className="w-[300px] bg-white p-4 text-black font-mono text-xs border border-dashed border-gray-400"
        >
          <div className="text-center border-b border-dashed border-black pb-2 mb-2">
            <h2 className="text-base font-bold">উপজেলা বাজার</h2>
            <p className="text-[10px]">বিশ্বস্ত অনলাইন মার্কেটপ্লেস</p>
            <p className="text-[10px]">হেল্পলাইন: ০১৭XX-XXXXXX</p>
          </div>

          <div className="border-b border-dashed border-black pb-2 mb-2 space-y-0.5 text-[11px]">
            <p><span className="font-bold">ইনভয়েস:</span> #{order.invoiceNo}</p>
            <p><span className="font-bold">তারিখ:</span> {order.orderDate}</p>
            <p><span className="font-bold">সেলার/দোকান:</span> {displaySellerName}</p>
            <p><span className="font-bold">ক্রেতা:</span> {order.customerName}</p>
            <p><span className="font-bold">ফোন:</span> {order.customerPhone}</p>
            <p><span className="font-bold">ঠিকানা:</span> {order.customerAddress}</p>
            <p><span className="font-bold">পেমেন্ট:</span> {order.paymentMethod} ({order.paymentStatus})</p>
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
              {order.items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-1 pr-1">
                    <div>{item.name}</div>
                    {isMultiSeller && item.shopName && (
                      <div className="text-[9px] text-gray-700">({item.shopName})</div>
                    )}
                  </td>
                  <td className="py-1 text-center align-top">{item.quantity}</td>
                  <td className="py-1 text-right align-top">৳{(item.price * item.quantity).toFixed(0)}</td>
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
            {discount > 0 && (
              <div className="flex justify-between">
                <span>ডিসকাউন্ট:</span>
                <span>-৳{discount.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm border-t border-black pt-1">
              <span>সর্বমোট বিল:</span>
              <span>৳{grandTotal.toFixed(0)}</span>
            </div>
          </div>

          <div className="text-center text-[10px] space-y-0.5">
            <p className="font-bold">ধন্যবাদ! আবার আসবেন।</p>
          </div>
        </div>
      </div>
    </div>
  );
}
