import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json(
        { success: false, message: "অর্ডার আইডি অথবা মোবাইল নম্বর দিন।" },
        { status: 400 }
      );
    }

    await connectDB();

    // অর্ডার আইডি (যেমন UB-123456) অথবা কাস্টমার ফোন নম্বর দিয়ে ফাস্ট সার্চ
    const rawOrders = await Order.find({
      $or: [
        { orderId: { $regex: new RegExp(`^${query}$`, "i") } },
        { customer_phone: query },
      ],
    })
      .populate("riderId", "name phone") // রাইডার অ্যাসাইন থাকলে তার নাম ও ফোন আসবে
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const orders = rawOrders.map((o) => ({
      _id: o._id.toString(),
      orderId: o.orderId,
      customer_name: o.customer_name,
      customer_phone: o.customer_phone,
      district: o.district,
      upazila: o.upazila,
      customer_address: o.customer_address,
      total_amount: Number(o.total_amount || 0),
      delivery_charge: Number(o.delivery_charge || 0),
      payment_method: o.payment_method || "Cash on Delivery",
      paymentStatus: o.paymentStatus || "Unpaid",
      status: o.status || "pending",
      deliveryStatus: o.deliveryStatus || "unassigned",
      rider: o.riderId
        ? { name: o.riderId.name, phone: o.riderId.phone }
        : null,
      createdAt: o.createdAt ? o.createdAt.toISOString() : new Date().toISOString(),
      items: (o.items || []).map((item, idx) => ({
        _id: item._id ? item._id.toString() : `item_${idx}`,
        name: item.name,
        qty: Number(item.qty || 1),
        price: Number(item.price || 0),
        shopName: item.shopName || "উপজেলা ভেরিফায়েড স্টোর",
        itemStatus: item.itemStatus || "pending",
      })),
    }));

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    console.error("Track Order API Error:", error);
    return NextResponse.json(
      { success: false, message: "অর্ডার খুঁজতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
