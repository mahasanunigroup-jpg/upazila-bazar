// src/app/api/orders/rider/route.js
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    
    // ইউআরএল থেকে রাইডারের উপজেলা নেওয়া (যেমন: ?upazila=Savar)
    const { searchParams } = new URL(req.url);
    const upazila = searchParams.get("upazila");

    if (!upazila) {
      return NextResponse.json({ error: "উপজেলা প্যারামিটার প্রয়োজন।" }, { status: 400 });
    }

    // রাইডারের নিজস্ব উপজেলার যে অর্ডারগুলো এখনও কোনো রাইডার একসেপ্ট করেনি (riderId: null)
    const openOrders = await Order.find({ 
      upazila: upazila, 
      status: 'pending', 
      riderId: null 
    }).sort({ createdAt: -1 });

    return NextResponse.json({ orders: openOrders }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
