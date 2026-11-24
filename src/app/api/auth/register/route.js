import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      name,
      email,
      phone,
      password,
      role,
      shopName,
      marketName,
      district,
      upazila,
      union,
      moholla,
      address,
    } = body;

    if (!name || !password || (!email && !phone)) {
      return NextResponse.json(
        { error: "নাম, পাসওয়ার্ড এবং ইমেইল বা ফোন নম্বর দিন" },
        { status: 400 }
      );
    }

    if (role === "seller" && (!shopName?.trim() || !marketName?.trim())) {
      return NextResponse.json(
        { error: "দোকানদার অ্যাকাউন্টের জন্য দোকানের নাম এবং বাজারের নাম আবশ্যক" },
        { status: 400 }
      );
    }

    const queryConditions = [];
    if (email) queryConditions.push({ email: email.trim().toLowerCase() });
    if (phone) queryConditions.push({ phone: phone.trim() });

    const existingUser = await User.findOne({ $or: queryConditions }).lean();
    if (existingUser) {
      return NextResponse.json(
        { error: "এই ইমেইল বা ফোন নম্বর দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalMarket = (marketName || moholla || "").trim();

    const user = await User.create({
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : undefined,
      phone: phone ? phone.trim() : undefined,
      password: hashedPassword,
      role: role || "customer",
      shopName: role === "seller" ? shopName.trim() : "",
      marketName: role === "seller" ? finalMarket : "",
      district: district || "",
      upazila: upazila || "",
      union: union || "",
      moholla: finalMarket,
      address: address ? address.trim() : "",
    });

    return NextResponse.json(
      {
        message: "নিবন্ধন সফল হয়েছে! এখন লগইন করুন।",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          shopName: user.shopName,
          marketName: user.marketName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "রেজিস্ট্রেশন করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
