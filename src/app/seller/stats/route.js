// src/app/api/products/seller/route.js
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import mongoose from "mongoose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-key');

export async function GET(req) {
  try {
    await connectDB();
    const token = req.cookies.get('seller_token')?.value;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET_KEY);
    const sellerId = payload.id;
    const queryId = mongoose.Types.ObjectId.isValid(sellerId) ? new mongoose.Types.ObjectId(sellerId) : sellerId;

    const sellerProducts = await Product.find({ sellerId: queryId });
    return NextResponse.json({ success: true, products: sellerProducts });
  } catch (error) {
    return NextResponse.json({ success: false, error: "সার্ভার এরর!" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const token = req.cookies.get('seller_token')?.value;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET_KEY);
    const sellerId = payload.id;
    const district = payload.district || "Dhaka";
    const upazila = payload.upazila || "Savar";
    const finalSellerId = mongoose.Types.ObjectId.isValid(sellerId) ? new mongoose.Types.ObjectId(sellerId) : new mongoose.Types.ObjectId();

    const body = await req.json();

    const newProduct = new Product({
      title: String(body.title),
      description: body.description || "তাজা ও সুস্বাদু পণ্য।",
      price: Number(body.price) || 0,
      stock: Number(body.stock) || 0, // 🚀 আপনার মডেলের 'stock' কলামে রিয়েল নাম্বার সেভ হবে
      category: body.category || "সবজি",
      sellerId: finalSellerId,
      district,
      upazila,
      imageUrl: body.imageUrl || ""
    });

    await newProduct.save();
    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    return NextResponse.json({ success: false, error: "ডাটাবেজে সেভ করতে সমস্যা হয়েছে।" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const token = req.cookies.get('seller_token')?.value;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const id = body.id || body._id;

    if (!id) return NextResponse.json({ success: false, error: "প্রোডাক্ট আইডি প্রয়োজন।" }, { status: 400 });

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          title: String(body.title),
          price: Number(body.price) || 0,
          stock: Number(body.stock) || 0, // 🚀 এডিট করলেও সংখ্যা সেভ থাকবে
          category: body.category,
          imageUrl: body.imageUrl
        }
      },
      { new: true }
    );

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    return NextResponse.json({ success: false, error: "আপডেট করতে সমস্যা হয়েছে।" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const token = req.cookies.get('seller_token')?.value;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, error: "প্রোডাক্ট আইডি প্রয়োজন।" }, { status: 400 });

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "প্রোডাক্ট সফলভাবে ডিলিট হয়েছে।" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "ডিলিট করতে সমস্যা হয়েছে।" }, { status: 500 });
  }
}
