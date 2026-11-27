"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store,
  LayoutDashboard,
  ShoppingBag,
  Building2,
  Home,
} from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function CustomerTopBar({ customer }) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "হোম বাজার", icon: Home },
    { href: "/customer/dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
    { href: "/orders", label: "আমার অর্ডার", icon: ShoppingBag },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-2xs">
      <div className="mx-auto max-w-6xl px-2.5 sm:px-6 lg:px-8">
        {/* উপরের স্লিম রো */}
        <div className="flex h-12 sm:h-15 items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-xs min-[380px]:text-sm sm:text-lg shrink-0"
            >
              <div className="bg-emerald-600 text-white p-1 sm:p-1.5 rounded-lg">
                <Store className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <span>উপজেলা বাজার</span>
            </Link>

            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[9px] min-[380px]:text-[10px] sm:text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
              <Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 shrink-0" />
              <span>কর্পোরেট</span>
            </span>
          </div>

          {/* ডেস্কটপ মেনু */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ডান পাশ: নাম ও লগআউট */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-block text-xs font-semibold text-gray-600 max-w-[120px] truncate">
              {customer?.name}
            </span>
            <LogoutButton />
          </div>
        </div>

        {/* মোবাইল নেভিগেশন ট্যাব (স্লিম) */}
        <div className="grid grid-cols-3 md:hidden gap-1.5 py-1.5 border-t border-gray-100">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[10px] min-[380px]:text-[11px] font-bold transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-gray-700 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
