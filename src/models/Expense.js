import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["expense", "income"], // ব্যয় (খরচ) নাকি অতিরিক্ত আয়
      default: "expense",
    },
    title: { type: String, required: true }, // খাতের নাম (যেমন: রাইডার বেতন, দোকান ভিজিট, স্পন্সর আয়)
    amount: { type: Number, required: true }, // টাকার পরিমাণ
    partyName: { type: String, required: true }, // যাকে টাকা দেওয়া হলো বা যার থেকে নেওয়া হলো তার নাম
    partyPhone: { type: String, default: "" }, // প্রাপক/দাতার ফোন নম্বর
    note: { type: String, default: "" },
    
    // যে অ্যাডমিন এন্ট্রি করেছেন তার বিস্তারিত এলাকা ও পরিচয়
    division: { type: String, default: "" },
    district: { type: String, default: "" },
    upazila: { type: String, default: "" },
    union: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    creatorName: { type: String, default: "" },
    creatorPhone: { type: String, default: "" },
    creatorRole: { type: String, default: "" },
    
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // সুপার অ্যাডমিনের কাছে সরাসরি রিয়াল-টাইম রিপোর্ট চলে যাবে
    },
  },
  { timestamps: true }
);

expenseSchema.index({ division: 1, district: 1, upazila: 1, union: 1, createdAt: -1 });

if (mongoose.models.Expense) {
  delete mongoose.models.Expense;
}

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;
