import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";
import AdminProductTable from "@/components/admin/AdminProductTable";
import { verifyAdmin } from "@/lib/adminAuth";
import { buildLocationScope } from "@/lib/adminScope";

export const metadata = {
  title: "পণ্য মডারেশন | অ্যাডমিন প্যানেল",
};

async function ProductsDataSection() {
  await connection();

  // ১. অ্যাডমিন ভেরিফিকেশন
  const admin = await verifyAdmin();
  if (!admin) redirect("/unauthorized");

  await connectDB();

  const isSuper = admin.role === "admin" || admin.role === "super_admin";
  let productQuery = {};

  // ২. আঞ্চলিক অ্যাডমিন হলে তার এলাকার সেলারদের পণ্য ফিল্টার করা
  if (!isSuper) {
    const locationFilter = buildLocationScope(admin);
    const localSellers = await User.find({
      role: "seller",
      ...locationFilter,
    })
      .select("_id")
      .lean();

    const sellerIds = localSellers.map((s) => s._id);

    // পণ্যে সরাসরি এলাকা সেভ থাকলে অথবা সেলারের আইডি মিললে দেখাবে
    productQuery = {
      $or: [
        locationFilter,
        { sellerId: { $in: sellerIds } },
        { seller: { $in: sellerIds } },
      ],
    };
  }

  const rawProducts = await Product.find(productQuery)
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
          {isSuper ? "প্ল্যাটফর্মে মোট পণ্য:" : "আপনার আওতাধীন এলাকার মোট পণ্য:"}{" "}
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
