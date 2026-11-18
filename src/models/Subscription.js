// src/models/Subscription.js
import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'guest_user',
    },
    customerInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    packageType: {
      type: String,
      enum: ['READYMADE', 'CUSTOM'],
      required: true,
    },
    packageName: {
      type: String,
      required: true,
    },
    items: [
      {
        productId: String,
        name: String,
        quantity: Number,
        unit: String,
        price: Number,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    deliveryDayOfMonth: {
      type: Number,
      min: 1,
      max: 28,
      default: 5,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'SKIPPED_NEXT_MONTH', 'CANCELLED'],
      default: 'ACTIVE',
    },
    nextDeliveryDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// পুরোনো ক্যাশ করা মডেল থাকলে মুছে নতুন স্কিমা লোড করবে
if (mongoose.models.Subscription) {
  delete mongoose.models.Subscription;
}

export default mongoose.model('Subscription', SubscriptionSchema);
