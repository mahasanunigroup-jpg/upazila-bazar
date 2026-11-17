import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true }, // পণ্যের একক মূল্য
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  shopName: { type: String, default: "উপজেলা ভেরিফায়েড স্টোর" },
  itemStatus: {
    type: String,
    enum: ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
});

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      default: null // গেস্ট চেকআউট থাকলে null থাকবে, লগইন থাকলে আইডি সেভ হবে
    },
    customer_name: { type: String, required: true },
    customer_phone: { type: String, required: true },
    district: { type: String, required: true }, // রাইডার ফিল্টার করার জন্য
    upazila: { type: String, required: true },  // রাইডার ফিল্টার করার জন্য
    union: { type: String, default: "" },       // নিচের ইনডেক্সের সাথে মিল রাখার জন্য যুক্ত করা হলো
    customer_address: { type: String, required: true },
    
    // টাকার হিসাব ও ইনভয়েস ফিল্ডসমূহ
    delivery_charge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 5 }, // সেলার ইনভয়েসের জন্য প্ল্যাটফর্ম কমিশন (%)
    total_amount: { type: Number, required: true },
    
    payment_method: { type: String, default: "Cash on Delivery" },
    paymentStatus: { 
      type: String, 
      enum: ["Unpaid", "Paid"], 
      default: "Unpaid" 
    },
    
    // পুরো অর্ডারের ওভারঅল স্ট্যাটাস
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // রাইডার ম্যানেজমেন্টের জন্য ফিল্ড
    riderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      default: null 
    },
    deliveryStatus: {
      type: String,
      enum: ["unassigned", "assigned", "picked_up", "delivered"],
      default: "unassigned",
    },

    // কাস্টমারের সেলার ও রাইডার ফিডব্যাক
    feedback: {
      isSubmitted: { type: Boolean, default: false },
      sellerRating: { type: Number, min: 1, max: 5, default: null },
      sellerComment: { type: String, default: "" },
      riderRating: { type: Number, min: 1, max: 5, default: null },
      riderComment: { type: String, default: "" },
      submittedAt: { type: Date, default: null },
    },

    items: [OrderItemSchema],
  },
  { timestamps: true }
);

OrderSchema.index({ "items.sellerId": 1, createdAt: -1 });
OrderSchema.index({ riderId: 1, deliveryStatus: 1 });
OrderSchema.index({ upazila: 1, status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ upazila: 1, union: 1, createdAt: -1 });
OrderSchema.index({ status: 1, deliveryStatus: 1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
