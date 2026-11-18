// models/SellerWallet.js
import mongoose from 'mongoose';

const SellerWalletSchema = new mongoose.Schema({
  sellerId: { type: String, required: true, unique: true, index: true },
  availableBalance: { type: Number, default: 0 }, // যে টাকা তোলা যাবে
  pendingBalance: { type: Number, default: 0 },   // ডেলিভারি চলমান অর্ডারের টাকা
  totalWithdrawn: { type: Number, default: 0 },   // এ পর্যন্ত মোট উত্তোলিত টাকা
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.SellerWallet || mongoose.model('SellerWallet', SellerWalletSchema);
