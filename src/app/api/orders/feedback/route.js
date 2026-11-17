import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Notification from "@/models/Notification";

export async function POST(req) {
  try {
    await connectDB();
    const { orderId, sellerRating, sellerComment, riderRating, riderComment } =
      await req.json();

    if (!orderId || !sellerRating || !riderRating) {
      return NextResponse.json(
        { error: "সেলার এবং রাইডার উভয়কে স্টার রেটিং দিন" },
        { status: 400 }
      );
    }

    const cleanOrderId = orderId.toString().trim();

    // ১. অর্ডারটি খুঁজে বের করা
    const order = await Order.findOne({ orderId: cleanOrderId }).lean();

    if (!order) {
      return NextResponse.json(
        { error: `অর্ডার আইডি (${cleanOrderId}) ডাটাবেজে পাওয়া যায়নি` },
        { status: 404 }
      );
    }

    const feedbackData = {
      isSubmitted: true,
      sellerRating: Number(sellerRating),
      sellerComment: sellerComment || "",
      riderRating: Number(riderRating),
      riderComment: riderComment || "",
      submittedAt: new Date(),
    };

    // ২. অর্ডারে ফিডব্যাক সেভ করা
    await Order.collection.updateOne(
      { orderId: cleanOrderId },
      { $set: { feedback: feedbackData } }
    );

    // ৩. আপনার Notification স্কিমা অনুযায়ী সেলার ও রাইডারের জন্য নোটিফিকেশন তৈরি
    const notificationsToCreate = [];

    const uniqueSellerIds = [
      ...new Set(
        (order.items || [])
          .map((item) => item.sellerId?.toString())
          .filter(Boolean)
      ),
    ];

    uniqueSellerIds.forEach((sId) => {
      notificationsToCreate.push({
        recipientRole: "seller",
        recipientId: sId,
        district: order.district || "",
        upazila: order.upazila || "",
        title: `⭐ নতুন কাস্টমার রিভিউ (${sellerRating}★)`,
        message: `অর্ডার #${cleanOrderId}-এ কাস্টমার আপনাকে ${sellerRating} স্টার রেটিং দিয়েছেন${
          sellerComment ? `: "${sellerComment}"` : "।"
        }`,
        link: "/seller/orders",
        isRead: false,
      });
    });

    if (order.riderId) {
      notificationsToCreate.push({
        recipientRole: "rider",
        recipientId: order.riderId.toString(),
        district: order.district || "",
        upazila: order.upazila || "",
        title: `⭐ ডেলিভারি রিভিউ (${riderRating}★)`,
        message: `অর্ডার #${cleanOrderId}-এর ডেলিভারিতে কাস্টমার আপনাকে ${riderRating} স্টার রেটিং দিয়েছেন${
          riderComment ? `: "${riderComment}"` : "।"
        }`,
        link: "/rider/dashboard",
        isRead: false,
      });
    }

    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }

    return NextResponse.json({
      success: true,
      feedback: feedbackData,
      message: "আপনার মূল্যবান ফিডব্যাকের জন্য ধন্যবাদ!",
    });
  } catch (error) {
    console.error("Feedback API Error:", error);
    return NextResponse.json(
      { error: "ফিডব্যাক সেভ করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
