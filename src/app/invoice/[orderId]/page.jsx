import React, { Suspense } from 'react';
import { connection } from 'next/server';
import InvoiceTemplate from '@/components/invoice/InvoiceTemplate';

// Next.js API (localhost:3000) থেকে অর্ডার ডেটা আনার ফাংশন
async function getOrderDetails(orderId) {
  await connection(); // Next.js 16-এ ডায়নামিক ডেটা ও তারিখ রেন্ডারিংয়ের জন্য

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/orders/${orderId}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('API Response Error:', res.status);
      return null;
    }

    const rawData = await res.json();
    const order = rawData.data || rawData.order || rawData;

    if (!order) return null;

    // তারিখ বাংলায় ফরম্যাট করা
    const formattedDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString('bn-BD', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'তারিখ উল্লেখ নেই';

    // দোকানের নাম বের করা
    const firstItem = Array.isArray(order.items) && order.items.length > 0 ? order.items.at(0) : null;
    const shopName = firstItem?.shopName || order.sellerName || 'উপজেলা ভেরিফায়েড স্টোর';

    // পূর্ণাঙ্গ ঠিকানা সাজানো (ঠিকানা + উপজেলা + জেলা)
    const fullAddress = [order.customer_address, order.upazila, order.district]
      .filter(Boolean)
      .join(', ');

    // পণ্যের তালিকা (প্রতিটি পণ্যের দোকানের নামসহ)
    const mappedItems = (order.items || []).map((item, idx) => ({
      id: item._id || idx,
      name: item.name || 'পণ্য',
      shopName: item.shopName || 'উপজেলা ভেরিফায়েড স্টোর',
      quantity: Number(item.qty || 1),
      price: Number(item.price || 0),
    }));

    // পণ্যের সাব-টোটাল হিসাব
    const itemsSubtotal = mappedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // ডেলিভারি চার্জ বের করা (আলাদা ফিল্ড না থাকলে total_amount থেকে হিসাব করবে)
    const totalAmount = Number(order.total_amount || 0);
    const calculatedDelivery =
      order.delivery_charge !== undefined
        ? Number(order.delivery_charge)
        : totalAmount > itemsSubtotal
        ? totalAmount - itemsSubtotal
        : 0;

    return {
      invoiceNo: order.orderId || order._id?.slice(-6).toUpperCase(),
      orderDate: formattedDate,
      
      // ক্রেতার তথ্য
      customerName: order.customer_name || 'সম্মানিত ক্রেতা',
      customerPhone: order.customer_phone || 'N/A',
      customerAddress: fullAddress || 'ঠিকানা দেওয়া হয়নি',
      
      // বিক্রেতার তথ্য
      sellerName: shopName,
      sellerPhone: order.seller_phone || 'হেল্পলাইন: ০১৭XX-XXXXXX',
      
      // পেমেন্ট ও চার্জ
      paymentMethod: order.payment_method || 'Cash on Delivery',
      paymentStatus: order.paymentStatus || (order.status === 'delivered' ? 'Paid' : 'Unpaid'),
      deliveryCharge: calculatedDelivery,
      discount: Number(order.discount || 0),
      commissionRate: Number(order.commissionRate || 5),

      items: mappedItems,
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

// মূল কন্টেন্ট কম্পোনেন্ট
async function InvoiceContent({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const orderId = resolvedParams.orderId;
  const role = resolvedSearchParams?.role === 'seller' ? 'seller' : 'customer';

  const orderData = await getOrderDetails(orderId);

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow max-w-md">
          <h2 className="text-xl font-bold text-red-600">দুঃখিত! ইনভয়েসটি পাওয়া যায়নি।</h2>
          <p className="text-gray-600 mt-2 text-sm">সঠিক অর্ডার নম্বর দিয়ে আবার চেষ্টা করুন।</p>
        </div>
      </div>
    );
  }

  return <InvoiceTemplate order={orderData} role={role} />;
}

// মেইন পেজ কম্পোনেন্ট
export default function InvoicePage({ params, searchParams }) {
  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <p className="text-emerald-700 font-semibold text-lg animate-pulse">
              ইনভয়েস লোড হচ্ছে...
            </p>
          </div>
        }
      >
        <InvoiceContent params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
