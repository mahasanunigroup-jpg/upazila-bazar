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
    shopName: { type: String, default: "" },
    division: { type: String, default: "" },
    district: { type: String, default: "" },
    upazila: { type: String, default: "" },
    union: { type: String, default: "" },
    address: { type: String, default: "" },
    // অ্যাডমিন ও রাইডারের বিস্তারিত বায়োডাটা
    biodata: {
      fatherName: { type: String, default: "" },
      nidNumber: { type: String, default: "" },
      dateOfBirth: { type: String, default: "" },
      bloodGroup: { type: String, default: "" },
      emergencyPhone: { type: String, default: "" },
      vehicleType: { type: String, default: "" },
    },
    isApproved: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, division: 1, district: 1, upazila: 1, union: 1 });
userSchema.index({ createdAt: -1 });

if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = mongoose.model("User", userSchema);
export default User;
