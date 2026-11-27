import Link from "next/link";
import { Package, ArrowRight, Calendar } from "lucide-react";

const STATUS_BADGE = {
  pending: { label: "অপেক্ষমান", className: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "নিশ্চিত", className: "bg-blue-50 text-blue-700 border-blue-200" },
  processing: { label: "প্রস্তুত হচ্ছে", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  shipped: { label: "পথে আছে", className: "bg-purple-50 text-purple-700 border-purple-200" },
  delivered: { label: "ডেলিভারি সম্পন্ন", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "বাতিল", className: "bg-red-50 text-red-700 border-red-200" },
};

export default function RecentOrdersPreview({ orders = [] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* হেডার */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">সাম্প্রতিক অর্ডার</h2>
          </div>

          <Link
            href="/orders"
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
          >
            সব দেখুন <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* অর্ডার তালিকা */}
        <div className="mt-4 space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
              এখনও কোনো অর্ডার করা হয়নি।
            </div>
          ) : (
            orders.map((order) => {
              const badge = STATUS_BADGE[order.status] || {
                label: order.status,
                className: "bg-gray-100 text-gray-700 border-gray-200",
              };

              const shortId = order.orderNumber || order._id.slice(-6).toUpperCase();
              const formattedDate = new Date(order.createdAt).toLocaleDateString("bn-BD", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={order._id}
                  className="p-3.5 rounded-xl border border-gray-200 hover:border-emerald-300 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-gray-800">#{shortId}</span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                    </span>
                    <span className="font-semibold text-gray-900 text-sm">
                      ৳{order.totalAmount || order.grandTotal || 0}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* নিচের বাটন */}
      {orders.length > 0 && (
        <Link
          href="/orders"
          className="mt-5 w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
        >
          সব অর্ডার বিস্তারিত দেখুন
        </Link>
      )}
    </div>
  );
}
