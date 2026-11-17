import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // যে অ্যাডমিন কাজটি করেছেন তার আইডি
    },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true }, // যেমন: super_admin, district_admin, upazila_admin
    actorLocation: { type: String, default: "" }, // অ্যাডমিনের জেলা/উপজেলা
    
    actionType: {
      type: String,
      enum: [
        "ROLE_CHANGE",
        "PRODUCT_DELETE",
        "PRODUCT_APPROVE",
        "RIDER_ASSIGN",
        "ORDER_STATUS",
        "USER_BAN",
        "FINANCE_ENTRY",
        "OTHER",
      ],
      default: "OTHER",
    },
    targetId: { type: String, default: "" }, // যে ইউজার, অর্ডার বা পণ্যের ওপর কাজ হয়েছে তার আইডি
    description: { type: String, required: true }, // ঘটনার বিস্তারিত বিবরণ
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // আগের ও নতুন মান (যেমন: oldRole -> newRole)
  },
  { timestamps: true }
);

// দ্রুত সার্চ ও ফিল্টার করার জন্য ইনডেক্স
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ actionType: 1, createdAt: -1 });
AuditLogSchema.index({ actorId: 1, createdAt: -1 });

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
