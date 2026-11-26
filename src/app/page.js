import { Suspense } from "react";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Review from "@/models/Review";
import User from "@/models/User";
import HomeClient from "@/components/HomeClient";
import NoticeBanner from "@/components/NoticeBanner";

function optimizeCloudinaryUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (url.includes("://cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", "/upload/f_auto,q_auto:best,dpr_auto,w_600,c_limit/");
  }
  return url;
}

async function getInitialUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const uid = payload.userId || payload.id || payload._id;
    if (!uid) return null;

    await connectDB();
    const dbUser = await User.findById(uid)
      .select("_id name email role shopName")
      .lean();

    if (!dbUser) {
      return {
        _id: String(uid),
        id: String(uid),
        role: payload.role || null,
        name: payload.name || "",
        email: payload.email || "",
        shopName: payload.shopName || "",
      };
    }

    return {
      _id: dbUser._id.toString(),
      id: dbUser._id.toString(),
      role: dbUser.role,
      name: dbUser.name || "",
      email: dbUser.email || "",
      shopName: dbUser.shopName || "",
    };
  } catch {
    return null;
  }
}

async function getInitialProducts() {
  await connection();

  try {
    await connectDB();

    const [rawProducts, allReviews] = await Promise.all([
      Product.find({})
        .select(
          "title description price image category stock district upazila union moholla sellerId shopName sellerName rating numReviews"
        )
        .sort({ createdAt: -1 })
        .limit(120)
        .lean(),
      Review.find({}).select("productId rating").lean(),
    ]);

    const ratingMap = {};
    allReviews.forEach((rev) => {
      const pid = rev.productId?.toString();
      if (!pid) return;
      if (!ratingMap[pid]) ratingMap[pid] = { sum: 0, count: 0 };
      ratingMap[pid].sum += Number(rev.rating || 0);
      ratingMap[pid].count += 1;
    });

    return rawProducts.map((p) => {
      const pid = p._id.toString();
      const stats = ratingMap[pid];
      const calculatedRating =
        stats && stats.count > 0
          ? Number((stats.sum / stats.count).toFixed(1))
          : Number(p.rating) || 0;

      return {
        _id: pid,
        title: p.title || "",
        description: p.description || "",
        price: Number(p.price) || 0,
        image: optimizeCloudinaryUrl(p.image),
        category: p.category || "মুদি",
        stock: Number(p.stock) || 10,
        district: p.district || "",
        upazila: p.upazila || "",
        union: p.union || "",
        moholla: p.moholla || "",
        sellerId: p.sellerId ? p.sellerId.toString() : "",
        shopName: p.shopName || "উপজেলা ভেরিফায়েড স্টোর",
        sellerName: p.sellerName || "স্থানীয় বিক্রেতা",
        rating: calculatedRating,
        numReviews: stats ? stats.count : Number(p.numReviews) || 0,
      };
    });
  } catch (error) {
    console.error("Home Page Fetch Error:", error);
    return [];
  }
}

async function HomeContent() {
  const [initialProducts, initialUser] = await Promise.all([
    getInitialProducts(),
    getInitialUser(),
  ]);
  return <HomeClient initialProducts={initialProducts} initialUser={initialUser} />;
}

export default function HomePage() {
  return (
    <>
      <NoticeBanner />
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-emerald-600 font-bold text-lg animate-pulse">
              উপজেলা বাজার লোড হচ্ছে...
            </p>
          </div>
        }
      >
        <HomeContent />
      </Suspense>
    </>
  );
}
