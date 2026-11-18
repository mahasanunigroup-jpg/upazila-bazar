// src/models/CashHandover.js
import mongoose from 'mongoose';

const CashHandoverSchema = new mongoose.Schema({
  riderId: { type: String, required: true, index: true },
  riderName: { type: String, required: true },
  sellerId: { type: String, required: true, index: true },
  sellerName: { type: String, required: true },
  amount: { type: Number, required: true, min: 1 },
  referenceNote: { type: String, default: '' },
  sellerSignature: { type: String, default: '' }, // সেলারের ডিজিটাল সিগনেচার (Data URL)
  status: {
    type: String,
    enum: ['pending_seller', 'seller_approved', 'admin_verified', 'rejected'],
    default: 'pending_seller',
  },
  verifiedByAdmin: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.CashHandover || mongoose.model('CashHandover', CashHandoverSchema);
