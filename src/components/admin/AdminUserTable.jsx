"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const CreateAdminForm = dynamic(() => import("./CreateAdminForm"), {
  loading: () => <p className="text-xs text-emerald-600">ফর্ম লোড হচ্ছে...</p>,
});
const AdminDirectoryBrowser = dynamic(() => import("./AdminDirectoryBrowser"));

const ROLE_DISPLAY = {
  customer: "Customer",
  seller: "Seller",
  rider: "Rider",
  union_admin: "Union Admin",
  upazila_admin: "Upazila Admin",
  district_admin: "Zila (District) Admin",
  division_admin: "Division Admin",
  super_admin: "Super Admin",
  admin: "Super Admin",
};

export default function AdminUserTable({
  initialUsers,
  currentAdminId,
  currentAdmin = {},
  allowedRoles = ["seller", "rider"],
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers || []);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const isSuperAdmin =
    currentAdmin?.role === "super_admin" || currentAdmin?.role === "admin";

  const filteredUsers = users.filter((u) => {
    const matchesRole =
      roleFilter === "all"
        ? true
        : roleFilter === "admins"
          ? [
              "admin",
              "super_admin",
              "division_admin",
              "district_admin",
              "upazila_admin",
              "union_admin",
            ].includes(u.role)
          : u.role === roleFilter;

    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.upazila || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.district || "").toLowerCase().includes(search.toLowerCase());

    return matchesRole && matchesSearch;
  });

  const handleAction = async (userId, payload) => {
    setLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, ...data.user } : u)),
      );
      if (payload.action === "unlockSession") {
        alert("ইউজারের সেশন লক সফলভাবে খোলা হয়েছে!");
      }
      router.refresh();
    } catch (err) {
      alert(err.message || "আপডেট ব্যর্থ হয়েছে");
    } finally {
      setLoadingId(null);
    }
  };

  const handleLoginAsUser = async (targetUserId) => {
    setLoadingId(targetUserId);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "প্রবেশ করা সম্ভব হয়নি");

      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = data.redirectUrl;
    } catch (err) {
      alert(err.message);
      setLoadingId(null);
    }
  };
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition cursor-pointer"
        >
          {showCreateForm
            ? "✕ ফর্ম বন্ধ করুন"
            : "+ নতুন আঞ্চলিক অ্যাডমিন / স্টাফ তৈরি করুন"}
        </button>
      </div>

      {showCreateForm && (
        <CreateAdminForm
          currentAdmin={currentAdmin}
          allowedRoles={allowedRoles}
          onClose={() => setShowCreateForm(false)}
          onCreated={(newUser) => {
            setUsers((prev) => [newUser, ...prev]);
            setShowCreateForm(false);
            router.refresh();
          }}
        />
      )}

      <AdminDirectoryBrowser users={users} currentAdmin={currentAdmin} />

      {/* ফিল্টার ও সার্চ বার */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: "সবাই" },
            { key: "admins", label: "সকল অ্যাডমিন" },
            { key: "seller", label: "সেলার" },
            { key: "rider", label: "রাইডার" },
            { key: "customer", label: "কাস্টমার" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                roleFilter === tab.key
                  ? "bg-slate-900 text-white"
                  : "bg-white text-gray-600 border hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="নাম, ফোন বা এলাকা খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3.5 py-2 text-sm border rounded-lg bg-white w-full sm:w-64 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* 📱 মোবাইল ভিউ: ছোট স্ক্রিনে কোনো লেখা বা বাটন না কেটে সুন্দর কার্ড আকারে দেখাবে */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredUsers.map((user) => {
          const isSelf = user._id === currentAdminId;
          const isBlocked = user.isBlocked || user.status === "blocked";
          const isPending = user.isApproved === false || user.status === "pending";
          const areaText = [user.union, user.upazila, user.district, user.division]
            .filter(Boolean)
            .join(", ");

          return (
            <div key={user._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-gray-800 text-sm flex flex-wrap items-center gap-1.5">
                    {user.name}
                    {user.customId && (
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">
                        {user.customId}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{user.phone || user.email}</p>
                  {areaText && <p className="text-xs text-emerald-700 font-medium mt-0.5">📍 {areaText}</p>}
                </div>

                {isBlocked ? (
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-red-100 text-red-700 rounded-full shrink-0">
                    ব্লকড
                  </span>
                ) : isPending ? (
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-700 rounded-full shrink-0">
                    পেন্ডিং
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-700 rounded-full shrink-0">
                    সক্রিয়
                  </span>
                )}
              </div>

              <div>
                <select
                  disabled={isSelf || loadingId === user._id}
                  value={user.role}
                  onChange={(e) => handleAction(user._id, { action: "changeRole", role: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-medium border rounded-lg bg-gray-50"
                >
                  <option value={user.role}>{ROLE_DISPLAY[user.role] || user.role}</option>
                  {allowedRoles.filter((r) => r !== user.role).map((r) => (
                    <option key={r} value={r}>{ROLE_DISPLAY[r] || r}</option>
                  ))}
                </select>
              </div>

              {!isSelf && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  {isSuperAdmin && (
                    <button
                      disabled={loadingId === user._id}
                      onClick={() => handleLoginAsUser(user._id)}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold"
                    >
                      👁️ প্রবেশ করুন
                    </button>
                  )}
                  {user.role !== "customer" && (
                    <>
                      <button
                        disabled={loadingId === user._id}
                        onClick={() => handleAction(user._id, { action: "unlockSession" })}
                        className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold"
                      >
                        🔓 আনলক
                      </button>
                      <button
                        onClick={() => router.push(`/admin/finance/salary?userId=${user._id}`)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold"
                      >
                        💰 স্যালারি
                      </button>
                    </>
                  )}
                  {isPending && (
                    <button
                      disabled={loadingId === user._id}
                      onClick={() => handleAction(user._id, { action: "approve" })}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                    >
                      অ্যাপ্রুভ
                    </button>
                  )}
                  {isBlocked ? (
                    <button
                      disabled={loadingId === user._id}
                      onClick={() => handleAction(user._id, { action: "unblock" })}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold"
                    >
                      আনব্লক
                    </button>
                  ) : (
                    <button
                      disabled={loadingId === user._id}
                      onClick={() => handleAction(user._id, { action: "block" })}
                      className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold"
                    >
                      ব্লক
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* 💻 ডেস্কটপ ভিউ: আপনার অরিজিনাল টেবিল */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600">
              <th className="py-3 px-4">নাম, যোগাযোগ ও এলাকা</th>
              <th className="py-3 px-4">রোল (Role)</th>
              <th className="py-3 px-4">অবস্থা</th>
              <th className="py-3 px-4 text-right">কন্ট্রোল অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => {
              const isSelf = user._id === currentAdminId;
              const isBlocked = user.isBlocked || user.status === "blocked";
              const isPending = user.isApproved === false || user.status === "pending";
              const areaText = [user.union, user.upazila, user.district, user.division]
                .filter(Boolean)
                .join(", ");

              return (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                      {user.name}
                      {user.customId && (
                        <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border whitespace-nowrap">
                          {user.customId}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.phone || user.email}
                      {user.phone && user.email ? ` (${user.email})` : ""}
                      {areaText ? ` • 📍 ${areaText}` : ""}
                    </p>
                  </td>

                  <td className="py-3 px-4">
                    <select
                      disabled={isSelf || loadingId === user._id}
                      value={user.role}
                      onChange={(e) => handleAction(user._id, { action: "changeRole", role: e.target.value })}
                      className="px-2.5 py-1 text-xs font-medium border rounded-md bg-white disabled:opacity-60"
                    >
                      <option value={user.role}>{ROLE_DISPLAY[user.role] || user.role}</option>
                      {allowedRoles.filter((r) => r !== user.role).map((r) => (
                        <option key={r} value={r}>{ROLE_DISPLAY[r] || r}</option>
                      ))}
                    </select>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    {isBlocked ? (
                      <span className="px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">ব্লকড (Blocked)</span>
                    ) : isPending ? (
                      <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">পেন্ডিং অ্যাপ্রুভাল</span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">সক্রিয় (Active)</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    {isSelf ? (
                      <span className="text-xs text-gray-400 italic whitespace-nowrap">আপনার অ্যাকাউন্ট</span>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {isSuperAdmin && (
                          <button
                            disabled={loadingId === user._id}
                            onClick={() => handleLoginAsUser(user._id)}
                            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded text-xs font-semibold whitespace-nowrap cursor-pointer"
                          >
                            👁️ প্রবেশ করুন
                          </button>
                        )}
                        {user.role !== "customer" && (
                          <>
                            <button
                              disabled={loadingId === user._id}
                              onClick={() => handleAction(user._id, { action: "unlockSession" })}
                              className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded text-xs font-semibold whitespace-nowrap cursor-pointer"
                            >
                              🔓 আনলক
                            </button>
                            <button
                              onClick={() => router.push(`/admin/finance/salary?userId=${user._id}`)}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-xs font-semibold whitespace-nowrap cursor-pointer"
                            >
                              💰 স্যালারি
                            </button>
                          </>
                        )}
                        {isPending && (
                          <button
                            disabled={loadingId === user._id}
                            onClick={() => handleAction(user._id, { action: "approve" })}
                            className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-xs font-semibold whitespace-nowrap cursor-pointer"
                          >
                            অ্যাপ্রুভ
                          </button>
                        )}
                        {isBlocked ? (
                          <button
                            disabled={loadingId === user._id}
                            onClick={() => handleAction(user._id, { action: "unblock" })}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded text-xs font-semibold whitespace-nowrap cursor-pointer"
                          >
                            আনব্লক
                          </button>
                        ) : (
                          <button
                            disabled={loadingId === user._id}
                            onClick={() => handleAction(user._id, { action: "block" })}
                            className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded text-xs font-semibold whitespace-nowrap cursor-pointer"
                          >
                            ব্লক
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
