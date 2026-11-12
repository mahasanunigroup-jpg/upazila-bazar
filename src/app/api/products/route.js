import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Fetch Products Error:", error);
    return NextResponse.json({ message: "পণ্য লোড করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
