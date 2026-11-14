import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyAdmin } from "@/lib/adminAuth";

export async function PATCH(req, { params }) {
  try {
    // ১. ১০০% অ্যাডমিন ভেরিফিকেশন
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { message: "অ্যাক্সেস অস্বীকৃত (Forbidden)" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { action, role } = body;

    // ২. সেল্ফ-প্রোটেকশন: অ্যাডমিন নিজেকে ব্লক বা ডাউনগ্রেড করতে পারবেন না
    if (id === admin._id) {
      return NextResponse.json(
        { message: "নিরাপত্তার স্বার্থে নিজের অ্যাকাউন্ট পরিবর্তন করা যাবে না!" },
        { status: 400 }
      );
    }

    await connectDB();
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ message: "ইউজার পাওয়া যায়নি" }, { status: 404 });
    }

    if (action === "approve") {
      targetUser.isApproved = true;
      targetUser.isVerified = true;
      targetUser.isBlocked = false;
      targetUser.status = "approved";
    } else if (action === "block") {
      targetUser.isBlocked = true;
      targetUser.status = "blocked";
    } else if (action === "unblock") {
      targetUser.isBlocked = false;
      targetUser.status = "approved";
    } else if (
      action === "changeRole" &&
      ["customer", "seller", "rider", "admin"].includes(role)
    ) {
      targetUser.role = role;
    } else {
      return NextResponse.json({ message: "অবৈধ অনুরোধ" }, { status: 400 });
    }

    await targetUser.save();

    return NextResponse.json({
      message: "ইউজারের তথ্য সফলভাবে আপডেট হয়েছে!",
      user: {
        _id: targetUser._id.toString(),
        role: targetUser.role,
        status: targetUser.status,
        isApproved: targetUser.isApproved,
        isBlocked: targetUser.isBlocked,
      },
    });
  } catch (error) {
    console.error("Admin User Update Error:", error);
    return NextResponse.json({ message: "সার্ভার এরর!" }, { status: 500 });
  }
}
