import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // ৫ মিনিট (৩০০ সেকেন্ড) পর অটোমেটিক ডিলিট হয়ে যাবে
  },
});

if (mongoose.models.Otp) {
  delete mongoose.models.Otp;
}

export default mongoose.model("Otp", otpSchema);
