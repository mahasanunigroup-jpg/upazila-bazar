// src/app/api/subscriptions/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Subscription from '@/models/Subscription';

// ফোন নম্বর দিয়ে ইউজারের সাবস্ক্রিপশন খুঁজে বের করা (GET)
// src/app/api/subscriptions/route.js এর ভেতরের GET ফাংশনটি আপডেট করুন
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const role = searchParams.get('role'); // 'admin' বা 'rider' হলে সব লিস্ট দেখাবে

    if (role === 'admin' || role === 'rider') {
      const allSubs = await Subscription.find({ status: { $ne: 'CANCELLED' } }).sort({
        deliveryDayOfMonth: 1,
        createdAt: -1,
      });
      return NextResponse.json({ success: true, data: allSubs }, { status: 200 });
    }

    if (!phone) {
      return NextResponse.json({ success: false, message: 'ফোন নম্বর দিন' }, { status: 400 });
    }

    const sub = await Subscription.findOne({ 'customerInfo.phone': phone }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: sub }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}


// নতুন সাবস্ক্রিপশন তৈরি (POST)
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.customerInfo?.name || !body.customerInfo?.phone || !body.customerInfo?.address) {
      return NextResponse.json(
        { success: false, message: 'নাম, মোবাইল নম্বর এবং ঠিকানা আবশ্যক' },
        { status: 400 }
      );
    }

    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    nextDate.setDate(body.deliveryDayOfMonth || 5);

    const newSub = await Subscription.create({
      ...body,
      nextDeliveryDate: nextDate,
    });

    return NextResponse.json({ success: true, data: newSub }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// সাবস্ক্রিপশন স্ট্যাটাস পরিবর্তন: Pause / Skip / Resume (PATCH)
export async function PATCH(req) {
  try {
    await dbConnect();
    const { subscriptionId, action } = await req.json();

    const sub = await Subscription.findById(subscriptionId);
    if (!sub) {
      return NextResponse.json({ message: 'সাবস্ক্রিপশন পাওয়া যায়নি' }, { status: 404 });
    }

    if (action === 'PAUSE') {
      sub.status = 'PAUSED';
    } else if (action === 'RESUME') {
      sub.status = 'ACTIVE';
    } else if (action === 'SKIP_MONTH') {
      sub.status = 'SKIPPED_NEXT_MONTH';
      const updatedDate = new Date(sub.nextDeliveryDate);
      updatedDate.setMonth(updatedDate.getMonth() + 1);
      sub.nextDeliveryDate = updatedDate;
    }

    await sub.save();
    return NextResponse.json({ success: true, data: sub }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
