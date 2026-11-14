import { Suspense } from "react";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";
import User from "@/models/User";
import NoticeMarqueeClient from "@/components/NoticeMarqueeClient";

async function BannerContent() {
  await connection();
  await connectDB();

  const settings = await Setting.collection.findOne({ key: "global_settings" });

  if (!settings || !settings.isNoticeActive || !settings.noticeText) {
    return null;
  }

  // লগইন করা কাস্টমার, সেলার বা রাইডারের প্রোফাইল থেকে উপজেলা বের করা
  let userUpazila = "";
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (token) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const userId = payload.userId || payload.id;
      if (userId) {
        const user = await User.findById(userId).select("upazila").lean();
        if (user?.upazila) {
          userUpazila = user.upazila;
        }
      }
    }
  } catch {}

  return (
    <NoticeMarqueeClient
      rawNoticeText={settings.noticeText}
      userUpazila={userUpazila}
    />
  );
}

export default function NoticeBanner() {
  return (
    <Suspense fallback={null}>
      <BannerContent />
    </Suspense>
  );
}
