import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const identifier = body.email || body.phone || body.identifier;
    const { password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "ইমেইল/ফোন এবং পাসওয়ার্ড দিন" },
        { status: 400 },
      );
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return NextResponse.json(
        { error: "অ্যাকাউন্ট পাওয়া যায়নি। আগে রেজিস্ট্রেশন করুন" },
        { status: 401 },
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { error: "আপনার অ্যাকাউন্টটি সাময়িকভাবে ব্লক করা হয়েছে।" },
        { status: 403 },
      );
    }

    if (user.isApproved === false) {
      return NextResponse.json(
        { error: "আপনার অ্যাকাউন্টটি এখনো অনুমোদিত হয়নি।" },
        { status: 403 },
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "ভুল পাসওয়ার্ড দিয়েছেন" },
        { status: 401 },
      );
    }

    // 🛡️ ৩০ মিনিটের স্মার্ট সেশন লক ও অটো-আনলক চেক
    const THIRTY_MINUTES = 30 * 60 * 1000;
    const isRecentlyActive =
      user.lastActiveAt &&
      Date.now() - new Date(user.lastActiveAt).getTime() < THIRTY_MINUTES;
    const isSuperAdmin = user.role === "super_admin" || user.role === "admin";
    if (
      user.activeSessionId &&
      isRecentlyActive &&
      !isSuperAdmin &&
      user.role !== "customer"
    ) {
      const attackerDevice =
        req.headers.get("user-agent")?.slice(0, 80) || "অজানা ডিভাইস";

      // আসল অ্যাডমিনকে সিকিউরিটি অ্যালার্ট পাঠানো
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            securityAlert: {
              hasAlert: true,
              message:
                "আপনার সঠিক পাসওয়ার্ড ব্যবহার করে অন্য একটি ডিভাইস থেকে লগইনের চেষ্টা করা হয়েছে!",
              deviceInfo: attackerDevice,
              attemptedAt: new Date(),
            },
          },
        },
      );

      return NextResponse.json(
        {
          error:
            "নিরাপত্তা সতর্কতা: এই অ্যাকাউন্টটি বর্তমানে সক্রিয় আছে! ব্রাউজার বন্ধ করে থাকলে ৩০ মিনিট অপেক্ষা করুন অথবা সুপার অ্যাডমিনের মাধ্যমে আনলক করুন।",
        },
        { status: 403 },
      );
    }

    // নতুন সেশন আইডি ও বর্তমান সময় সেভ করা
    const newSessionId = crypto.randomUUID();
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          activeSessionId: newSessionId,
          lastActiveAt: new Date(),
        },
      },
    );

    // JWT টোকেন তৈরি
    const token = await signToken({
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
      shopName: user.shopName || "",
      division: user.division || "",
      district: user.district || "",
      upazila: user.upazila || "",
      union: user.union || "",
      sessionId: newSessionId,
    });

    const response = NextResponse.json({
      message: "লগইন সফল হয়েছে",
      user: {
        id: user._id.toString(),
        customId: user.customId || "",
        name: user.name,
        email: user.email || "",
        phone: user.phone || "",
        role: user.role,
        shopName: user.shopName || "",
        division: user.division || "",
        district: user.district || "",
        upazila: user.upazila || "",
        union: user.union || "",
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "সার্ভারে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
