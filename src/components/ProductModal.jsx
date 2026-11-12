"use client";

import React from "react";
import { X, ShoppingCart } from "lucide-react";

export default function ProductModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl">
        <div className="relative h-64 bg-gray-100">
          <img
            src={product.image}
            alt={product.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co";
            }}
            className="w-full h-full object-cover"
          />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-gray-700 flex items-center justify-center shadow">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full">{product.category}</span>
            <span className="text-xs font-semibold text-gray-500">স্টক: {product.stock || 10} টি</span>
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-gray-800">{product.title}</h3>
            <p className="text-2xl font-extrabold text-green-600 mt-1">৳ {product.price} টাকা</p>
          </div>

          <p className="text-sm text-gray-600">{product.description}</p>

          <button
            onClick={() => {
              onAddToCart(product);
              onClose();
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" /> কার্টে যোগ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
