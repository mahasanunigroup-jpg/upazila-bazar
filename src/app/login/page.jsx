"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getRedirectPathByRole } from "@/utils/roleRedirect";

function getOrCreateDeviceId() {
  let deviceId = localStorage.getItem("ub_device_id");
  if (!deviceId) {
    deviceId = "dev_" + crypto.randomUUID();
    localStorage.setItem("ub_device_id", deviceId);
  }
  return deviceId;
}

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const deviceId = getOrCreateDeviceId();

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, deviceId }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(`স্বাগতম ${data.user.name}! লগইন সফল হয়েছে...`);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("upazila_registered", "true");

        const role = data.user?.role;
        const targetRoute =
          role === "customer" || role === "user"
            ? "/"
            : getRedirectPathByRole(role);

        router.push(targetRoute);
        router.refresh();
      } else {
        setError(data.error || "ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।");
      }
    } catch {
      setError("সার্ভার কানেকশন ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-3 py-8">
      <div className="max-w-md w-full p-5 sm:p-7 bg-white shadow-sm border border-gray-100 rounded-2xl">
        {/* হোম পেজে ফেরার বাটন */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-600 hover:text-green-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোম পেজে ফিরুন</span>
          </Link>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold mb-6 text-center text-gray-800">
          উপজেলা বাজার - লগইন
        </h2>

        {message && (
          <p className="mb-4 text-center text-xs sm:text-sm font-semibold text-green-700 bg-green-50 p-2.5 rounded-xl">
            {message}
          </p>
        )}
        {error && (
          <p className="mb-4 text-center text-xs sm:text-sm font-semibold text-red-600 bg-red-50 p-2.5 rounded-xl">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="ইমেইল ঠিকানা"
            className="w-full p-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-500"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="পাসওয়ার্ড"
            className="w-full p-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-500"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition cursor-pointer"
          >
            {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
          </button>
        </form>

        <p className="text-center text-xs sm:text-sm text-gray-600 mt-5">
          নতুন অ্যাকাউন্ট খুলতে চান?{" "}
          <Link
            href="/register"
            className="text-orange-600 font-bold hover:underline"
          >
            রেজিস্ট্রেশন করুন
          </Link>
        </p>
      </div>
    </div>
  );
}
