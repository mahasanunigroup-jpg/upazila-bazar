// src/app/api/auth/login/route.js
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-key');

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।" }, { status: 400 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।" }, { status: 400 });
    }

    const token = await new SignJWT({ 
      id: user._id.toString(), 
      role: user.role, 
      name: user.name,
      district: user.district,
      upazila: user.upazila 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(SECRET_KEY);

    const response = NextResponse.json({
      message: "লগইন সফল হয়েছে!",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        upazila: user.upazila
      }
    }, { status: 200 });

    // 🚀 ফিক্স: রোল অনুযায়ী আলাদা কুকির নাম নির্ধারণ করা হলো
    let cookieName = "customer_token";
    if (user.role === "seller") cookieName = "seller_token";
    if (user.role === "rider") cookieName = "rider_token";

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // ২৪ ঘণ্টা
      path: '/',
    });

    return response;

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "সার্ভার এরর!" }, { status: 500 });
  }
}
