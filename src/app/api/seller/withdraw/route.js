// app/api/seller/withdraw/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SellerWallet from '@/models/SellerWallet';
import Withdrawal from '@/models/Withdrawal';

export async function POST(request) {
  try {
    await connectDB();
    const { sellerId, amount, method, accountDetails } = await request.json();

    // ১. ইনপুট ভ্যালিডেশন
    if (!amount || amount < 500) {
      return NextResponse.json(
        { success: false, message: 'সর্বনিম্ন উইথড্রয়াল পরিমাণ ৫০০ টাকা।' },
        { status: 400 }
      );
    }

    // ২. সেলারের ওয়ালেট ব্যালেন্স চেক
    const wallet = await SellerWallet.findOne({ sellerId });
    if (!wallet || wallet.availableBalance < amount) {
      return NextResponse.json(
        { success: false, message: 'আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই।' },
        { status: 400 }
      );
    }

    // ৩. ব্যালেন্স থেকে টাকা কেটে রিকোয়েস্ট তৈরি করা
    wallet.availableBalance -= Number(amount);
    wallet.updatedAt = new Date();
    await wallet.save();

    const newWithdrawal = await Withdrawal.create({
      sellerId,
      amount: Number(amount),
      method,
      accountDetails,
    });

    return NextResponse.json(
      { success: true, message: 'উইথড্রয়াল রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!', data: newWithdrawal },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
