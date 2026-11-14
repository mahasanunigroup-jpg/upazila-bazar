"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUserTable({ initialUsers, currentAdminId }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers || []);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      u.email.toLowerCase().includes(search.toLowerCase());
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
        prev.map((u) => (u._id === userId ? { ...u, ...data.user } : u))
      );
      router.refresh();
    } catch (err) {
      alert(err.message || "আপডেট ব্যর্থ হয়েছে");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* ফিল্টার ও সার্চ বার */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: "সবাই" },
            { key: "seller", label: "সেলার" },
            { key: "rider", label: "রাইডার" },
            { key: "customer", label: "কাস্টমার" },
            { key: "admin", label: "অ্যাডমিন" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition ${
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
          placeholder="নাম, ফোন বা ইমেইল খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3.5 py-1.5 text-sm border rounded-lg bg-white w-full sm:w-64 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* ইউজার টেবিল */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600">
              <th className="py-3 px-4">নাম ও যোগাযোগ</th>
              <th className="py-3 px-4">রোল (Role)</th>
              <th className="py-3 px-4">অবস্থা</th>
              <th className="py-3 px-4 text-right">কন্ট্রোল অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => {
              const isSelf = user._id === currentAdminId;
              const isBlocked = user.isBlocked || user.status === "blocked";

              return (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">
                      {user.phone || user.email} {user.upazila ? `• ${user.upazila}` : ""}
                    </p>
                  </td>

                  <td className="py-3 px-4">
                    <select
                      disabled={isSelf || loadingId === user._id}
                      value={user.role}
                      onChange={(e) =>
                        handleAction(user._id, {
                          action: "changeRole",
                          role: e.target.value,
                        })
                      }
                      className="px-2.5 py-1 text-xs font-medium border rounded-md bg-white disabled:opacity-60"
                    >
                      <option value="customer">Customer</option>
                      <option value="seller">Seller</option>
                      <option value="rider">Rider</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td className="py-3 px-4">
                    {isBlocked ? (
                      <span className="px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                        ব্লকড (Blocked)
                      </span>
                    ) : user.isApproved === false || user.status === "pending" ? (
                      <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                        পেন্ডিং অ্যাপ্রুভাল
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">
                        সক্রিয় (Active)
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                    {isSelf ? (
                      <span className="text-xs text-gray-400 italic">নিজ অ্যাকাউন্ট</span>
                    ) : (
                      <>
                        {(user.isApproved === false || user.status === "pending") && (
                          <button
                            disabled={loadingId === user._id}
                            onClick={() => handleAction(user._id, { action: "approve" })}
                            className="px-3 py-1 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-md"
                          >
                            Approve
                          </button>
                        )}

                        {isBlocked ? (
                          <button
                            disabled={loadingId === user._id}
                            onClick={() => handleAction(user._id, { action: "unblock" })}
                            className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md"
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            disabled={loadingId === user._id}
                            onClick={() => handleAction(user._id, { action: "block" })}
                            className="px-3 py-1 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded-md"
                          >
                            Block
                          </button>
                        )}
                      </>
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
