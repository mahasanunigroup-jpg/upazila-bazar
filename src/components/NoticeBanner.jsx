import { Suspense } from "react";
import { connection } from "next/server";
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";

async function BannerContent() {
  await connection();
  await connectDB();

  const settings = await Setting.findOne({ key: "global_settings" }).lean();

  if (!settings || !settings.isNoticeActive || !settings.noticeText) {
    return null;
  }

  return (
    <div className="bg-emerald-700 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium">
      📢 {settings.noticeText}
    </div>
  );
}

export default function NoticeBanner() {
  return (
    <Suspense fallback={null}>
      <BannerContent />
    </Suspense>
  );
}
