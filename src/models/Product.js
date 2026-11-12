import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, default: 10 },
    district: { type: String, default: "কিশোরগঞ্জ" },
    upazila: { type: String, default: "ভৈরব" },
    union: { type: String, default: "" },
    sellerId: { type: String, default: "seller_default" },
    shopName: { type: String, default: "উপজেলা ভেরিফায়েড স্টোর" },
    sellerName: { type: String, default: "স্থানীয় বিক্রেতা" },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
