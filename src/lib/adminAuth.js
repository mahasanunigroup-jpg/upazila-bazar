import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function verifyAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "admin") return null;

    const userId = payload.userId || payload.id;
    if (!userId) return null;

    // ডাটাবেস থেকে রিয়েল-টাইম ভেরিফিকেশন (১০০% নিরাপত্তার জন্য)
    await connectDB();
    const adminUser = await User.findById(userId)
      .select("_id name email role isBlocked status")
      .lean();

    if (!adminUser || adminUser.role !== "admin") return null;
    if (adminUser.isBlocked || adminUser.status === "blocked") return null;

    return {
      ...adminUser,
      _id: adminUser._id.toString(),
    };
  } catch (error) {
    return null;
  }
}
