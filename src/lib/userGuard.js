import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function getActiveUser(allowedRoles = []) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return { error: "অনুগ্রহ করে লগইন করুন", status: 401 };
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const userId = payload.userId || payload.id;
    if (!userId) {
      return { error: "অবৈধ সেশন", status: 401 };
    }

    await connectDB();
    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return { error: "অ্যাকাউন্ট পাওয়া যায়নি", status: 404 };
    }

    // ১. অ্যাডমিন ব্লক করলে সাথে সাথে আটকে দেওয়া
    if (user.isBlocked || user.status === "blocked") {
      return {
        error: "আপনার অ্যাকাউন্টটি অ্যাডমিন কর্তৃক ব্লক করা হয়েছে!",
        status: 403,
      };
    }

    // ২. সেলার বা রাইডার অ্যাপ্রুভ না হলে আটকে দেওয়া
    if (
      (user.role === "seller" || user.role === "rider") &&
      (user.isApproved === false || user.status === "pending")
    ) {
      return {
        error: "আপনার অ্যাকাউন্টটি এখনো অ্যাডমিন অ্যাপ্রুভালের অপেক্ষায় আছে।",
        status: 403,
      };
    }

    // ৩. রোল পারমিশন চেক
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return {
        error: "এই কাজের জন্য আপনার অনুমতি নেই",
        status: 403,
      };
    }

    return {
      user: {
        ...user,
        _id: user._id.toString(),
      },
    };
  } catch {
    return { error: "সেশন মেয়াদোত্তীর্ণ হয়েছে, আবার লগইন করুন", status: 401 };
  }
}
