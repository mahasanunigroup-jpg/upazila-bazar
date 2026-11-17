import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id || resolvedParams.orderId;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "অর্ডার আইডি দেওয়া হয়নি।" },
        { status: 400 }
      );
    }

    await connectDB();

    let order = null;

    // ১. যদি ২৪ অক্ষরের বৈধ MongoDB ObjectId হয়, তবে _id দিয়ে খুঁজবে
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).lean();
    }

    // ২. যদি ObjectId না হয় বা পাওয়া না যায়, তবে 'UB-XXXXXX' (orderId ফিল্ড) দিয়ে খুঁজবে
    if (!order) {
      order = await Order.findOne({
        orderId: { $regex: new RegExp(`^${id.trim()}$`, "i") },
      }).lean();
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: "অর্ডারটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error) {
    console.error("Single Order API Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর হয়েছে।" },
      { status: 500 }
    );
  }
}
