import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary কনফিগারেশন (প্রোডাক্ট ডিলিটের সময় ছবি মোছার জন্য)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// টোকেন থেকে সেলার আইডি বের করার হেল্পার ফাংশন
async function getSellerId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "seller" && payload.role !== "admin") return null;
    return payload.userId || payload.id;
  } catch {
    return null;
  }
}

// ১. প্রোডাক্ট আপডেট (দাম, স্টক, নাম ইত্যাদি)
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const sellerId = await getSellerId();
    if (!sellerId) {
      return NextResponse.json({ message: "অনুমতি নেই (Unauthorized)" }, { status: 401 });
    }

    const { id } = await params; // Next.js 16 অনুযায়ী params await করতে হয়
    const body = await req.json();
    const { name, price, discountPrice, stock, isAvailable } = body;

    // প্রোডাক্টটি এই সেলারের কি না তা যাচাই
    const product = await Product.findOne({ _id: id, sellerId });
    if (!product) {
      return NextResponse.json({ message: "প্রোডাক্ট পাওয়া যায়নি বা আপনার অনুমতি নেই" }, { status: 404 });
    }

    // আপডেট ডাটা সেট করা
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = Number(price);
    if (discountPrice !== undefined) product.discountPrice = Number(discountPrice);
    if (stock !== undefined) product.stock = Number(stock);
    if (isAvailable !== undefined) product.isAvailable = Boolean(isAvailable);

    await product.save();

    return NextResponse.json({
      message: "প্রোডাক্ট সফলভাবে আপডেট হয়েছে!",
      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    return NextResponse.json({ message: "সার্ভার এরর!" }, { status: 500 });
  }
}

// ২. প্রোডাক্ট ডিলিট
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const sellerId = await getSellerId();
    if (!sellerId) {
      return NextResponse.json({ message: "অনুমতি নেই (Unauthorized)" }, { status: 401 });
    }

    const { id } = await params;
    const product = await Product.findOne({ _id: id, sellerId });

    if (!product) {
      return NextResponse.json({ message: "প্রোডাক্ট পাওয়া যায়নি" }, { status: 404 });
    }

    // Cloudinary থেকে ছবি ডিলিট করা (যদি public_id সেভ করা থাকে বা URL থেকে বের করা যায়)
    if (product.images && product.images.length > 0) {
      for (const imgUrl of product.images) {
        try {
          // URL থেকে public_id বের করার লজিক (যেমন: upazila_bazar/xyz123)
          const parts = imgUrl.split("/");
          const fileName = parts[parts.length - 1].split(".")[0];
          const folder = parts[parts.length - 2];
          if (folder && fileName) {
            await cloudinary.uploader.destroy(`${folder}/${fileName}`);
          }
        } catch (imgErr) {
          console.log("Cloudinary delete skipped:", imgErr.message);
        }
      }
    }

    await Product.deleteOne({ _id: id });

    return NextResponse.json({ message: "প্রোডাক্ট স্থায়ীভাবে ডিলিট করা হয়েছে!" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return NextResponse.json({ message: "ডিলিট করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
