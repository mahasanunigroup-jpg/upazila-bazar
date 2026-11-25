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
    { name: "ওয়ালেট ও পেআউট", href: "/seller/wallet" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* সেলার টপ ন্যাভিগেশন বার */}
      <nav className="bg-white border-b border-gray-200 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 lg:gap-4">
          {/* ওপরের সারি: ছোট ফোনেও লোগো, ব্যাজ ও বাটন এক লাইনে নিখুঁতভাবে বসবে */}
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <Link
              href="/seller/dashboard"
              className="text-sm min-[380px]:text-base sm:text-lg font-bold text-emerald-700 tracking-tight flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>উপজেলা বাজার</span>
              <span className="text-[9px] sm:text-xs font-semibold bg-emerald-100 text-emerald-800 px-1.5 sm:px-2 py-0.5 rounded-full">
                সেলার
              </span>
            </Link>

            <Link
              href="/"
              className="lg:hidden text-[10px] sm:text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md font-medium transition whitespace-nowrap shrink-0"
            >
              মূল সাইটে যান ↗
            </Link>
          </div>

          {/* মেনু লিংকসমূহ: মোবাইলে ২ কলাম এবং ডেস্কটপে এক সারিতে */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap items-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm font-medium">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href === "/seller/dashboard" && pathname === "/seller");

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all text-center whitespace-nowrap ${
                    isActive
                      ? "bg-emerald-600 text-white font-semibold shadow-sm"
                      : "text-gray-600 bg-gray-50 lg:bg-transparent hover:text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* ডেস্কটপে ডান পাশে হোম পেজে ফেরার বাটন */}
          <Link
            href="/"
            className="hidden lg:inline-block text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap shrink-0"
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
