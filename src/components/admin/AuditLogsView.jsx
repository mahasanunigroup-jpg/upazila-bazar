"use client";

import { useState, useMemo } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  UserCheck,
  MapPin,
  X,
  Calendar,
  AlertTriangle,
  Eye,
} from "lucide-react";

const ACTION_BADGES = {
  ROLE_CHANGE: { label: "রোল পরিবর্তন", color: "bg-purple-100 text-purple-800 border-purple-200" },
  PRODUCT_DELETE: { label: "পণ্য ডিলিট", color: "bg-red-100 text-red-800 border-red-200" },
  PRODUCT_APPROVE: { label: "পণ্য অনুমোদন", color: "bg-green-100 text-green-800 border-green-200" },
  RIDER_ASSIGN: { label: "রাইডার অ্যাসাইন", color: "bg-blue-100 text-blue-800 border-blue-200" },
  ORDER_STATUS: { label: "অর্ডার স্ট্যাটাস", color: "bg-amber-100 text-amber-800 border-amber-200" },
  USER_BAN: { label: "ইউজার ব্লক/আনব্লক", color: "bg-rose-100 text-rose-800 border-rose-200" },
  FINANCE_ENTRY: { label: "আয়-ব্যয় হিসাব", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  OTHER: { label: "অন্যান্য কার্যক্রম", color: "bg-gray-100 text-gray-800 border-gray-200" },
};

export default function AuditLogsView({ initialLogs = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("ALL");

  const [selectedAdminModal, setSelectedAdminModal] = useState(null);
  const [modalDateFilter, setModalDateFilter] = useState("all");

  // ১. সার্চ ও অ্যাকশন অনুযায়ী ফিল্টার
  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      const matchesAction = selectedAction === "ALL" || log.actionType === selectedAction;
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.actorName.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        log.actorLocation.toLowerCase().includes(q) ||
        log.targetId.toLowerCase().includes(q);

      return matchesAction && matchesSearch;
    });
  }, [initialLogs, searchTerm, selectedAction]);

  // ২. একই অ্যাডমিনের একাধিক সারি না দেখিয়ে ১টি সারিতে গ্রুপ করা
  const groupedAdmins = useMemo(() => {
    const map = new Map();

    filteredLogs.forEach((log) => {
      const key = log.actorId || log.actorName;
      if (!map.has(key)) {
        map.set(key, {
          actorId: log.actorId,
          actorName: log.actorName,
          actorRole: log.actorRole,
          actorLocation: log.actorLocation,
          totalCount: 1,
          latestLog: log,
        });
      } else {
        const existing = map.get(key);
        existing.totalCount += 1;
      }
    });

    return Array.from(map.values());
  }, [filteredLogs]);

  // ৩. পপ-আপ মডালের ভেতরে Day / Month / Year ফিল্টার
  const selectedAdminLogs = useMemo(() => {
    if (!selectedAdminModal) return [];

    const now = new Date();
    const todayStr = now.toDateString();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return initialLogs.filter((log) => {
      const isSameAdmin =
        (selectedAdminModal.actorId && log.actorId === selectedAdminModal.actorId) ||
        log.actorName === selectedAdminModal.actorName;

      if (!isSameAdmin) return false;

      const logDate = new Date(log.createdAt);
      if (modalDateFilter === "today") {
        return logDate.toDateString() === todayStr;
      }
      if (modalDateFilter === "month") {
        return (
          logDate.getMonth() === currentMonth &&
          logDate.getFullYear() === currentYear
        );
      }
      if (modalDateFilter === "year") {
        return logDate.getFullYear() === currentYear;
      }
      return true;
    });
  }, [initialLogs, selectedAdminModal, modalDateFilter]);

  const openAdminHistory = (adminGroup) => {
    setSelectedAdminModal({
      actorId: adminGroup.actorId,
      actorName: adminGroup.actorName,
      actorRole: adminGroup.actorRole,
      actorLocation: adminGroup.actorLocation,
    });
    setModalDateFilter("all");
  };
  return (
    <div className="space-y-6">
      {/* ১. হেডার ও ফিল্টার বার */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>সিস্টেম অ্যাক্টিভিটি ও অডিট লগ</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              যেকোনো অ্যাডমিনের পাশের সংখ্যায় ক্লিক করে তার দিন, মাস ও বছরের সব রেকর্ড দেখুন
            </p>
          </div>

          <div className="flex items-center gap-2 self-start">
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-2 rounded-xl">
              অ্যাডমিন: {groupedAdmins.length} জন
            </span>
            <span className="bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl">
              মোট রেকর্ড: {filteredLogs.length} টি
            </span>
          </div>
        </div>

        {/* সার্চ ও ক্যাটাগরি ফিল্টার */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="অ্যাডমিনের নাম, এলাকা, অর্ডার আইডি বা বিবরণ দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">সকল অ্যাক্টিভিটি (All Actions)</option>
              <option value="ROLE_CHANGE">রোল পরিবর্তন (Role Change)</option>
              <option value="PRODUCT_DELETE">পণ্য ডিলিট (Product Delete)</option>
              <option value="RIDER_ASSIGN">রাইডার অ্যাসাইন (Rider Assign)</option>
              <option value="ORDER_STATUS">অর্ডার স্ট্যাটাস (Order Status)</option>
              <option value="USER_BAN">ইউজার ব্লক/আনব্লক (User Ban)</option>
              <option value="FINANCE_ENTRY">আয়-ব্যয় হিসাব (Finance)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ২. গ্রুপিং করা ইউনিক অ্যাডমিন তালিকা */}
      {groupedAdmins.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl text-center border border-gray-200 text-gray-500 text-sm">
          কোনো অডিট লগ রেকর্ড পাওয়া যায়নি।
        </div>
      ) : (
        <>
          {/* মোবাইল ও ট্যাবলেট কার্ড ভিউ */}
          <div className="grid grid-cols-1 gap-3 lg:hidden">
            {groupedAdmins.map((group) => {
              const latest = group.latestLog;
              const badge = ACTION_BADGES[latest.actionType] || ACTION_BADGES.OTHER;

              return (
                <div
                  key={group.actorId || group.actorName}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-gray-900 text-sm">{group.actorName}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openAdminHistory(group)}
                      className="bg-red-100 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 px-2.5 py-1 rounded-full text-xs font-extrabold transition cursor-pointer inline-flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{group.totalCount} টি রেকর্ড</span>
                    </button>
                  </div>

                  <p className="text-emerald-700 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {group.actorRole} • {group.actorLocation}
                  </p>

                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span className={`px-2 py-0.5 rounded-full font-bold border ${badge.color}`}>
                        সর্বশেষ: {badge.label}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(latest.createdAt).toLocaleString("bn-BD")}
                      </span>
                    </div>
                    <p className="text-gray-700 font-medium pt-1">{latest.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {/* ডেস্কটপ টেবিল ভিউ (প্রতি অ্যাডমিন মাত্র ১টি সারিতে) */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-600 uppercase border-b">
                  <th className="p-4">সর্বশেষ সময়</th>
                  <th className="p-4">অ্যাডমিন ও এলাকা</th>
                  <th className="p-4 text-center">মোট রেকর্ড / ভুলের সংখ্যা</th>
                  <th className="p-4">সর্বশেষ কার্যক্রম</th>
                  <th className="p-4 text-right">বিস্তারিত</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groupedAdmins.map((group) => {
                  const latest = group.latestLog;
                  const badge = ACTION_BADGES[latest.actionType] || ACTION_BADGES.OTHER;

                  return (
                    <tr key={group.actorId || group.actorName} className="hover:bg-gray-50/70">
                      <td className="p-4 text-xs text-gray-600 whitespace-nowrap">
                        {new Date(latest.createdAt).toLocaleString("bn-BD", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-gray-800 text-base">{group.actorName}</p>
                        <p className="text-xs text-emerald-700 font-medium mt-0.5">
                          {group.actorRole} • {group.actorLocation}
                        </p>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openAdminHistory(group)}
                          title="ক্লিক করে দিন, মাস ও বছরের সব রেকর্ড দেখুন"
                          className="bg-red-100 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{group.totalCount} টি</span>
                        </button>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <p className="text-gray-700 font-medium text-xs mt-1">
                          {latest.description}
                        </p>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openAdminHistory(group)}
                          className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>সব দেখুন</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ৩. নির্দিষ্ট অ্যাডমিনের Day / Month / Year হিস্ট্রি পপ-আপ মডাল */}
      {selectedAdminModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* মডাল হেডার */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-emerald-400">
                  🕵️ {selectedAdminModal.actorName}-এর সম্পূর্ণ রিপোর্ট
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  রোল: {selectedAdminModal.actorRole} • এলাকা: {selectedAdminModal.actorLocation}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAdminModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Day / Month / Year / All ফিল্টার বাটন */}
            <div className="p-3 sm:p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-500 mr-1 hidden sm:inline" />
                {[
                  { key: "today", label: "আজ (Day)" },
                  { key: "month", label: "এই মাস (Month)" },
                  { key: "year", label: "এই বছর (Year)" },
                  { key: "all", label: "সর্বমোট (All)" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setModalDateFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      modalDateFilter === tab.key
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <span className="bg-red-100 text-red-800 text-xs font-extrabold px-3 py-1 rounded-full">
                পাওয়া গেছে: {selectedAdminLogs.length} টি
              </span>
            </div>

            {/* ফিল্টার করা অ্যাক্টিভিটি লিস্ট */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {selectedAdminLogs.length === 0 ? (
                <p className="text-center py-8 text-sm text-gray-500">
                  নির্বাচিত সময়সীমায় এই অ্যাডমিনের কোনো রেকর্ড নেই।
                </p>
              ) : (
                selectedAdminLogs.map((item) => {
                  const badge = ACTION_BADGES[item.actionType] || ACTION_BADGES.OTHER;
                  return (
                    <div
                      key={item._id}
                      className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 space-y-1.5 text-xs sm:text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleString("bn-BD")}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-800">{item.description}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
