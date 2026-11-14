import { Suspense } from "react";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import ProductDetailsClient from "@/components/ProductDetailsClient";
import { createProductSlug, extractIdFromSlug } from "@/lib/slugify";

// ১. ডাইনামিক SEO মেটা ট্যাগ (গুগল ও ফেসবুক/হোয়াটসঅ্যাপ প্রিভিউয়ের জন্য)
export async function generateMetadata({ params }) {
  try {
    const { id: slugParam } = await params;
    const rawId = extractIdFromSlug(slugParam);
    await connection();
    if (!mongoose.Types.ObjectId.isValid(rawId)) {
      return { title: "পণ্য পাওয়া যায়নি | উপজেলা বাজার" };
    }

    await connectDB();
    const product = await Product.findById(rawId)
      .select("title name description price image images category upazila")
      .lean();

    if (!product) {
      return { title: "পণ্য পাওয়া যায়নি | উপজেলা বাজার" };
    }

    const title = product.title || product.name || "পণ্য";
    const price = Number(product.price || 0);
    const locationText = product.upazila ? `${product.upazila} - ` : "";
    const description =
      product.description?.slice(0, 155) ||
      `${locationText}${title} কিনুন মাত্র ৳${price} টাকায় উপজেলা বাজার থেকে। দ্রুত হোম ডেলিভারি।`;
    const imageUrl = product.images?.[0] || product.image || "";


    return {
      title: `${title} (৳${price}) | উপজেলা বাজার`,
      description,
      openGraph: {
        title: `${title} - ৳${price} | উপজেলা বাজার`,
        description,
        images: imageUrl ? [{ url: imageUrl }] : [],
        type: "website",
      },
    };
  } catch {
    return { title: "উপজেলা বাজার | স্থানীয় অনলাইন মার্কেটপ্লেস" };
  }
}

async function ProductDetailsLoader({ params }) {
  await connection();
  const { id: slugParam } = await params;
  const rawId = extractIdFromSlug(slugParam);

  if (!mongoose.Types.ObjectId.isValid(rawId)) {
    notFound();
  }

  await connectDB();
  const rawProduct = await Product.findById(rawId).lean();

  if (!rawProduct) {
    notFound();
  }

  const title = rawProduct.title || rawProduct.name || "পণ্য";
  const expectedSlug = createProductSlug(title, rawProduct._id.toString());

  // যদি কেউ শুধু ID দিয়ে আসে, তবে SEO-ফ্রেন্ডলি Slug URL-এ রিডাইরেক্ট করা
  if (decodeURIComponent(slugParam) !== expectedSlug) {
    redirect(`/product/${expectedSlug}`);
  }

  const rawRelated = await Product.find({
    category: rawProduct.category,
    _id: { $ne: rawProduct._id },
  })
    .limit(4)
    .lean();

  const product = {
    _id: rawProduct._id.toString(),
    slug: expectedSlug,
    title,
    description: rawProduct.description || "",
    category: rawProduct.category || "সাধারণ",
    price: Number(rawProduct.price || 0),
    oldPrice: Number(rawProduct.oldPrice || 0),
    stock: Number(rawProduct.stock ?? 0),
    sellerId: rawProduct.sellerId?.toString() || "",
    shopName: rawProduct.shopName || "উপজেলা বাজার স্টোর",
    location: [rawProduct.union, rawProduct.upazila].filter(Boolean).join(", "),
    images:
      rawProduct.images?.length > 0
        ? rawProduct.images
        : rawProduct.image
        ? [rawProduct.image]
        : ["/placeholder.png"],
    image: rawProduct.images?.[0] || rawProduct.image || "/placeholder.png",

  };

  const relatedProducts = rawRelated.map((r) => {
    const rTitle = r.title || r.name || "পণ্য";
    return {
      _id: r._id.toString(),
      slug: createProductSlug(rTitle, r._id.toString()),
      title: rTitle,
      price: Number(r.price || 0),
      image: r.images?.[0] || r.image || "/placeholder.png",
    };
  });

  // গুগল সার্চ Rich Snippet (JSON-LD Structured Data)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images,
    description: product.description || product.title,
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org"
          : "https://schema.org",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailsClient
        product={product}
        relatedProducts={relatedProducts}
      />
    </>
  );
}

export default function ProductDetailsPage({ params }) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Suspense
          fallback={
            <div className="bg-white p-16 text-center rounded-2xl border border-gray-100 text-gray-500">
              পণ্যের বিস্তারিত তথ্য লোড হচ্ছে...
            </div>
          }
        >
          <ProductDetailsLoader params={params} />
        </Suspense>
      </div>
    </div>
  );
}
