import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ reviews: [], averageRating: 0, totalReviews: 0 });
    }

    await connectDB();
    const reviews = await Review.find({
      productId: new mongoose.Types.ObjectId(productId),
    })
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number(
            (
              reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
              totalReviews
            ).toFixed(1)
          )
        : 0;

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        _id: r._id.toString(),
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        isVerifiedBuyer: r.isVerifiedBuyer,
        createdAt: r.createdAt,
      })),
      averageRating,
      totalReviews,
    });
  } catch (error) {
    console.error("Review GET Error:", error);
    return NextResponse.json({ message: "রিভিউ লোড হয়নি" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "রিভিউ দিতে অনুগ্রহ করে লগইন করুন!" },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId || payload.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: "অবৈধ সেশন!" }, { status: 401 });
    }

    const { productId, rating, comment } = await req.json();

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ message: "অবৈধ পণ্য আইডি" }, { status: 400 });
    }
    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5 || !comment?.trim()) {
      return NextResponse.json(
        { message: "সঠিক স্টার রেটিং এবং মতামত লিখুন" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId).select("name isBlocked").lean();
    if (!user || user.isBlocked) {
      return NextResponse.json(
        { message: "আপনার অ্যাকাউন্ট থেকে রিভিউ দেওয়া সম্ভব নয়" },
        { status: 403 }
      );
    }

    const prodObjId = new mongoose.Types.ObjectId(productId);
    const userObjId = new mongoose.Types.ObjectId(userId);

    // ইউজার এই পণ্যটি ডেলিভারি পেয়েছে কি না তা যাচাই (Verified Buyer ব্যাজের জন্য)
    const hasDeliveredOrder = await Order.exists({
      customerId: userObjId,
      "items.productId": prodObjId,
      $or: [{ deliveryStatus: "delivered" }, { status: "delivered" }],
    });

    await Review.findOneAndUpdate(
      { productId: prodObjId, userId: userObjId },
      {
        $set: {
          userName: user.name || "ক্রেতা",
          rating: numRating,
          comment: comment.trim(),
          isVerifiedBuyer: Boolean(hasDeliveredOrder),
        },
      },
      { upsert: true, new: true }
    );

    // পণ্যের গড় রেটিং আপডেট করে Product মডেলে সেভ রাখা
    const allReviews = await Review.find({ productId: prodObjId })
      .select("rating")
      .lean();
    const totalReviews = allReviews.length;
    const avgRating = Number(
      (
        allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      ).toFixed(1)
    );

    await Product.collection.updateOne(
      { _id: prodObjId },
      { $set: { rating: avgRating, numReviews: totalReviews } }
    );

    return NextResponse.json({
      message: "আপনার মূল্যবান রিভিউটি সংরক্ষিত হয়েছে!",
    });
  } catch (error) {
    console.error("Review POST Error:", error);
    return NextResponse.json({ message: "রিভিউ সেভ হয়নি" }, { status: 500 });
  }
}
