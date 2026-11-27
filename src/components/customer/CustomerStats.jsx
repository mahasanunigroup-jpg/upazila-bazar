import { ShoppingBag, Clock, CheckCircle2, Wallet } from "lucide-react";

export default function CustomerStats({ stats }) {
  // বাংলা মাসের নাম দেখানোর জন্য
  const currentMonthName = new Date().toLocaleDateString("bn-BD", {
    month: "long",
  });

  const cards = [
    {
      label: `চলতি মাসের খরচ (${currentMonthName})`,
      value: `৳${(stats?.monthlyExpense || 0).toLocaleString("bn-BD")}`,
      icon: Wallet,
      color: "text-purple-600 bg-purple-50",
      highlight: true,
    },
    {
      label: "মোট অর্ডার",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "চলমান অর্ডার",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "সম্পন্ন ডেলিভারি",
      value: stats?.deliveredOrders || 0,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={`bg-white p-4 sm:p-5 rounded-xl border shadow-2xs flex items-center gap-3.5 sm:gap-4 ${
              item.highlight ? "border-purple-200 bg-purple-50/20" : "border-gray-200"
            }`}
          >
            <div className={`p-3 rounded-xl shrink-0 ${item.color}`}>
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                {item.label}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">
                {item.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
