// src/app/api/orders/my-deliveries/route.js
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const riderId = searchParams.get("riderId");

    if (!riderId) {
      return NextResponse.json({ error: "রাইডার আইডি প্রয়োজন।" }, { status: 400 });
    }

    // এই রাইডারের একসেপ্ট করা কিন্তু এখনও ডেলিভারি না হওয়া অর্ডারগুলো খোঁজা
    const myActiveOrders = await Order.find({ 
      riderId: riderId, 
      status: { $in: ['accepted_by_shop', 'picked_up'] } 
    }).sort({ createdAt: -1 });

    return NextResponse.json({ orders: myActiveOrders }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
