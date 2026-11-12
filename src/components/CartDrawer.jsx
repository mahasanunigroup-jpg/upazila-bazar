"use client";

import React from "react";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartDrawer({ isOpen, onClose, cart, onUpdateQty, onRemove }) {
  if (!isOpen) return null;

  const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-green-600 text-white">
          <div className="flex items-center gap-2 font-bold text-lg">
            <ShoppingBag className="w-5 h-5" /> আপনার বাজার ব্যাগ ({cart.length})
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-green-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-gray-500 font-medium">আপনার বাজার ব্যাগ এখন খালি!</p>
              <button onClick={onClose} className="text-green-600 font-bold text-sm underline">
                কেনাকাটা শুরু করুন
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 items-center">
                <img
                  src={item.image}
                  alt={item.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co";
                  }}
                  className="w-16 h-16 rounded-lg object-cover bg-white shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-sm truncate">{item.title}</h4>
                  <p className="text-green-600 font-extrabold text-sm mt-0.5">৳ {item.price * item.quantity} টাকা</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQty(item._id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQty(item._id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <button onClick={() => onRemove(item._id)} className="text-red-400 hover:text-red-600 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-4">
            <div className="flex justify-between items-center text-base font-bold text-gray-800">
              <span>সর্বমোট (ডেলিভারি চার্জ ছাড়া):</span>
              <span className="text-green-600 text-lg">৳ {subTotal} টাকা</span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition"
            >
              <span>চেকআউট সম্পন্ন করুন</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
