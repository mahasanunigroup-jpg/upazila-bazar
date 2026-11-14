"use client";

import React from "react";
import Link from "next/link";
import SellerProductForm from "@/components/SellerProductForm";
import { ArrowLeft } from "lucide-react";

export default function AddProductPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto mb-4">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-600 hover:text-green-600">
          <ArrowLeft className="w-4 h-4 mr-1" /> হোম পেজে ফিরুন
        </Link>
      </div>
      <SellerProductForm />
    </div>
  );
}
