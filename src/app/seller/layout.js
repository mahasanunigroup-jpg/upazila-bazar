"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SellerLayout({ children }) {
  const pathname = usePathname();

  const navLinks = [
    { name: "ড্যাশবোর্ড", href: "/seller/dashboard" },
    { name: "অর্ডার ও ডেলিভারি", href: "/seller/orders" },
    { name: "আমার পণ্য", href: "/seller/products" },
    { name: "নতুন পণ্য যোগ", href: "/seller/add-product" },
    { name: "আয় ও কমিশন", href: "/seller/earnings" },
     { name: 'ওয়ালেট ও পেআউট', href: '/seller/wallet' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* সেলার টপ ন্যাভিগেশন বার */}
      <nav className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* বাম পাশে ব্র্যান্ড ও মেনু লিংক */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <Link
              href="/seller/dashboard"
              className="text-lg font-bold text-emerald-700 tracking-tight"
            >
              উপজেলা বাজার{" "}
              <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                সেলার
              </span>
            </Link>

            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm font-medium">
              {navLinks.map((link) => {
                // বর্তমান URL-এর সাথে লিংক মিলে গেলে অ্যাক্টিভ ধরবে
                const isActive =
                  pathname === link.href ||
                  (link.href === "/seller/dashboard" && pathname === "/seller");

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      isActive
                        ? "bg-emerald-600 text-white font-semibold shadow-sm"
                        : "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ডান পাশে হোম পেজে ফেরার বাটন */}
          <Link
            href="/"
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md font-medium transition"
          >
            মূল সাইটে যান ↗
          </Link>
        </div>
      </nav>

      {/* মূল পেজ কন্টেন্ট */}
      <main className="max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
