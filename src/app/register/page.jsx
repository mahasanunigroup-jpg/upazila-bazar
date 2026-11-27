"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BD_LOCATIONS } from "@/data/bdLocations";
import SearchableSelect from "@/components/SearchableSelect";
import { ArrowLeft, MailCheck, ShieldCheck } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "customer",
    shopName: "",
    marketName: "",
    district: "",
    upazila: "",
    union: "",
    moholla: "",
    address: "",
  });

  const [existingMarkets, setExistingMarkets] = useState([]);
  const [loadingMarkets, setLoadingMarkets] = useState(false);
  const [isCustomMarket, setIsCustomMarket] = useState(false);

  // OTP স্টেটসমূহ
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const districts = Object.keys(BD_LOCATIONS);
  const upazilas = formData.district
    ? Object.keys(BD_LOCATIONS[formData.district] || {})
    : [];
  const unions =
    formData.district && formData.upazila
      ? BD_LOCATIONS[formData.district]?.[formData.upazila] || []
      : [];

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

    // ইমেইলের Copy বাটনে ক্লিক করলে অটোমেটিক ৬টি বক্সে আসল কোড বসে যাবে
  useEffect(() => {
    const applyOtp = (raw) => {
      const clean = String(raw || "").replace(/\D/g, "").slice(0, 6);
      if (clean.length === 6) {
        setOtpCode(clean);
      }
    };

    const handleStorage = (e) => {
      if (e.key === "upazila_latest_otp" && e.newValue) {
        applyOtp(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);

    let channel;
    try {
      channel = new BroadcastChannel("upazila_otp_channel");
      channel.onmessage = (event) => {
        if (event.data?.otp) {
          applyOtp(event.data.otp);
        }
      };
    } catch {}

    return () => {
      window.removeEventListener("storage", handleStorage);
      if (channel) channel.close();
    };
  }, []);



  useEffect(() => {
    if (!formData.district || !formData.upazila || !formData.union) {
      setExistingMarkets([]);
      setIsCustomMarket(false);
      return;
    }

    const fetchMarkets = async () => {
      setLoadingMarkets(true);
      try {
        const params = new URLSearchParams({
          district: formData.district,
          upazila: formData.upazila,
          union: formData.union,
        });
        const res = await fetch(`/api/markets?${params.toString()}`);
        const data = await res.json();
        const markets = data.markets || [];
        setExistingMarkets(markets);

        if (markets.length === 0) {
          setIsCustomMarket(true);
        } else {
          setIsCustomMarket(false);
        }
      } catch (err) {
        console.error("Market fetch error:", err);
        setIsCustomMarket(true);
      } finally {
        setLoadingMarkets(false);
      }
    };

    fetchMarkets();
  }, [formData.district, formData.upazila, formData.union]);
   // ধাপ ১: তথ্য localStorage-এ রেখে ইমেইলে ১-ক্লিক ভেরিফিকেশন লিংক পাঠানো
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const finalMarketOrMoholla =
      formData.role === "seller"
        ? formData.marketName.trim()
        : formData.moholla.trim();

    const pendingPayload = {
      ...formData,
      marketName: finalMarketOrMoholla,
      moholla: finalMarketOrMoholla,
    };

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          name: formData.name,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("pending_upazila_reg", JSON.stringify(pendingPayload));
        setOtpStep(true);
        setResendTimer(60);
      } else {
        setError(data.error || "ইমেইল পাঠানো যায়নি।");
      }
    } catch {
      setError("সার্ভারে কানেক্ট করা যাচ্ছে না।");
    } finally {
      setLoading(false);
    }
  };
 // ধাপ ১: ইমেইলে OTP পাঠানো


  // ধাপ ২: OTP যাচাই করে ফাইনাল রেজিস্ট্রেশন সম্পন্ন করা
  const handleFinalRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const finalMarketOrMoholla =
      formData.role === "seller"
        ? formData.marketName.trim()
        : formData.moholla.trim();

    const payload = {
      ...formData,
      marketName: finalMarketOrMoholla,
      moholla: finalMarketOrMoholla,
      otp: otpCode.trim(),
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (formData.district && formData.upazila) {
          localStorage.setItem(
            "upazila_full_location",
            JSON.stringify({
              district: formData.district,
              upazila: formData.upazila,
              union: formData.union || "",
              moholla: finalMarketOrMoholla || "",
            })
          );
        }

        setMessage("নিবন্ধন সফল হয়েছে! লগইন পেজে নিয়ে যাওয়া হচ্ছে...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setError(data.error || "OTP ভুল হয়েছে অথবা মেয়াদ শেষ।");
      }
    } catch {
      setError("সার্ভারে কানেক্ট করা যাচ্ছে না।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white shadow-lg rounded-xl border border-gray-100 px-4 sm:px-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        উপজেলা বাজার - রেজিস্ট্রেশন
      </h2>
      <div className="mb-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-600 hover:text-green-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>হোম পেজে ফিরুন</span>
        </Link>
      </div>
      {message && (
        <p className="mb-4 text-center text-sm font-semibold text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-4 text-center text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          {error}
        </p>
      )}

      {/* ধাপ ২: OTP ভেরিফিকেশন স্ক্রিন */}
      
            {/* ধাপ ২: প্রফেশনাল ৬-বক্স OTP ভেরিফিকেশন স্ক্রিন */}
           {/* ধাপ ২: প্রফেশনাল ৬-বক্স OTP ভেরিফিকেশন স্ক্রিন */}
            {otpStep ? (
        <div className="space-y-4 text-center">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <MailCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              আপনার ইমেইল ইনবক্স চেক করুন
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              আমরা <strong className="text-gray-800">{formData.email}</strong> ঠিকানায় একটি ভেরিফিকেশন বাটন পাঠিয়েছি। ইমেইল খুলে শুধু{" "}
              <strong className="text-emerald-700">“অ্যাকাউন্ট ভেরিফাই ও সম্পন্ন করুন”</strong> বাটনে ক্লিক করলেই আপনার অ্যাকাউন্ট চালু হয়ে যাবে!
            </p>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setOtpStep(false);
                setError("");
              }}
              className="text-gray-600 hover:text-gray-900 font-semibold underline cursor-pointer"
            >
              ← তথ্য পরিবর্তন করুন
            </button>

            <button
              type="button"
              disabled={resendTimer > 0 || loading}
              onClick={handleSendOtp}
              className="text-orange-600 hover:text-orange-700 font-bold disabled:text-gray-400 cursor-pointer"
            >
              {resendTimer > 0
                ? `আবার লিংক পাঠান (${resendTimer}s)`
                : "আবার লিংক পাঠান"}
            </button>
          </div>
        </div>
      ) : (



        <form onSubmit={handleSendOtp} className="space-y-4">
          <input
            type="text"
            placeholder="আপনার পূর্ণ নাম"
            className="w-full p-2.5 border rounded-lg focus:outline-orange-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <input
            type="email"
            placeholder="ইমেইল ঠিকানা"
            className="w-full p-2.5 border rounded-lg focus:outline-orange-500"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="মোবাইল নম্বর (যেমন: 017XXXXXXXX)"
            className="w-full p-2.5 border rounded-lg focus:outline-orange-500"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="পাসওয়ার্ড দিন"
            className="w-full p-2.5 border rounded-lg focus:outline-orange-500"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              অ্যাকাউন্টের ধরন
            </label>
            <select
              className="w-full p-2.5 border rounded-lg bg-white focus:outline-orange-500"
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value,
                  shopName: "",
                  marketName: "",
                })
              }
            >
              <option value="customer">আমি একজন ক্রেতা (Customer)</option>
              <option value="seller">আমি একজন দোকানদার (Seller)</option>
              <option value="rider">আমি একজন ডেলিভারি ম্যান (Rider)</option>
            </select>
          </div>

          <SearchableSelect
            options={districts}
            value={formData.district}
            placeholder="জেলা লিখুন বা নির্বাচন করুন..."
            onChange={(val) =>
              setFormData({
                ...formData,
                district: val,
                upazila: "",
                union: "",
                marketName: "",
              })
            }
          />

          <SearchableSelect
            options={upazilas}
            value={formData.upazila}
            placeholder="উপজেলা লিখুন বা নির্বাচন করুন..."
            disabled={!formData.district}
            onChange={(val) =>
              setFormData({
                ...formData,
                upazila: val,
                union: "",
                marketName: "",
              })
            }
          />

          <SearchableSelect
            options={unions}
            value={formData.union}
            placeholder="ইউনিয়ন / এলাকা লিখুন বা নির্বাচন করুন..."
            disabled={!formData.upazila}
            onChange={(val) =>
              setFormData({ ...formData, union: val, marketName: "" })
            }
          />

          {formData.role === "seller" && (
            <div className="space-y-3 p-3.5 rounded-xl border border-orange-200 bg-orange-50/40">
              <p className="text-xs font-semibold text-orange-700">
                দোকান ও বাজারের তথ্য
              </p>

              <input
                type="text"
                placeholder="আপনার দোকানের নাম (যেমন: বিসমিল্লাহ স্টোর)"
                className="w-full p-2.5 border border-orange-300 bg-white rounded-lg focus:outline-orange-500"
                value={formData.shopName}
                onChange={(e) =>
                  setFormData({ ...formData, shopName: e.target.value })
                }
                required
              />

              {!formData.union ? (
                <p className="text-xs text-gray-500 bg-white p-2.5 rounded-lg border border-dashed border-orange-300">
                  আগে উপর থেকে আপনার জেলা, উপজেলা ও ইউনিয়ন নির্বাচন করুন—তাহলে ওই
                  ইউনিয়নের বাজারের লিস্ট দেখাবে।
                </p>
              ) : loadingMarkets ? (
                <p className="text-xs text-orange-600 animate-pulse p-2">
                  {formData.union}-এর বাজারের তালিকা খোঁজা হচ্ছে...
                </p>
              ) : (
                <div className="space-y-2">
                  {existingMarkets.length > 0 && (
                    <select
                      className="w-full p-2.5 border border-orange-300 bg-white rounded-lg focus:outline-orange-500 text-sm"
                      value={isCustomMarket ? "__NEW__" : formData.marketName}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__NEW__") {
                          setIsCustomMarket(true);
                          setFormData({ ...formData, marketName: "" });
                        } else {
                          setIsCustomMarket(false);
                          setFormData({ ...formData, marketName: val });
                        }
                      }}
                      required={!isCustomMarket}
                    >
                      <option value="">
                        -- {formData.union}-এর বাজার নির্বাচন করুন --
                      </option>
                      {existingMarkets.map((m) => (
                        <option key={m} value={m}>
                          🏪 {m}
                        </option>
                      ))}
                      <option value="__NEW__">
                        ➕ লিস্টে নেই? নতুন বাজারের নাম লিখুন
                      </option>
                    </select>
                  )}

                  {(isCustomMarket || existingMarkets.length === 0) && (
                    <input
                      type="text"
                      placeholder="নতুন বাজার / হাটের নাম লিখুন (যেমন: আমতলা বাজার)"
                      className="w-full p-2.5 border border-orange-300 bg-white rounded-lg focus:outline-orange-500 text-sm"
                      value={formData.marketName}
                      onChange={(e) =>
                        setFormData({ ...formData, marketName: e.target.value })
                      }
                      required
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {formData.role !== "seller" && (
            <input
              type="text"
              placeholder="গ্রাম / মহল্লা / নিকটস্থ বাজারের নাম (ঐচ্ছিক)"
              className="w-full p-2.5 border rounded-lg focus:outline-orange-500"
              value={formData.moholla}
              onChange={(e) =>
                setFormData({ ...formData, moholla: e.target.value })
              }
            />
          )}

          <textarea
            rows="2"
            placeholder={
              formData.role === "seller"
                ? "দোকানের গলি/রাস্তা বা বিস্তারিত ঠিকানা"
                : "গ্রাম/মহল্লা, রোড নম্বর এবং বিস্তারিত ঠিকানা"
            }
            className="w-full p-2.5 border rounded-lg focus:outline-orange-500"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            required
          ></textarea>

                    <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold p-3 rounded-lg transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? "ভেরিফিকেশন লিংক পাঠানো হচ্ছে..." : "পরবর্তী ধাপ (ইমেইল ভেরিফাই করুন)"}
          </button>

        </form>
      )}

      <p className="mt-4 text-center text-sm text-gray-600">
        আগে থেকেই অ্যাকাউন্ট আছে?{" "}
        <Link
          href="/login"
          className="text-orange-600 font-semibold hover:underline"
        >
          লগইন করুন
        </Link>
      </p>
    </div>
  );
}
