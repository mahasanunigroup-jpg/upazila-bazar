// src/app/api/admin/withdrawals/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Withdrawal from '@/models/Withdrawal';
import SellerWallet from '@/models/SellerWallet';

export async function PATCH(request) {
  try {
    await connectDB();
    const { withdrawalId, action, transactionId } = await request.json(); // action: 'approve' | 'reject'

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return NextResponse.json({ success: false, message: 'রিকোয়েস্টটি পাওয়া যায়নি।' }, { status: 404 });
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json({ success: false, message: 'এই রিকোয়েস্টটি ইতিমধ্যে প্রসেস করা হয়েছে।' }, { status: 400 });
    }

    const wallet = await SellerWallet.findOne({ sellerId: withdrawal.sellerId });

    if (action === 'approve') {
      if (!transactionId || transactionId.trim() === '') {
        return NextResponse.json({ success: false, message: 'অনুমোদনের জন্য TrxID প্রদান করুন।' }, { status: 400 });
      }

      withdrawal.status = 'approved';
      withdrawal.transactionId = transactionId.trim();
      await withdrawal.save();

      // সেলারের মোট উত্তোলিত আয়ে (totalWithdrawn) টাকা যোগ করা
      if (wallet) {
        wallet.totalWithdrawn += withdrawal.amount;
        wallet.updatedAt = new Date();
        await wallet.save();
      }

      return NextResponse.json({ success: true, message: 'পেআউট সফলভাবে অনুমোদিত হয়েছে!' });
    } 
    
    if (action === 'reject') {
      withdrawal.status = 'rejected';
      await withdrawal.save();

      // রিকোয়েস্ট বাতিল হলে টাকা আবার সেলারের ওয়ালেটে ফেরত পাঠানো
      if (wallet) {
        wallet.availableBalance += withdrawal.amount;
        wallet.updatedAt = new Date();
        await wallet.save();
      }

      return NextResponse.json({ success: true, message: 'রিকোয়েস্ট বাতিল করা হয়েছে এবং টাকা সেলারের ওয়ালেটে ফেরত গেছে।' });
    }

    return NextResponse.json({ success: false, message: 'ভুল অ্যাকশন।' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
