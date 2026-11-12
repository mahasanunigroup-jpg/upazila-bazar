import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { customerName, customerPhone, customerAddress, items, totalAmount } =
      body;

    if (
      !customerName ||
      !customerPhone ||
      !customerAddress ||
      !items ||
      !totalAmount
    ) {
      return NextResponse.json(
        { message: "অনুগ্রহ করে সব তথ্য সঠিকভাবে প্রদান করুন" },
        { status: 400 },
      );
    }

    // ইউনিক অর্ডার আইডি তৈরি (উদাঃ UB-483920)
    const orderId = `UB-${Math.floor(100000 + Math.random() * 900000)}`;

    // models/Order.js স্কিমার সাথে হুবহু মিল রেখে ডাটা সাজানো
    const newOrder = await Order.create({
      orderId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      total_amount: `${totalAmount} টাকা`,
      items: items.map((item) => ({
        name: item.title,
        qty: item.quantity,
        price: `${item.price * item.quantity} টাকা`,
        sellerId: item.sellerId || "seller_default",
        shopName: item.shopName || "উপজেলা স্টোর",
      })),
      status: "pending",
    });

    return NextResponse.json(
      { message: "অর্ডার সফল হয়েছে", orderId: newOrder._id.toString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Checkout API Error:", error.message);
    return NextResponse.json(
      { message: `সার্ভারে সমস্যা হয়েছে: ${error.message}` },
      { status: 500 },
    );
  }
}
