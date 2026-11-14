import { Suspense } from "react";
import { connection } from "next/server";
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";

export const metadata = {
  title: "সাইট সেটিংস | অ্যাডমিন প্যানেল",
};

async function SettingsLoader() {
  await connection();
  await connectDB();

  let doc = await Setting.collection.findOne({ key: "global_settings" });
  if (!doc) {
    const defaultSettings = {
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
    await Setting.collection.insertOne(defaultSettings);
    doc = defaultSettings;
  }

  const initialSettings = {
    deliveryChargeInside: Number(doc.deliveryChargeInside ?? 40),
    deliveryChargeOutside: Number(doc.deliveryChargeOutside ?? 60),
    commissionPercent: Number(doc.commissionPercent ?? 5),
    noticeText: doc.noticeText || "",
    isNoticeActive: Boolean(doc.isNoticeActive ?? true),
    isMaintenanceMode: Boolean(doc.isMaintenanceMode ?? false),
  };

  return (
    <AdminSettingsForm
      key={JSON.stringify(initialSettings)}
      initialSettings={initialSettings}
    />
  );
}

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          প্ল্যাটফর্ম ও ডেলিভারি সেটিংস
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          ডেলিভারি চার্জ, কমিশন হার এবং হোম পেজের নোটিশ এখান থেকে নিয়ন্ত্রণ করুন
        </p>
      </div>

      <Suspense
        fallback={
          <div className="bg-white p-8 rounded-xl border text-gray-500">
            সেটিংস লোড হচ্ছে...
          </div>
        }
      >
        <SettingsLoader />
      </Suspense>
    </div>
  );
}
