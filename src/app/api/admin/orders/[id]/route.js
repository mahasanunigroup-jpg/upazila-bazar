import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { verifyAdmin } from "@/lib/adminAuth";
import { recordAuditLog } from "@/lib/auditLogger";

export async function PATCH(req) {
  try {
    // ১. অ্যাডমিন ভেরিফিকেশন
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { message: "অননুমোদিত অ্যাক্সেস (Forbidden)" },
        { status: 403 }
      );
    }

    const { orderId, riderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { message: "অর্ডার আইডি প্রয়োজন" },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { message: "অর্ডারটি খুঁজে পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    const oldRiderId = order.riderId ? order.riderId.toString() : "";
    let newRiderName = "রাইডার বাতিল (Unassigned)";

    if (riderId) {
      const rider = await User.findById(riderId).select("name phone").lean();
      if (rider) {
        newRiderName = `${rider.name} (${rider.phone || ""})`;
      }
      order.riderId = riderId;
      if (order.deliveryStatus === "unassigned") {
        order.deliveryStatus = "assigned";
      }
    } else {
      order.riderId = null;
      order.deliveryStatus = "unassigned";
    }

    await order.save();

    // ২. স্থায়ী অডিট লগ এবং সুপার অ্যাডমিনের কাছে রিয়েল-টাইম নোটিফিকেশন পাঠানো
    await recordAuditLog({
      admin,
      actionType: "RIDER_ASSIGN",
      targetId: order.orderId || orderId.toString(),
      description: `অর্ডার #${order.orderId || orderId}-এ রাইডার পরিবর্তন করে "${newRiderName}" সেট করা হয়েছে।`,
      metadata: { oldRiderId, newRiderId: riderId || "" },
    });

    return NextResponse.json({
      success: true,
      message: "রাইডার সফলভাবে আপডেট হয়েছে!",
    });
  } catch (error) {
    console.error("Admin Assign Rider Error:", error);
    return NextResponse.json(
      { message: "রাইডার অ্যাসাইন করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
