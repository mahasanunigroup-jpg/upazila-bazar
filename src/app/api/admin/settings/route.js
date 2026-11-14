import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET(req) {
  try {
    const _url = req.url;
    await connectDB();
    let settings = await Setting.collection.findOne({ key: "global_settings" });

    if (!settings) {
      settings = {
        key: "global_settings",
        deliveryChargeInside: 40,
        deliveryChargeOutside: 60,
        commissionPercent: 5,
        noticeText:
          "উপজেলা বাজারে স্বাগতম! ভৈরব উপজেলার যেকোনো প্রান্তে দ্রুত হোম ডেলিভারি।",
        isNoticeActive: true,
        isMaintenanceMode: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await Setting.collection.insertOne(settings);
    }

    return NextResponse.json(
      { settings },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Settings GET Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ message: "অ্যাক্সেস অস্বীকৃত" }, { status: 403 });
    }

    const body = await req.json();
    await connectDB();

    const updateFields = {
      key: "global_settings",
      deliveryChargeInside: Number(body.deliveryChargeInside ?? 40),
      deliveryChargeOutside: Number(body.deliveryChargeOutside ?? 60),
      commissionPercent: Number(body.commissionPercent ?? 5),
      noticeText: body.noticeText || "",
      isNoticeActive: body.isNoticeActive === true,
      isMaintenanceMode: body.isMaintenanceMode === true,
      updatedAt: new Date(),
    };

    // সব পুরনো ডুপ্লিকেট ডকুমেন্ট মুছে ফ্রেশ ১টি সেভ করা
    await Setting.collection.deleteMany({});
    await Setting.collection.insertOne(updateFields);

    return NextResponse.json({
      message: "সেটিংস সংরক্ষিত হয়েছে!",
      settings: updateFields,
    });
  } catch (error) {
    console.error("Settings PATCH Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
