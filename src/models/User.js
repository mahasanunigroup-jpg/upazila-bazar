import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "customer",
        "seller",
        "rider",
        "admin",
        "super_admin",
        "division_admin",
        "district_admin",
        "upazila_admin",
        "union_admin",
      ],
      default: "customer",
    },
    customId: { type: String, unique: true, sparse: true },
    shopName: { type: String, default: "" },
    division: { type: String, default: "" },
    district: { type: String, default: "" },
    upazila: { type: String, default: "" },
    union: { type: String, default: "" },
    address: { type: String, default: "" },
    // অ্যাডমিন ও রাইডারের বিস্তারিত বায়োডাটা
    // অ্যাডমিন ও রাইডারের পূর্ণাঙ্গ বায়োডাটা ও ডকুমেন্টস
    biodata: {
      avatar: { type: String, default: "" }, // ব্যক্তির পাসপোর্ট সাইজ ছবি
      fatherName: { type: String, default: "" }, // পিতার নাম
      motherName: { type: String, default: "" }, // মাতার নাম
      nidNumber: { type: String, default: "" }, // NID ভ্যালিড নম্বর
      nidFrontImage: { type: String, default: "" }, // NID সামনের ছবি (Front)
      nidBackImage: { type: String, default: "" }, // NID পেছনের ছবি (Back)
      dateOfBirth: { type: String, default: "" }, // জন্ম তারিখ
      bloodGroup: { type: String, default: "" }, // রক্তের গ্রুপ
      emergencyPhone: { type: String, default: "" }, // জরুরি ফোন নম্বর
      permanentAddress: { type: String, default: "" }, // স্থায়ী ঠিকানা
      presentAddress: { type: String, default: "" }, // বর্তমান ঠিকানা
      vehicleType: { type: String, default: "" }, // রাইডারের বাহনের ধরন
    },

    isApproved: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    status: { type: String, default: "active" },
  },
  { timestamps: true },
);

userSchema.index({ role: 1, division: 1, district: 1, upazila: 1, union: 1 });
userSchema.index({ createdAt: -1 });

if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = mongoose.model("User", userSchema);
export default User;
