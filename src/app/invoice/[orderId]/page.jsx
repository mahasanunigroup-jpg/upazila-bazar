import React, { Suspense } from 'react';
import { connection } from 'next/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import InvoiceTemplate from '@/components/invoice/InvoiceTemplate';

async function getOrderDetails(orderId) {
  await connection();

  try {
    await connectDB();

    const query = mongoose.Types.ObjectId.isValid(orderId)
      ? { $or: [{ _id: orderId }, { orderId }] }
      : { orderId };

    const order = await Order.findOne(query).lean();

    if (!order) return null;

    const formattedDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString('bn-BD', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'তারিখ উল্লেখ নেই';

    const firstItem =
      Array.isArray(order.items) && order.items.length > 0 ? order.items.at(0) : null;
    const shopName = firstItem?.shopName || order.sellerName || 'উপজেলা ভেরিফায়েড স্টোর';

    const fullAddress = [order.customer_address, order.upazila, order.district]
      .filter(Boolean)
      .join(', ');

    const mappedItems = (order.items || []).map((item, idx) => ({
      id: item._id?.toString() || idx,
      name: item.name || item.title || 'পণ্য',
      shopName: item.shopName || 'উপজেলা ভেরিফায়েড স্টোর',
      quantity: Number(item.qty || item.quantity || 1),
      price: Number(item.price || 0),
    }));

    const itemsSubtotal = mappedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const totalAmount = Number(order.total_amount || 0);
    const calculatedDelivery =
      order.delivery_charge !== undefined
        ? Number(order.delivery_charge)
        : totalAmount > itemsSubtotal
        ? totalAmount - itemsSubtotal
        : 0;

    return {
      invoiceNo: order.orderId || order._id.toString().slice(-6).toUpperCase(),
      orderDate: formattedDate,
      customerName: order.customer_name || 'সম্মানিত ক্রেতা',
      customerPhone: order.customer_phone || 'N/A',
      customerAddress: fullAddress || 'ঠিকানা দেওয়া হয়নি',
      sellerName: shopName,
      sellerPhone: order.seller_phone || 'হেল্পলাইন: ০১৭XX-XXXXXX',
      paymentMethod: order.payment_method || 'Cash on Delivery',
      paymentStatus:
        order.paymentStatus || (order.status === 'delivered' ? 'Paid' : 'Unpaid'),
      deliveryCharge: calculatedDelivery,
      discount: Number(order.discount || 0),
      commissionRate: Number(order.commissionRate || 5),
      items: mappedItems,
    };
  } catch (error) {
    console.error('Error fetching order for invoice:', error);
    return null;
  }
}
async function InvoiceContent({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  let userRole = null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      userRole = payload.role;
    }
  } catch {}

  if (!userRole || userRole === 'customer' || userRole === 'user') {
    redirect('/orders');
  }

  const orderId = resolvedParams.orderId;
  const role =
    resolvedSearchParams?.role === 'seller' || userRole === 'seller'
      ? 'seller'
      : userRole;

  const orderData = await getOrderDetails(orderId);

  if (!orderData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center p-6 bg-white rounded-2xl shadow-xs border border-gray-100 max-w-md w-full">
          <h2 className="text-lg font-bold text-red-600">দুঃখিত! ইনভয়েসটি পাওয়া যায়নি।</h2>
          <p className="text-gray-600 mt-1.5 text-xs sm:text-sm">
            সঠিক অর্ডার নম্বর দিয়ে আবার চেষ্টা করুন।
          </p>
        </div>
      </div>
    );
  }

  return <InvoiceTemplate order={orderData} role={role} />;
}

export default function InvoicePage({ params, searchParams }) {
  return (
    <main className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <p className="text-emerald-700 font-semibold text-base sm:text-lg animate-pulse">
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
