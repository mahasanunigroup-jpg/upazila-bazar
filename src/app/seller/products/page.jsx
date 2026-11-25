import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import Link from "next/link";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import SellerProductList from "@/components/seller/SellerProductList";

export const metadata = {
  title: "আমার পণ্যসমূহ | উপজেলা বাজার",
};

async function ProductDataSection() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  let sellerId;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "seller" && payload.role !== "admin") {
      redirect("/");
    }
    sellerId = payload.userId || payload.id;
  } catch {
    redirect("/login");
  }

  await connectDB();
  const rawProducts = await Product.find({ sellerId })
    .sort({ createdAt: -1 })
    .lean();

  const products = rawProducts.map((p) => ({
    ...p,
    _id: p._id.toString(),
    sellerId: p.sellerId.toString(),
    title: p.title || p.name || "নামহীন পণ্য",
    createdAt: p.createdAt?.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
  }));

  return (
    <>
      {/* স্লিম ও রেসপন্সিভ হেডার কার্ড */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 bg-white p-3.5 sm:p-5 rounded-2xl shadow-2xs border border-gray-100">
        <div className="flex items-center justify-between sm:justify-start gap-2.5 min-w-0">
          <h1 className="text-base sm:text-xl font-bold text-gray-800 truncate">
            আমার পণ্যসমূহ
          </h1>
          <span className="text-[11px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
            মোট: {products.length.toLocaleString("bn-BD")} টি
          </span>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0">
          <Link
            href="/seller/orders"
            className="px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition text-center whitespace-nowrap"
          >
            অর্ডার ড্যাশবোর্ড
          </Link>
          <Link
            href="/seller/add-product"
            className="px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-2xs transition text-center whitespace-nowrap"
          >
            + নতুন পণ্য যোগ
          </Link>
        </div>
      </div>

      <SellerProductList initialProducts={products} />
    </>
  );
}

export default function SellerProductsPage() {
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <Suspense
        fallback={
          <div className="bg-white p-10 text-center rounded-2xl border border-gray-100 text-xs sm:text-sm text-gray-500">
            আপনার পণ্যসমূহ লোড হচ্ছে...
          </div>
        }
      >
        <ProductDataSection />
      </Suspense>
    </div>
  );
}
