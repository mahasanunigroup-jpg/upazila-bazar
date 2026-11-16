import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyAdmin } from "@/lib/adminAuth";
import { signToken } from "@/lib/auth";
import { ROLE_ROUTES } from "@/utils/roleRedirect";

// ১. সুপার অ্যাডমিন থেকে অন্য ইউজারের অ্যাকাউন্টে প্রবেশ (POST)
export async function POST(req) {
  try {
    const admin = await verifyAdmin();
    if (!admin || (admin.role !== "super_admin" && admin.role !== "admin")) {
      return NextResponse.json({ error: "শুধুমাত্র সুপার অ্যাডমিনের এই অনুমতি আছে" }, { status: 403 });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return NextResponse.json({ error: "ইউজার আইডি প্রয়োজন" }, { status: 400 });
    }

    await connectDB();
    const targetUser = await User.findById(targetUserId).lean();
    if (!targetUser) {
      return NextResponse.json({ error: "ইউজার পাওয়া যায়নি" }, { status: 404 });
    }

    const cookieStore = await cookies();
    const currentSuperToken = cookieStore.get("token")?.value;

    // টার্গেট ইউজারের জন্য নতুন টোকেন (আসল ইউজারের activeSessionId সহ, যাতে সেশন লক ব্লক না করে)
    const impersonateToken = await signToken({
      userId: targetUser._id.toString(),
      role: targetUser.role,
      name: targetUser.name,
      shopName: targetUser.shopName || "",
      division: targetUser.division || "",
      district: targetUser.district || "",
      upazila: targetUser.upazila || "",
      union: targetUser.union || "",
      sessionId: targetUser.activeSessionId || "",
      isImpersonating: true, // বুঝার জন্য যে সুপার অ্যাডমিন ভিজিট করছেন
    });

    const redirectUrl = ROLE_ROUTES[targetUser.role] || "/";

    const response = NextResponse.json({
      message: `${targetUser.name}-এর অ্যাকাউন্টে প্রবেশ করা হয়েছে`,
      redirectUrl,
      user: {
        id: targetUser._id.toString(),
        name: targetUser.name,
        role: targetUser.role,
        division: targetUser.division || "",
        district: targetUser.district || "",
        upazila: targetUser.upazila || "",
        union: targetUser.union || "",
      },
    });

    // মূল সুপার অ্যাডমিনের টোকেনটি ব্যাকআপ কুকিতে সংরক্ষণ
    if (currentSuperToken && !cookieStore.get("super_admin_token")) {
      response.cookies.set("super_admin_token", currentSuperToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 4, // ৪ ঘণ্টা
        path: "/",
      });
    }

    // বর্তমান টোকেন পরিবর্তন করে টার্গেট ইউজারের টোকেন সেট করা
    response.cookies.set("token", impersonateToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 4,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Impersonate Error:", error);
    return NextResponse.json({ error: "সার্ভারে সমস্যা হয়েছে" }, { status: 500 });
  }
}

// ২. আবার সুপার অ্যাডমিন অ্যাকাউন্টে ফিরে আসা (DELETE)
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const superToken = cookieStore.get("super_admin_token")?.value;

    if (!superToken) {
      return NextResponse.json({ error: "সুপার অ্যাডমিন সেশন পাওয়া যায়নি" }, { status: 400 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(superToken, secret);

    const response = NextResponse.json({
      message: "সুপার অ্যাডমিন প্যানেলে ফিরে এসেছেন",
      redirectUrl: "/admin",
      user: {
        id: payload.userId,
        name: payload.name,
        role: payload.role,
      },
    });

    // সুপার অ্যাডমিনের টোকেন ফিরিয়ে আনা এবং ব্যাকআপ কুকি মুছে ফেলা
    response.cookies.set("token", superToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    response.cookies.set("super_admin_token", "", { maxAge: 0, path: "/" });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "ফিরে আসতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
