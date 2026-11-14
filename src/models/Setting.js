import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global_settings", unique: true },
    deliveryChargeInside: { type: Number, default: 40 },
    deliveryChargeOutside: { type: Number, default: 60 },
    commissionPercent: { type: Number, default: 5 },
    noticeText: {
      type: String,
      default: "উপজেলা বাজারে স্বাগতম! ভৈরব উপজেলার যেকোনো প্রান্তে দ্রুত হোম ডেলিভারি।",
    },
    isNoticeActive: { type: Boolean, default: true },
    isMaintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// পুরনো ক্যাশড স্কিমা মুছে আপডেটেড স্কিমা লোড করা
if (mongoose.models.Setting) {
  delete mongoose.models.Setting;
}

export default mongoose.model("Setting", SettingSchema);
