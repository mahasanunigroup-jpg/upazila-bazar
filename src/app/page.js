// import { Suspense } from "react";
// import { connection } from "next/server";
// import connectDB from "@/lib/db";
// import Product from "@/models/Product";
// import HomeClient from "@/components/HomeClient";
// import NoticeBanner from "@/components/NoticeBanner";

// // Cloudinary ছবির সাইজ ৭০-৮০% কমিয়ে সুপার-ফাস্ট করার ফাংশন
// function optimizeCloudinaryUrl(url) {
//   if (!url || typeof url !== "string") return "";
//   if (url.includes("://cloudinary.com") && url.includes("/upload/")) {
//     return url.replace("/upload/", "/upload/f_auto,q_auto,w_450,c_limit/");
//   }
//   return url;
// }

// async function getInitialProducts() {
//   // Next.js 16-এ প্রিরেন্ডারিং এরর এড়াতে connection() কল করা বাধ্যতামূলক
//   await connection();

//   try {
//     await connectDB();

//     const rawProducts = await Product.find({})
//       .select(
//         "title description price image category stock district upazila union moholla sellerId shopName sellerName",
//       )
//       .sort({ createdAt: -1 })
//       .limit(120)
//       .lean();

//     return rawProducts.map((p) => ({
//       _id: p._id.toString(),
//       title: p.title || "",
//       description: p.description || "",
//       price: Number(p.price) || 0,
//       image: optimizeCloudinaryUrl(p.image),
//       category: p.category || "মুদি",
//       stock: Number(p.stock) || 10,
//       district: p.district || "",
//       upazila: p.upazila || "",
//       union: p.union || "",
//       moholla: p.moholla || "",
//       sellerId: p.sellerId ? p.sellerId.toString() : "seller_default",
//       shopName: p.shopName || "উপজেলা ভেরিফায়েড স্টোর",
//       sellerName: p.sellerName || "স্থানীয় বিক্রেতা",
//       rating: Number(p.rating) || 0,
//       numReviews: Number(p.numReviews) || 0,
//     }));
//   } catch (error) {
//     console.error("Home Page Fetch Error:", error);
//     return [];
//   }
// }

// async function HomeContent() {
//   const initialProducts = await getInitialProducts();
//   return <HomeClient initialProducts={initialProducts} />;
// }

// export default function HomePage() {
//   return (
//     <>
//       <NoticeBanner />
//       <Suspense
//         fallback={
//           <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//             <p className="text-emerald-600 font-bold text-lg animate-pulse">
//               উপজেলা বাজার লোড হচ্ছে...
//             </p>
//           </div>
//         }
//       >
//         <HomeContent />
//       </Suspense>
//     </>
//   );
// }



import { Suspense } from "react";
import { connection } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Review from "@/models/Review";
import HomeClient from "@/components/HomeClient";
import NoticeBanner from "@/components/NoticeBanner";

function optimizeCloudinaryUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (url.includes("://cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", "/upload/f_auto,q_auto,w_450,c_limit/");
  }
  return url;
}

async function getInitialProducts() {
  await connection();

  try {
    await connectDB();

    // একসাথে প্রোডাক্ট এবং সব রিভিউ আনা হচ্ছে
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

    // প্রতিটি প্রোডাক্টের জন্য আসল গড় রেটিং হিসাব করা (String বা ObjectId যেভাবেই থাকুক কাজ করবে)
    const ratingMap = {};
    allReviews.forEach((rev) => {
      const pid = rev.productId?.toString();
      if (!pid) return;
      if (!ratingMap[pid]) {
        ratingMap[pid] = { sum: 0, count: 0 };
      }
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
        sellerId: p.sellerId ? p.sellerId.toString() : "seller_default",
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
  const initialProducts = await getInitialProducts();
  return <HomeClient initialProducts={initialProducts} />;
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
