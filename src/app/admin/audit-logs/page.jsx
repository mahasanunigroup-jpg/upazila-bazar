import { Suspense } from "react";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import { verifyAdmin } from "@/lib/adminAuth";
import AuditLogsView from "@/components/admin/AuditLogsView";

async function getAuditLogsData() {
  const admin = await verifyAdmin();
  const isSuper = admin?.role === "super_admin" || admin?.role === "admin";
  
  if (!isSuper) {
    redirect("/unauthorized");
  }

  try {
    await connectDB();

    const rawLogs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(150)
      .lean();

    return rawLogs.map((log) => ({
      _id: log._id.toString(),
      actorId: log.actorId ? log.actorId.toString() : "",
      actorName: log.actorName || "অ্যাডমিন",
      actorRole: log.actorRole || "admin",
      actorLocation: log.actorLocation || "",
      actionType: log.actionType || "OTHER",
      targetId: log.targetId || "",
      description: log.description,
      metadata: log.metadata || {},
      createdAt: log.createdAt ? log.createdAt.toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Audit Logs Fetch Error:", error);
    return [];
  }
}

async function AuditLogsContent() {
  const logs = await getAuditLogsData();
  return <AuditLogsView initialLogs={logs} />;
}

export default function AdminAuditLogsPage() {
  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6">
      <Suspense
        fallback={
          <div className="space-y-4 animate-pulse">
            <div className="h-24 bg-white rounded-xl border border-gray-200"></div>
            <div className="h-96 bg-white rounded-xl border border-gray-200"></div>
          </div>
        }
      >
        <AuditLogsContent />
      </Suspense>
    </div>
  );
}
