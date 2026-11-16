import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // লগআউটের সময় ডাটাবেস থেকে সেশন আনলক করা
    if (token) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret).catch(() => ({ payload: null }));

      const userId = payload?.userId || payload?.id;
      if (userId) {
        await connectDB();
        await User.updateOne(
          { _id: userId },
          { $set: { activeSessionId: "" } }
        );
      }
    }
  } catch (error) {
    console.error("Logout Error:", error);
  }

  const response = NextResponse.json({ message: "সফলভাবে লগআউট হয়েছে" });
  response.cookies.set("token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return response;
}
