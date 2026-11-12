import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

// ডাটাবেজ থেকে নির্দিষ্ট ID দিয়ে অর্ডার খুঁজে আনা (GET)
export async function GET(request, { params }) {
  try {
    // ১. ডাটাবেজ কানেক্ট করা
    await connectDB();

    // ২. Next.js ১৬/১৭ এর নিয়মানুযায়ী params প্রমিজ রেজলভ করা
    const resolvedParams = await params;
    const { id } = resolvedParams;

    console.log("Searching for Order ID in Database:", id);

    if (!id) {
      return NextResponse.json({ message: "অর্ডার আইডি পাওয়া যায়নি" }, { status: 400 });
    }

    // ৩. সরাসরি MongoDB-র অবজেক্ট আইডি (_id) দিয়ে খোঁজা
    const order = await Order.findById(id);
    
    if (!order) {
      console.log(`Order with id ${id} not found in MongoDB`);
      return NextResponse.json({ message: "অর্ডারটি পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("GET Order API Error: ❌", error.message);
    return NextResponse.json({ message: `সার্ভারে সমস্যা হয়েছে: ${error.message}` }, { status: 500 });
  }
}

// অর্ডার স্ট্যাটাস আপডেট করার জন্য (PATCH)
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { status } = await request.json();

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ message: "অর্ডার আপডেট করা যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ message: "স্ট্যাটাস আপডেট সফল", order: updatedOrder }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "সার্ভারে সমস্যা হয়েছে" }, { status: 500 });
  }
}
