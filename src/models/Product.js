import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },

    // বিক্রির ধরন: খোলা (ওজন), প্যাকেট, পিস, অথবা বক্স (খুচরা পিসসহ)
    sellingType: {
      type: String,
      enum: ["loose", "packet", "piece", "box"],
      default: "piece",
    },
    // বক্স পণ্য হলে প্রতি বক্সে কয় পিস/পাতা থাকে (যেমন: 100 বা 10)
    piecesPerBox: {
      type: Number,
      default: 0,
    },

    stock: { type: Number, default: 10 },
    district: { type: String, default: "কিশোরগঞ্জ" },
    upazila: { type: String, default: "ভৈরব" },
    union: { type: String, default: "" },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shopName: { type: String, default: "উপজেলা ভেরিফাইড স্টোর" },
    sellerName: { type: String, default: "স্থানীয় বিক্রেতা" },
  },
  { timestamps: true }
);

ProductSchema.index({ sellerId: 1, upazila: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ sellerId: 1, createdAt: -1 });
ProductSchema.index({ category: 1, createdAt: -1 });

if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

export default mongoose.model("Product", ProductSchema);
