import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: String, required: true },
  sellerId: { type: String, default: "seller_default" },
  shopName: { type: String, default: "উপজেলা ভেরিফায়েড স্টোর" },
});

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered"],
      default: "pending",
    },
    customer_name: { type: String, required: true },
    customer_phone: { type: String, required: true },
    customer_address: { type: String, required: true },
    total_amount: { type: String, required: true },
    payment_method: { type: String, default: "Cash on Delivery" },
    items: [OrderItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
