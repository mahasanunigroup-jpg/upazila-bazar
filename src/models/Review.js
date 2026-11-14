import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    isVerifiedBuyer: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ productId: 1, createdAt: -1 });
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
