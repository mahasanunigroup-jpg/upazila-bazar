import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

// শুধুমাত্র নতুন (Unread) নোটিফিকেশনগুলো আনা
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 401 });

    await connectDB();
    const userId = user.userId || user.id;
    const isSuper = user.role === "super_admin" || user.role === "admin";

    const roleCondition = isSuper
      ? [{ recipientId: userId }, { recipientRole: "super_admin" }, { recipientRole: "admin" }]
      : [{ recipientId: userId }, { recipientRole: user.role, district: user.district || "" }];

    // 👇 শুধুমাত্র isRead: false (নতুন না দেখা) নোটিফিকেশনগুলোই আনবে
    const notifications = await Notification.find({
      isRead: false,
      $or: roleCondition,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        ...n,
        _id: n._id.toString(),
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount: notifications.length,
    });
  } catch (error) {
    return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 500 });
  }
}

// দেখার পর বা ক্লিয়ার করলে তালিকা থেকে সরিয়ে দেওয়া (isRead: true)
export async function PATCH(req) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { notificationId, markAll } = await req.json();
    await connectDB();

    if (markAll) {
      const userId = user.userId || user.id;
      const isSuper = user.role === "super_admin" || user.role === "admin";
      const condition = isSuper
        ? [{ recipientId: userId }, { recipientRole: "super_admin" }, { recipientRole: "admin" }]
        : [{ recipientId: userId }, { recipientRole: user.role }];

      await Notification.updateMany({ $or: condition }, { $set: { isRead: true } });
    } else if (notificationId) {
      await Notification.updateOne({ _id: notificationId }, { $set: { isRead: true } });
    }

    return NextResponse.json({ message: "Cleared" });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
