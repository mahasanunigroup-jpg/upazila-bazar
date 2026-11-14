"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// নিরাপদ বুলিয়ান চেক (যাতে "false" স্ট্রিং কখনো true না হয়)
function toBool(val) {
  return val === true || val === "true";
}

export default function AdminSettingsForm({ initialSettings }) {
  const router = useRouter();
  const [form, setForm] = useState({
    deliveryChargeInside: Number(initialSettings?.deliveryChargeInside ?? 40),
    deliveryChargeOutside: Number(initialSettings?.deliveryChargeOutside ?? 60),
    commissionPercent: Number(initialSettings?.commissionPercent ?? 5),
    noticeText: initialSettings?.noticeText || "",
    isNoticeActive: toBool(initialSettings?.isNoticeActive),
    isMaintenanceMode: toBool(initialSettings?.isMaintenanceMode),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/settings?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) {
          setForm({
            deliveryChargeInside: Number(data.settings.deliveryChargeInside ?? 40),
            deliveryChargeOutside: Number(data.settings.deliveryChargeOutside ?? 60),
            commissionPercent: Number(data.settings.commissionPercent ?? 5),
            noticeText: data.settings.noticeText || "",
            isNoticeActive: toBool(data.settings.isNoticeActive),
            isMaintenanceMode: toBool(data.settings.isMaintenanceMode),
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        isNoticeActive: toBool(form.isNoticeActive),
        isMaintenanceMode: toBool(form.isMaintenanceMode),
      };

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      router.refresh();
      alert("সেটিংস সফলভাবে সেভ হয়েছে!");
    } catch (err) {
      alert(err.message || "সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      autoComplete="off"
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            পৌরসভা ডেলিভারি চার্জ (৳)
          </label>
          <input
            type="number"
            min="0"
            value={form.deliveryChargeInside}
            onChange={(e) =>
              setForm({ ...form, deliveryChargeInside: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            ইউনিয়ন ডেলিভারি চার্জ (৳)
          </label>
          <input
            type="number"
            min="0"
            value={form.deliveryChargeOutside}
            onChange={(e) =>
              setForm({ ...form, deliveryChargeOutside: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            প্ল্যাটফর্ম কমিশন (%)
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={form.commissionPercent}
            onChange={(e) =>
              setForm({ ...form, commissionPercent: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          হোম পেজ নোটিশ ব্যানার টেক্সট
        </label>
        <textarea
          rows={2}
          value={form.noticeText}
          onChange={(e) => setForm({ ...form, noticeText: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            name="notice_toggle_field"
            autoComplete="off"
            checked={form.isNoticeActive}
            onChange={(e) =>
              setForm({ ...form, isNoticeActive: e.target.checked })
            }
            className="w-4 h-4 accent-emerald-600"
          />
          নোটিশ ব্যানার চালু রাখুন
        </label>

        <label className="flex items-center gap-2 text-sm text-red-600 font-medium cursor-pointer">
          <input
            type="checkbox"
            name="maint_toggle_field"
            autoComplete="off"
            checked={form.isMaintenanceMode}
            onChange={(e) =>
              setForm({ ...form, isMaintenanceMode: e.target.checked })
            }
            className="w-4 h-4 accent-red-600"
          />
          মেইনটেন্যান্স মোড (জরুরি রক্ষণাবেক্ষণ)
        </label>
      </div>

      <div className="pt-3 border-t">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
        >
          {saving ? "সেভ হচ্ছে..." : "সেটিংস সংরক্ষণ করুন"}
        </button>
      </div>
    </form>
  );
}
