import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // 🚫 টেস্ট করার জন্য টোকেন এবং কুকি ভেরিফিকেশন সাময়িকভাবে কমেন্ট করে রাখা হলো
    /*
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    */

    // মক ডাটা (ডাটাবেজ কানেক্ট হলে এটি রিপ্লেস করবেন)
    const customerOrders = [
      {
        id: "UB-9832",
        date: "১০ নভেম্বর, ২০২৬",
        total: "৳৪৫০",
        status: "shipped", // pending, accepted, shipped, delivered, cancelled
        paymentMethod: "Cash on Delivery",
        items: [
          { name: "দেশী পেঁয়াজ", qty: "২ কেজি", price: "৳২৪০" },
          { name: "কাঁচামরিচ", qty: "৫০০ গ্রাম", price: "৳২১০" }
        ]
      }
    ];

    // ফ্রন্টএন্ডের জন্য সাকসেস রেসপন্স পাঠানো
    return NextResponse.json({ success: true, orders: customerOrders });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
