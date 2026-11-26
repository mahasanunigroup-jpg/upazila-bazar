'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import InvoiceA4View from './InvoiceA4View';
import InvoicePosView from './InvoicePosView';

export default function InvoiceTemplate({ order, role = 'customer' }) {
  const a4Ref = useRef(null);
  const posRef = useRef(null);
  const [printMode, setPrintMode] = useState('a4');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setPrintMode('pos');
    }
  }, []);

  const handleA4Print = useReactToPrint({
    contentRef: a4Ref,
    documentTitle: `${role === 'seller' ? 'Seller-Invoice' : 'Invoice'}-${order?.invoiceNo || '001'}`,
  });

  const handlePosPrint = useReactToPrint({
    contentRef: posRef,
    documentTitle: `POS-Receipt-${order?.invoiceNo || '001'}`,
  });

  if (!order) return <p className="text-center p-4">অর্ডার তথ্য পাওয়া যায়নি।</p>;

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = Number(order.deliveryCharge || 0);
  const discount = Number(order.discount || 0);
  const grandTotal = subtotal + deliveryCharge - discount;

  const commissionRate = Number(order.commissionRate || 5);
  const platformCommission = (subtotal * commissionRate) / 100;
  const sellerNetPayout = subtotal - platformCommission;

  const uniqueSellers = [...new Set(order.items.map((item) => item.shopName).filter(Boolean))];
  const isMultiSeller = uniqueSellers.length > 1;
  const displaySellerName = isMultiSeller
    ? 'একাধিক দোকান (Multi-Seller)'
    : uniqueSellers.at(0) || order.sellerName;

  const viewProps = {
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
  };

  return (
    <div className="px-2.5 py-3 sm:p-4 w-full overflow-x-hidden">
      <div className="mb-4 sm:mb-6 flex flex-wrap justify-between items-center gap-2.5 max-w-3xl mx-auto bg-white p-2.5 sm:p-3 rounded-xl shadow-xs border border-gray-200">
        <div className="hidden md:flex items-center gap-2 bg-gray-100 p-1 rounded-md text-xs font-medium">
          <button
            type="button"
            onClick={() => setPrintMode('a4')}
            className={`px-3 py-1.5 rounded transition cursor-pointer ${
              printMode === 'a4' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600'
            }`}
          >
            📄 A4 ভিউ
          </button>
          <button
            type="button"
            onClick={() => setPrintMode('pos')}
            className={`px-3 py-1.5 rounded transition cursor-pointer ${
              printMode === 'pos' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600'
            }`}
          >
            🧾 মিনি প্রিন্টার ভিউ
          </button>
        </div>

        <div className="flex items-center justify-center md:justify-end gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => handleA4Print()}
            className="hidden md:flex bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition items-center gap-1.5 cursor-pointer"
          >
            <span>🖨️ A4 প্রিন্ট / PDF</span>
          </button>

          <button
            type="button"
            onClick={() => handlePosPrint()}
            className="w-full md:w-auto justify-center bg-gray-800 hover:bg-gray-900 text-white text-xs sm:text-sm font-bold px-4 py-2.5 md:py-2 rounded-xl md:rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>🧾 মিনি প্রিন্টার (POS)</span>
          </button>
        </div>
      </div>

      <div className={printMode === 'a4' ? 'hidden md:block' : 'hidden'}>
        <InvoiceA4View a4Ref={a4Ref} {...viewProps} />
      </div>

      <div className={printMode === 'pos' ? 'block' : 'block md:hidden'}>
        <InvoicePosView posRef={posRef} {...viewProps} />
      </div>
    </div>
  );
}
