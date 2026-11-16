import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyAdmin } from "@/lib/adminAuth";
import { MANAGEABLE_ROLES } from "@/lib/adminScope";

export async function PATCH(req, { params }) {
  try {
    // ১. অ্যাডমিন ভেরিফিকেশন
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

    // ২. সেল্ফ-প্রোটেকশন
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

    const isSuper = admin.role === "admin" || admin.role === "super_admin";
    const allowedRoles = MANAGEABLE_ROLES[admin.role] || [];

    // ৩. হায়ারার্কি ও এলাকাভিত্তিক প্রোটেকশন
    if (!isSuper) {
      if (!allowedRoles.includes(targetUser.role) && targetUser.role !== "customer") {
        return NextResponse.json(
          { message: "আপনি উপরের বা সমপর্যায়ের কোনো অ্যাডমিনকে পরিবর্তন করতে পারবেন না!" },
          { status: 403 }
        );
      }

      const isSameArea =
        (admin.role === "division_admin" && targetUser.division === admin.division) ||
        (admin.role === "district_admin" && targetUser.district === admin.district) ||
        (admin.role === "upazila_admin" && targetUser.upazila === admin.upazila) ||
        (admin.role === "union_admin" && targetUser.union === admin.union);

      if (!isSameArea) {
        return NextResponse.json(
          { message: "আপনি অন্য এলাকার কোনো ইউজার বা অ্যাডমিনকে পরিবর্তন করতে পারবেন না!" },
          { status: 403 }
        );
      }
    }

    // ৪. অ্যাকশন প্রয়োগ (জরুরি সেশন আনলকসহ)
    if (action === "approve") {
      targetUser.isApproved = true;
      targetUser.isVerified = true;
      targetUser.isBlocked = false;
      targetUser.status = "approved";
    } else if (action === "block") {
      targetUser.isBlocked = true;
      targetUser.status = "blocked";
      targetUser.activeSessionId = ""; // ব্লক করলে সাথে সাথে লগআউটও হয়ে যাবে
    } else if (action === "unblock") {
      targetUser.isBlocked = false;
      targetUser.status = "approved";
    } else if (action === "unlockSession") {
      targetUser.activeSessionId = ""; // 🔓 জরুরি প্রয়োজনে ডিভাইস/সেশন লক খোলা
    } else if (
      action === "changeRole" &&
      (isSuper || allowedRoles.includes(role) || role === "customer")
    ) {
      targetUser.role = role;
    } else {
      return NextResponse.json({ message: "অবৈধ অনুরোধ বা অনুমতি নেই" }, { status: 400 });
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
        activeSessionId: targetUser.activeSessionId,
      },
    });
  } catch (error) {
    console.error("Admin User Update Error:", error);
    return NextResponse.json({ message: "সার্ভার এরর!" }, { status: 500 });
  }
}
