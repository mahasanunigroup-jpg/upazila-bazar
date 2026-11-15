import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import User from "@/models/User";

const ADMIN_ROLES = [
  "admin",
  "super_admin",
  "division_admin",
  "district_admin",
  "upazila_admin",
  "union_admin",
];

export async function verifyAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (!ADMIN_ROLES.includes(payload.role)) return null;

    const userId = payload.userId || payload.id;
    if (!userId) return null;

    await connectDB();
    const adminUser = await User.findById(userId)
      .select("_id name email phone role division district upazila union isBlocked status")
      .lean();

    if (!adminUser || !ADMIN_ROLES.includes(adminUser.role)) return null;
    if (adminUser.isBlocked || adminUser.status === "blocked") return null;

    return {
      ...adminUser,
      _id: adminUser._id.toString(),
    };
  } catch (error) {
    return null;
  }
}
