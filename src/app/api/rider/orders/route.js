import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

async function verifyRider() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "rider" && payload.role !== "admin") return null;
    return payload;
  } catch (error) {
    return null;
  }
}

export async function PATCH(req) {
  try {
    const rider = await verifyRider();
    if (!rider) {
      return NextResponse.json({ error: "অনুমোদিত রাইডার নন" }, { status: 401 });
    }

    const { orderId, deliveryStatus } = await req.json();
    const riderId = (rider.userId || rider.id)?.toString();

    await connectDB();

    const updateData = { deliveryStatus };
    if (deliveryStatus === "delivered") {
      updateData.status = "delivered";
    }

    await Order.updateOne(
      { _id: orderId, riderId: riderId },
      { $set: updateData }
    );

    return NextResponse.json({ success: true, message: "ডেলিভারি স্ট্যাটাস আপডেট হয়েছে" }, { status: 200 });
  } catch (error) {
    console.error("Rider Update Error:", error);
    return NextResponse.json({ error: "আপডেট করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
