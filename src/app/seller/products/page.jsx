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

// আসল ডাটা ফেচিং কম্পোনেন্ট (Suspense-এর ভেতরে চলবে)
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">আমার পণ্যসমূহ (My Products)</h1>
          <p className="text-sm text-gray-500 mt-1">
            মোট পণ্য: <span className="font-semibold text-emerald-600">{products.length} টি</span>
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/seller/dashboard"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            অর্ডার ড্যাশবোর্ড
          </Link>
          {/* আপনার প্রোডাক্ট আপলোড পেজের সঠিক লিংকটি এখানে বসাবেন */}
                   <Link
            href="/seller/add-product"
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
          >
            + নতুন পণ্য যোগ করুন
          </Link>

        </div>
      </div>

      <SellerProductList initialProducts={products} />
    </>
  );
}

export default function SellerProductsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="bg-white p-10 text-center rounded-xl border border-gray-100 text-gray-500">
            আপনার পণ্যসমূহ লোড হচ্ছে...
          </div>
        }
      >
        <ProductDataSection />
      </Suspense>
    </div>
  );
}
