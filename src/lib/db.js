import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("অনুগ্রহ করে আপনার .env.local ফাইলে MONGODB_URI ভেরিয়েবলটি যুক্ত করুন");
}

/**
 * Next.js ডেভেলপমেন্ট মোডে রিফ্রেশ বা হট-রিলোড হলে গ্লোবাল ক্যাশ মেইনটেইন করার জন্য।
 * এর ফলে প্রতিবার রিকোয়েস্টে নতুন কানেকশন তৈরি না হয়ে আগের কানেকশনটিই রিইউজ হবে।
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  // যদি আগের কোনো সচল কানেকশন ক্যাশে থাকে, তবে সেটিই রিটার্ন করবে
  if (cached.conn) {
    return cached.conn;
  }

  // যদি কোনো কানেকশন প্রসেসিংয়ে না থাকে, তবে নতুন কানেকশন প্রমিজ তৈরি করবে
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("MongoDB connected successfully! 🎉");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB connection error: ❌", e);
    throw e;
  }

  return cached.conn;
}

// আপনার পূর্বের কোডের সাথে সামঞ্জস্য রেখে ডিফল্ট এক্সপোর্টও রাখা হলো
export default connectDB;
