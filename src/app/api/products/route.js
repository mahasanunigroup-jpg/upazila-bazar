import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

// ১. সব পণ্য দেখানোর ফাস্ট GET API
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({})
      .select("title price image category stock district upazila union sellerId shopName sellerName")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Fetch Products Error:", error);
    return NextResponse.json({ message: "পণ্য লোড করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}

// ২. নতুন পণ্য আপলোডের সিকিউর POST API (sellerId সহ)
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "অনুগ্রহ করে আগে লগইন করুন" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const currentSellerId = payload.userId || payload.id || payload._id;
    if (!currentSellerId) {
      return NextResponse.json({ error: "টোকেনে সেলার আইডি পাওয়া যায়নি" }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();

    const newProduct = await Product.create({
      title: body.title,
      description: body.description,
      price: Number(body.price),
      image: body.image,
      category: body.category,
      stock: Number(body.stock) || 10,
      district: body.district || "কিশোরগঞ্জ",
      upazila: body.upazila || "ভৈরব",
      union: body.union || "",
      sellerId: currentSellerId, // আসল sellerId সেভ হচ্ছে
      shopName: body.shopName || "উপজেলা ভেরিফায়েড স্টোর",
      sellerName: body.sellerName || payload.name || "স্থানীয় বিক্রেতা",
    });

    return NextResponse.json(
      { success: true, message: "পণ্য সফলভাবে যুক্ত হয়েছে!", product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Product Error:", error);
    return NextResponse.json(
      { error: "আপলোড ব্যর্থ হয়েছে: " + error.message },
      { status: 500 }
    );
  }
}
