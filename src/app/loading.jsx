export default function GlobalLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="w-9 h-9 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      <p className="text-xs font-medium text-gray-500">লোড হচ্ছে...</p>
    </div>
  );
}
