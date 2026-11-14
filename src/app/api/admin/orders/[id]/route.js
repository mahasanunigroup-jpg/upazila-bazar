import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { verifyAdmin } from "@/lib/adminAuth";

export async function PATCH(req, { params }) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ message: "অ্যাক্সেস অস্বীকৃত" }, { status: 403 });
    }

    const { id } = await params;
    const { status, riderId } = await req.json();

    await connectDB();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: "অর্ডার পাওয়া যায়নি" }, { status: 404 });
    }

    // যদি অ্যাডমিন অর্ডার Cancel করেন এবং আগে Cancel না হয়ে থাকে, তবে স্টক ফেরত দেওয়া
    if (status === "cancelled" && order.status !== "cancelled") {
      const restockOps = (order.items || [])
        .filter((i) => i.productId)
        .map((item) => ({
          updateOne: {
            filter: { _id: item.productId },
            update: { $inc: { stock: Number(item.qty || 1) } },
          },
        }));

      if (restockOps.length > 0) {
        await Product.bulkWrite(restockOps);
      }
    }

    if (status) {
      order.status = status;
      if (status === "delivered") {
        order.deliveryStatus = "delivered";
      }
    }

    if (riderId !== undefined) {
      order.riderId = riderId || null;
    }

    await order.save();

    return NextResponse.json({
      message: "অর্ডার সফলভাবে আপডেট হয়েছে!",
      order,
    });
  } catch (error) {
    console.error("Admin Order Update Error:", error);
    return NextResponse.json({ message: "আপডেট ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
