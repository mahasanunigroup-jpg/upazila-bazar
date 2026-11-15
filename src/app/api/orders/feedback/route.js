import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await connectDB();
    const { orderId, sellerRating, sellerComment, riderRating, riderComment } =
      await req.json();

    if (!orderId || !sellerRating || !riderRating) {
      return NextResponse.json(
        { error: "সেলার এবং রাইডার উভয়কে স্টার রেটিং দিন" },
        { status: 400 }
      );
    }

    const cleanOrderId = orderId.toString().trim();

    const feedbackData = {
      isSubmitted: true,
      sellerRating: Number(sellerRating),
      sellerComment: sellerComment || "",
      riderRating: Number(riderRating),
      riderComment: riderComment || "",
      submittedAt: new Date(),
    };

    // সরাসরি MongoDB কালেকশনে আপডেট করা (যাতে Mongoose ক্যাশ কোনো বাধা না দেয়)
    const result = await Order.collection.updateOne(
      { orderId: cleanOrderId },
      { $set: { feedback: feedbackData } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: `অর্ডার আইডি (${cleanOrderId}) ডাটাবেজে পাওয়া যায়নি` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      feedback: feedbackData,
      message: "আপনার মূল্যবান ফিডব্যাকের জন্য ধন্যবাদ!",
    });
  } catch (error) {
    console.error("Feedback API Error:", error);
    return NextResponse.json(
      { error: "ফিডব্যাক সেভ করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
