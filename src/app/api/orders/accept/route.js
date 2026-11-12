// src/app/api/orders/accept/route.js
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { orderId, riderId } = await req.json();

    // অর্ডারটি খুঁজে বের করা
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "অর্ডারটি পাওয়া যায়নি।" }, { status: 404 });
    }

    // অলরেডি অন্য কেউ একসেপ্ট করেছে কিনা চেক করা
    if (order.riderId) {
      return NextResponse.json({ error: "দুঃখিত, এই অর্ডারটি ইতিমধ্যে অন্য একজন রাইডার গ্রহণ করেছেন।" }, { status: 400 });
    }

    // অর্ডার স্ট্যাটাস এবং রাইডার আইডি আপডেট করা
    order.riderId = riderId;
    order.status = 'accepted_by_shop'; // অথবা 'assigned_to_rider'
    await order.save();

    return NextResponse.json({ message: "অর্ডারটি আপনি সফলভাবে গ্রহণ করেছেন!", order }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
