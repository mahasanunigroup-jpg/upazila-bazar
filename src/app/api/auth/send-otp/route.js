import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, phone, name } = body;

    if (!email?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "ইমেইল এবং মোবাইল নম্বর আবশ্যক" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    await connectDB();

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }],
    })
      .select("email phone")
      .lean();

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            existingUser.email === cleanEmail
              ? "এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা আছে!"
              : "এই মোবাইল নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা আছে!",
        },
        { status: 400 }
      );
    }

    const token = crypto.randomBytes(24).toString("hex");
    const otpHash = await bcrypt.hash(token, 8);

    await Otp.deleteMany({ email: cleanEmail });
    await Otp.create({ email: cleanEmail, otpHash });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyLink = `${baseUrl}/verify-email?email=${encodeURIComponent(cleanEmail)}&token=${token}`;

    // আগের ১০০% কাজ করা Gmail ট্রান্সপোর্টার
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL.trim(),
        pass: process.env.SMTP_PASS.replace(/\s+/g, ""),
      },
    });

    // ব্যাকগ্রাউন্ডে ইমেইল পাঠানো হচ্ছে যাতে ইউজারকে ০.২ সেকেন্ডের বেশি অপেক্ষা করতে না হয়
    transporter
      .sendMail({
        from: `"উপজেলা বাজার" <${process.env.SMTP_EMAIL.trim()}>`,
        to: cleanEmail,
        subject: "উপজেলা বাজার - ১ ক্লিকে অ্যাকাউন্ট ভেরিফাই করুন",
        html: `
          <div style="background-color: #f3f4f6; padding: 24px 12px; font-family: Arial, sans-serif;">
            <table align="center" width="100%" style="max-width: 460px; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
              <tr>
                <td style="background: #16a34a; padding: 20px; text-align: center; color: #ffffff;">
                  <h2 style="margin: 0; font-size: 20px;">🛒 উপজেলা বাজার</h2>
                </td>
              </tr>
              <tr>
                <td style="padding: 26px 22px; text-align: center;">
                  <p style="margin: 0 0 10px; color: #111827; font-size: 15px; text-align: left;">
                    আসসালামু আলাইকুম <strong>${name || "সম্মানিত গ্রাহক"}</strong>,
                  </p>
                  <p style="margin: 0 0 22px; color: #4b5563; font-size: 14px; line-height: 1.6; text-align: left;">
                    আপনার রেজিস্ট্রেশন সম্পন্ন করতে নিচের সবুজ বাটনে মাত্র <strong>১টি ক্লিক</strong> করুন:
                  </p>
                  <a href="${verifyLink}" style="display: inline-block; background-color: #16a34a; color: #ffffff; font-size: 15px; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 10px;">
                    ✅ অ্যাকাউন্ট ভেরিফাই ও সম্পন্ন করুন
                  </a>
                  <p style="margin: 20px 0 0; color: #9ca3af; font-size: 11px;">
                    এই লিংকটি আগামী ৫ মিনিটের জন্য কার্যকর থাকবে।
                  </p>
                </td>
              </tr>
            </table>
          </div>
        `,
      })
      .catch((err) => console.error("Background Mail Error:", err));

    return NextResponse.json(
      { success: true, message: "আপনার ইমেইলে ভেরিফিকেশন লিংক পাঠানো হয়েছে!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send Verification Error:", error);
    return NextResponse.json(
      { error: "ইমেইল পাঠাতে সমস্যা হয়েছে: " + error.message },
      { status: 500 }
    );
  }
}
