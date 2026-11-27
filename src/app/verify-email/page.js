"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const hasCalledRef = useRef(false); // ডাবল রিকোয়েস্ট আটকানোর গার্ড

  useEffect(() => {
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    const completeRegistration = async () => {
      try {
        const savedRaw = localStorage.getItem("pending_upazila_reg");
        if (!savedRaw) {
          setStatus("error");
          setErrorMsg("রেজিস্ট্রেশন তথ্য পাওয়া যায়নি। অনুগ্রহ করে একই ব্রাউজার থেকে আবার চেষ্টা করুন।");
          return;
        }

        const savedData = JSON.parse(savedRaw);
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...savedData,
            email,
            otp: token,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          localStorage.removeItem("pending_upazila_reg");
          if (savedData.district && savedData.upazila) {
            localStorage.setItem(
              "upazila_full_location",
              JSON.stringify({
                district: savedData.district,
                upazila: savedData.upazila,
                union: savedData.union || "",
                moholla: savedData.moholla || "",
              })
            );
          }
          setStatus("success");
          setTimeout(() => router.push("/login"), 1800);
        } else {
          setStatus("error");
          setErrorMsg(data.error || "লিংকটির মেয়াদ শেষ হয়ে গেছে।");
        }
      } catch {
        setStatus("error");
        setErrorMsg("সার্ভারে সংযোগ দেওয়া যাচ্ছে না।");
      }
    };

    if (email && token) {
      completeRegistration();
    } else {
      setStatus("error");
      setErrorMsg("অবৈধ ভেরিফিকেশন লিংক।");
    }
  }, [email, token, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm space-y-4">
        {status === "verifying" && (
          <>
            <Loader2 className="w-11 h-11 text-emerald-600 animate-spin mx-auto" />
            <h1 className="text-base font-bold text-gray-900">
              আপনার অ্যাকাউন্ট ভেরিফাই হচ্ছে...
            </h1>
            <p className="text-xs text-gray-500">অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন।</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">
              অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!
            </h1>
            <p className="text-xs text-gray-600">
              আপনাকে লগইন পেজে নিয়ে যাওয়া হচ্ছে...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <XCircle className="w-7 h-7" />
            </div>
            <h1 className="text-base font-bold text-gray-900">ভেরিফিকেশন ব্যর্থ হয়েছে</h1>
            <p className="text-xs text-red-600">{errorMsg}</p>
            <Link
              href="/register"
              className="inline-block w-full py-2.5 bg-orange-500 text-white text-xs font-bold rounded-xl"
            >
              আবার রেজিস্ট্রেশন করুন
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm">লোড হচ্ছে...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
