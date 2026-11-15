import Link from "next/link";

export default function RiderLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* রাইডার টপ ন্যাভিগেশন বার */}
      <nav className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/rider/dashboard"
              className="text-lg font-bold text-emerald-700 tracking-tight"
            >
              উপজেলা বাজার{" "}
              <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                রাইডার প্যানেল
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md font-medium transition"
            >
              মূল সাইটে যান ↗
            </Link>
          </div>
        </div>
      </nav>

      {/* মূল পেজ কন্টেন্ট */}
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
