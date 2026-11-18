// src/app/api/rider/cash-handover/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RiderCashWallet from '@/models/RiderCashWallet';
import CashHandover from '@/models/CashHandover';

// ১. রাইডার সেলারকে টাকা দিয়ে রিকোয়েস্ট পাঠাবেন
export async function POST(request) {
  try {
    await connectDB();
    const { riderId, riderName, sellerId, sellerName, amount, referenceNote } = await request.json();

    const wallet = await RiderCashWallet.findOne({ riderId });
    if (!wallet || wallet.cashInHand < amount) {
      return NextResponse.json(
        { success: false, message: 'আপনার হাতে পর্যাপ্ত COD ক্যাশ ব্যালেন্স নেই।' },
        { status: 400 }
      );
    }

    const handover = await CashHandover.create({
      riderId,
      riderName,
      sellerId,
      sellerName,
      amount: Number(amount),
      referenceNote,
      status: 'pending_seller',
    });

    return NextResponse.json(
      { success: true, message: 'সেলারের অনুমোদনের জন্য রিকোয়েস্ট পাঠানো হয়েছে!', data: handover },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ২. সেলার সিগনেচার দিয়ে Approve করবেন অথবা অ্যাডমিন Final Verify করবেন
export async function PATCH(request) {
  try {
    await connectDB();
    const { handoverId, action, sellerSignature, adminName } = await request.json();

    const record = await CashHandover.findById(handoverId);
    if (!record) {
      return NextResponse.json({ success: false, message: 'রিকোয়েস্ট পাওয়া যায়নি।' }, { status: 404 });
    }

    // ধাপ ২: সেলার সিগনেচার দিয়ে টাকা বুঝে নেওয়ার অনুমোদন দিচ্ছেন
    if (action === 'seller_approve') {
      if (record.status !== 'pending_seller') {
        return NextResponse.json({ success: false, message: 'এটি ইতিমধ্যে প্রসেস হয়েছে।' }, { status: 400 });
      }
      if (!sellerSignature) {
        return NextResponse.json({ success: false, message: 'অনুগ্রহ করে আপনার সিগনেচার দিন।' }, { status: 400 });
      }

      record.sellerSignature = sellerSignature;
      record.status = 'seller_approved';
      await record.save();

      return NextResponse.json({
        success: true,
        message: 'সিগনেচারসহ অনুমোদন সম্পন্ন! এটি এখন অ্যাডমিন ভেরিফিকেশনের জন্য পাঠানো হয়েছে।',
      });
    }

    // ধাপ ৩: অ্যাডমিন ভেরিফাই করে Approve দিচ্ছেন -> রাইডারের ব্যালেন্স অটো-মাইনাস হবে
    if (action === 'admin_verify') {
      if (record.status !== 'seller_approved') {
        return NextResponse.json(
          { success: false, message: 'সেলারের সিগনেচার ছাড়া ভেরিফাই করা যাবে না।' },
          { status: 400 }
        );
      }

      const wallet = await RiderCashWallet.findOne({ riderId: record.riderId });
      if (wallet) {
        wallet.cashInHand = Math.max(0, wallet.cashInHand - record.amount);
        wallet.totalHandedOver += record.amount;
        wallet.updatedAt = new Date();
        await wallet.save();
      }

      record.status = 'admin_verified';
      record.verifiedByAdmin = adminName || 'Admin';
      await record.save();

      return NextResponse.json({
        success: true,
        message: 'ভেরিফিকেশন সম্পন্ন এবং রাইডারের ব্যালেন্স থেকে টাকা মাইনাস করা হয়েছে!',
      });
    }

    // বাতিল (Reject)
    if (action === 'reject') {
      record.status = 'rejected';
      await record.save();
      return NextResponse.json({ success: true, message: 'রিকোয়েস্টটি বাতিল করা হয়েছে।' });
    }

    return NextResponse.json({ success: false, message: 'ভুল অ্যাকশন।' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
