import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

// প্রোডাক্ট আপডেট (PATCH)
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const sellerId = await getSellerId();
    if (!sellerId) {
      return NextResponse.json({ message: "অনুমতি নেই (Unauthorized)" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, price, discountPrice, stock } = body;

    const product = await Product.findOne({ _id: id, sellerId });
    if (!product) {
      return NextResponse.json({ message: "প্রোডাক্ট পাওয়া যায়নি বা আপনার অনুমতি নেই" }, { status: 404 });
    }

    if (title !== undefined) {
      product.title = title;
      if (product.name !== undefined) product.name = title; // যদি name ফিল্ডও থাকে
    }
    if (price !== undefined) product.price = Number(price);
    if (discountPrice !== undefined) product.discountPrice = Number(discountPrice);
    if (stock !== undefined) product.stock = Number(stock);

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

// প্রোডাক্ট ডিলিট (DELETE)
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

    // Cloudinary থেকে ছবি ডিলিট করা
    const imgList = product.images?.length > 0 ? product.images : product.image ? [product.image] : [];
    for (const imgUrl of imgList) {
      try {
        const parts = imgUrl.split("/");
        const fileName = parts[parts.length - 1].split(".");
        const folder = parts[parts.length - 2];
        if (folder && fileName) {
          await cloudinary.uploader.destroy(`${folder}/${fileName}`);
        }
      } catch (imgErr) {
        console.log("Cloudinary delete skipped:", imgErr.message);
      }
    }

    await Product.deleteOne({ _id: id });

    return NextResponse.json({ message: "প্রোডাক্ট স্থায়ীভাবে ডিলিট করা হয়েছে!" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return NextResponse.json({ message: "ডিলিট করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
