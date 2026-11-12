// src/app/api/auth/register/route.js
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password, phone, role, district, upazila, address } = await req.json();

    // ইউজার অলরেডি আছে কিনা চেক করা
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // পাসওয়ার্ড হ্যাশ করা
    const hashedPassword = await bcrypt.hash(password, 10);

    // নতুন ইউজার তৈরি
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      district,
      upazila,
      address
    });

    return NextResponse.json({ message: "Registration successful!", user: { name: newUser.name, email: newUser.email } }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
