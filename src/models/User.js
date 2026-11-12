// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'seller', 'rider', 'admin'], 
    default: 'customer' 
  },
  district: { type: String, required: true }, // জেলা
  upazila: { type: String, required: true },   // উপজেলা
  address: { type: String, required: true },   // ডিটেইল ঠিকানা
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
