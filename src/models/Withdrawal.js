// models/Withdrawal.js
import mongoose from 'mongoose';

const WithdrawalSchema = new mongoose.Schema({
  sellerId: { type: String, required: true, index: true },
  amount: { type: Number, required: true, min: 500 }, // সর্বনিম্ন ৫০০ টাকা
  method: { 
    type: String, 
    enum: ['bKash', 'Nagad', 'Rocket', 'Bank'], 
    required: true 
  },
  accountDetails: { type: String, required: true }, // মোবাইল নম্বর বা ব্যাংক অ্যাকাউন্ট তথ্য
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  transactionId: { type: String, default: '' }, // অ্যাডমিন টাকা পাঠানোর পর TrxID দেবে
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Withdrawal || mongoose.model('Withdrawal', WithdrawalSchema);
