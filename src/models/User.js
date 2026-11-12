import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "seller", "rider", "admin"],
      default: "customer",
    },
    shopName: { type: String, default: "" },
    district: { type: String, default: "" },
    upazila: { type: String, default: "" },
    union: { type: String, default: "" },
    address: { type: String, default: "" },
  },
  { timestamps: true }
);

// ডেভেলপমেন্ট মোডে পুরনো স্কিমা ক্যাশ মুছে নতুন ফিল্ড লোড করার জন্য
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = mongoose.model("User", userSchema);
export default User;
