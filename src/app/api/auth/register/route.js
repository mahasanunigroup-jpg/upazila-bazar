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
      district,
      upazila,
      union,
      address,
    } = body;

    if (!name || !password || (!email && !phone)) {
      return NextResponse.json(
        { error: "নাম, পাসওয়ার্ড এবং ইমেইল বা ফোন নম্বর দিন" },
        { status: 400 }
      );
    }

    const queryConditions = [];
    if (email) queryConditions.push({ email });
    if (phone) queryConditions.push({ phone });

    const existingUser = await User.findOne({ $or: queryConditions });
    if (existingUser) {
      return NextResponse.json(
        { error: "এই ইমেইল বা ফোন নম্বর দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email || undefined,
      phone: phone || undefined,
      password: hashedPassword,
      role: role || "customer",
      shopName: shopName || "",
      district: district || "",
      upazila: upazila || "",
      union: union || "",
      address: address || "",
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
