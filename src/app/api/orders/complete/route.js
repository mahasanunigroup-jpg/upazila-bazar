// src/app/api/orders/complete/route.js
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { orderId } = await req.json();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "অর্ডারটি পাওয়া যায়নি।" }, { status: 404 });
    }

    // অর্ডারের স্ট্যাটাস আপডেট করে 'delivered' করা
    order.status = 'delivered';
    await order.save();

    return NextResponse.json({ message: "অভিনন্দন! ডেলিভারিটি সফলভাবে সম্পন্ন হয়েছে।" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
