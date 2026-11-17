import connectDB from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import Notification from "@/models/Notification";

export async function recordAuditLog({
  admin,
  actionType = "OTHER",
  targetId = "",
  description,
  metadata = {},
  notifySuperAdmin = true, // ডিফল্টভাবে সুপার অ্যাডমিনের কাছে নোটিফিকেশন যাবে
}) {
  try {
    if (!admin || !description) return;

    await connectDB();

    const actorId = admin.userId || admin.id || admin._id;
    const actorName = admin.name || "অ্যাডমিন";
    const actorRole = admin.role || "admin";
    const locationParts = [admin.upazila, admin.district, admin.division].filter(Boolean);
    const actorLocation = locationParts.join(", ") || "কেন্দ্রীয় (Central)";

    // ১. স্থায়ী অডিট লগ রেকর্ড করা
    await AuditLog.create({
      actorId,
      actorName,
      actorRole,
      actorLocation,
      actionType,
      targetId: targetId?.toString() || "",
      description,
      metadata,
    });

    // ২. সুপার অ্যাডমিনের নোটিফিকেশন বেলে রিয়েল-টাইম অ্যালার্ট পাঠানো
    // (যদি কাজটি সুপার অ্যাডমিন নিজে না করে অন্য কোনো আঞ্চলিক অ্যাডমিন বা রাইডার করে থাকেন)
    const isSelfSuperAdmin = actorRole === "super_admin" || actorRole === "admin";

    if (notifySuperAdmin && !isSelfSuperAdmin) {
      const actionTitles = {
        ROLE_CHANGE: "⚠️ অ্যাডমিন রোল পরিবর্তন অ্যালার্ট",
        PRODUCT_DELETE: "🗑️ পণ্য ডিলিট অ্যালার্ট",
        PRODUCT_APPROVE: "✅ পণ্য অনুমোদন অ্যালার্ট",
        RIDER_ASSIGN: "🛵 রাইডার অ্যাসাইন আপডেট",
        ORDER_STATUS: "📦 অর্ডার স্ট্যাটাস পরিবর্তন",
        USER_BAN: "🚫 ইউজার ব্যান অ্যালার্ট",
        FINANCE_ENTRY: "💰 ফিন্যান্স এন্ট্রি অ্যালার্ট",
        OTHER: "🕵️ সিস্টেম অ্যাক্টিভিটি অ্যালার্ট",
      };

      await Notification.create({
        recipientRole: "super_admin",
        recipientId: null, // আপনার Notification API অনুযায়ী সব super_admin ও admin এটি দেখতে পাবে
        division: admin.division || "",
        district: admin.district || "",
        upazila: admin.upazila || "",
        title: actionTitles[actionType] || actionTitles.OTHER,
        message: `${actorName} (${actorLocation}): ${description}`,
        link: "/admin/audit-logs",
        isRead: false,
      });
    }
  } catch (error) {
    console.error("Audit Log & Notification Error:", error);
  }
}
