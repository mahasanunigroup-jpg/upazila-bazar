import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientRole: {
      type: String,
      default: "super_admin", // যেমন: super_admin, division_admin, seller, rider, all_admins
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // নির্দিষ্ট কাউকে পাঠাতে চাইলে তার আইডি
    },
    division: { type: String, default: "" },
    district: { type: String, default: "" },
    upazila: { type: String, default: "" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: "/admin" }, // ক্লিক করলে কোন পেজে যাবে
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, recipientRole: 1, isRead: 1, createdAt: -1 });

const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
export default Notification;
