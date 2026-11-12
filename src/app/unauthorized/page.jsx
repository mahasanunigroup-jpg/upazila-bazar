export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="text-center bg-white p-8 rounded-xl shadow-sm max-w-md border border-red-100">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">অ্যাক্সেস রিফিউজড!</h1>
        <p className="text-gray-600 mb-6">আপনার এই ড্যাশবোর্ডটি দেখার অনুমতি বা সঠিক পারমিশন (Role) নেই।</p>
        <a href="/orders" className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition">
          আমার অর্ডার পেজে ফিরে যান
        </a>
      </div>
    </div>
  );
}
