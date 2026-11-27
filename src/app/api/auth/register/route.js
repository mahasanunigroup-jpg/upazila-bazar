import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";

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
      otp,
    } = body;

    if (!name || !password || !email || !phone) {
      return NextResponse.json(
        { error: "নাম, ইমেইল, মোবাইল নম্বর এবং পাসওয়ার্ড আবশ্যক" },
        { status: 400 }
      );
    }

        if (!otp || !otp.toString().trim()) {
      return NextResponse.json(
        { error: "ভেরিফিকেশন টোকেন পাওয়া যায়নি!" },
        { status: 400 }
      );
    }


    if (role === "seller" && (!shopName?.trim() || !marketName?.trim())) {
      return NextResponse.json(
        { error: "দোকানদার অ্যাকাউন্টের জন্য দোকানের নাম এবং বাজারের নাম আবশ্যক" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // ১. ইমেইল OTP যাচাই করা
    const otpRecord = await Otp.findOne({ email: cleanEmail });
    if (!otpRecord) {
      return NextResponse.json(
        { error: "OTP কোডের মেয়াদ শেষ হয়ে গেছে! অনুগ্রহ করে আবার কোড পাঠান।" },
        { status: 400 }
      );
    }

    const isOtpValid = await bcrypt.compare(otp.toString().trim(), otpRecord.otpHash);
    if (!isOtpValid) {
      return NextResponse.json(
        { error: "ভুল OTP কোড দিয়েছেন! ইমেইল দেখে সঠিক কোডটি বসান।" },
        { status: 400 }
      );
    }

    // ২. ইউজার ইতিমধ্যে আছে কি না চেক করা
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }],
    }).lean();

    if (existingUser) {
      return NextResponse.json(
        { error: "এই ইমেইল বা ফোন নম্বর দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalMarket = (marketName || moholla || "").trim();
    const finalRole = role || "customer";

    // ৩. নতুন ইউজার তৈরি করা (কাস্টমার হলে কর্পোরেট অ্যাকাউন্ট হিসেবে সেট হবে)
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      role: finalRole,
      accountType: finalRole === "customer" ? "corporate" : "regular",
      shopName: finalRole === "seller" ? shopName.trim() : "",
      marketName: finalRole === "seller" ? finalMarket : "",
      district: district || "",
      upazila: upazila || "",
      union: union || "",
      moholla: finalMarket,
      address: address ? address.trim() : "",
    });

    // ৪. ব্যবহৃত OTP মুছে ফেলা
    await Otp.deleteMany({ email: cleanEmail });

    return NextResponse.json(
      {
        message: "নিবন্ধন সফল হয়েছে! এখন লগইন করুন।",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          accountType: user.accountType,
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
