// src/models/RiderCashWallet.js
import mongoose from 'mongoose';

const RiderCashWalletSchema = new mongoose.Schema({
  riderId: { type: String, required: true, unique: true, index: true },
  riderName: { type: String, default: '' },
  cashInHand: { type: Number, default: 0 },     // রাইডারের হাতে জমা থাকা COD টাকা
  totalHandedOver: { type: Number, default: 0 }, // এ পর্যন্ত মোট জমা দেওয়া টাকা
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.RiderCashWallet || mongoose.model('RiderCashWallet', RiderCashWalletSchema);
