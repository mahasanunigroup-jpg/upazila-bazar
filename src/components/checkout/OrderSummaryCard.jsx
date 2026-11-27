"use client";

import { ShoppingCart, Trash2 } from "lucide-react";
import { formatCheckoutItemQty } from "@/lib/formatCheckoutQty";

export default function OrderSummaryCard({
  cartItems,
  subTotal,
  deliveryCharge,
  totalAmount,
  onRemoveItem,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4 h-fit">
      <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
        <span>আপনার অর্ডার ({cartItems.length})</span>
      </h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-xs sm:text-sm">
          আপনার কার্টে কোনো পণ্য নেই!
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="flex items-start gap-2.5 bg-gray-50/90 p-2 rounded-xl border border-gray-200/70"
            >
              <img
                src={item.image}
                alt={item.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co";
                }}
                className="w-10 h-10 rounded-lg object-cover bg-white border border-gray-100 shrink-0 mt-0.5"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1.5">
                  <h4 className="font-bold text-gray-800 text-xs leading-snug line-clamp-1">
                    {item.title}
                  </h4>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item._id)}
                    aria-label="পণ্য বাদ দিন"
                    className="text-red-400 hover:text-red-600 p-0.5 -mt-0.5 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 mt-1">
                  <p className="text-[11px] text-gray-500 whitespace-nowrap truncate">
                    {formatCheckoutItemQty(item)} × ৳{item.price}
                  </p>

                  <span className="font-extrabold text-green-600 text-xs sm:text-sm whitespace-nowrap shrink-0">
                    ৳{Math.round(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-100 pt-3.5 space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between text-gray-600">
          <span>পণ্যের মোট দাম:</span>
          <span className="font-bold text-gray-800">৳{subTotal}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>ডেলিভারি চার্জ:</span>
          <span className="font-bold text-gray-800">৳{deliveryCharge}</span>
        </div>
        <div className="flex justify-between text-sm sm:text-base font-extrabold text-gray-900 border-t border-gray-100 pt-2.5">
          <span>সর্বমোট পরিশোধযোগ্য:</span>
          <span className="text-green-600 text-base sm:text-lg">৳{totalAmount} টাকা</span>
        </div>
      </div>
    </div>
  );
}
