import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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
      return NextResponse.json({ error: "ইমেইল/ফোন এবং পাসওয়ার্ড দিন" }, { status: 400 });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return NextResponse.json({ error: "অ্যাকাউন্ট পাওয়া যায়নি। আগে রেজিস্ট্রেশন করুন" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "ভুল পাসওয়ার্ড দিয়েছেন" }, { status: 401 });
    }

    const token = await signToken({
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
      shopName: user.shopName || "",
    });

    // ফ্রন্টএন্ডের জন্য user অবজেক্টসহ রেসপন্স
    const response = NextResponse.json({
      message: "লগইন সফল হয়েছে",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email || "",
        phone: user.phone || "",
        role: user.role,
        shopName: user.shopName || "",
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
    return NextResponse.json({ error: "সার্ভারে সমস্যা হয়েছে" }, { status: 500 });
  }
}
