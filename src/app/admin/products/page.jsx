import { Suspense } from "react";
import { connection } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import AdminProductTable from "@/components/admin/AdminProductTable";

export const metadata = {
  title: "পণ্য মডারেশন | অ্যাডমিন প্যানেল",
};

async function ProductsDataSection() {
  await connection();
  await connectDB();

  const rawProducts = await Product.find({})
    .sort({ createdAt: -1 })
    .lean();

  const products = rawProducts.map((p) => ({
    _id: p._id.toString(),
    title: p.title || p.name || "নামহীন পণ্য",
    category: p.category || "সাধারণ",
    price: p.price || 0,
    stock: p.stock || 0,
    shopName: p.shopName || "ভেরিফায়েড স্টোর",
    image: p.images?.[0] || p.image || "/placeholder.png",
  }));

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          সকল পণ্য মডারেশন (Product Moderation)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          প্ল্যাটফর্মে মোট পণ্য:{" "}
          <span className="font-semibold text-emerald-600">
            {products.length} টি
          </span>
        </p>
      </div>

      <AdminProductTable initialProducts={products} />
    </>
  );
}

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="bg-white p-10 text-center rounded-xl border border-gray-100 text-gray-500">
            প্ল্যাটফর্মের সব পণ্য লোড হচ্ছে...
          </div>
        }
      >
        <ProductsDataSection />
      </Suspense>
    </div>
  );
}
