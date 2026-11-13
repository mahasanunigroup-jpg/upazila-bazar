import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

async function getVerifiedSeller() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "seller") return null;
    return payload;
  } catch (error) {
    return null;
  }
}

export async function PATCH(req) {
  try {
    const seller = await getVerifiedSeller();
    if (!seller) {
      return NextResponse.json({ error: "অনুমোদিত সেলার নন" }, { status: 401 });
    }

    const { orderId, newStatus, riderId } = await req.json();
    await connectDB();

    const order = await Order.findById(orderId).lean();
    if (!order) {
      return NextResponse.json({ error: "অর্ডার পাওয়া যায়নি" }, { status: 404 });
    }

    const updateData = {};

    // ১. প্যাকিং বা ক্যানসেল স্ট্যাটাস আপডেট (সব আইটেমে সরাসরি সেট হবে)
    if (newStatus) {
      const updatedItems = (order.items || []).map((item) => ({
        ...item,
        itemStatus: newStatus,
      }));

      updateData.items = updatedItems;
      if (newStatus === "cancelled") {
        updateData.status = "cancelled";
      } else if (order.status === "pending") {
        updateData.status = "processing";
      }
    }

    // ২. রাইডার অ্যাসাইন আপডেট
    if (riderId !== undefined) {
      updateData.riderId = riderId || null;
      updateData.deliveryStatus = riderId ? "assigned" : "unassigned";
      if (riderId) {
        updateData.status = "shipped";
      }
    }

    await Order.updateOne({ _id: orderId }, { $set: updateData });

    return NextResponse.json({ success: true, message: "আপডেট সফল হয়েছে" }, { status: 200 });
  } catch (error) {
    console.error("Seller Update Error:", error);
    return NextResponse.json({ error: "আপডেট করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
