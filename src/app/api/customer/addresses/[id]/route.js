import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// কাস্টমার অথেনটিকেশন হেল্পার
async function verifyCustomer() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "customer") return null;
    return payload.userId || payload.id;
  } catch {
    return null;
  }
}

// ১. ডিফল্ট ঠিকানা সেট করা (PATCH)
export async function PATCH(request, { params }) {
  try {
    const userId = await verifyCustomer();
    if (!userId) {
      return NextResponse.json({ message: "অননুমোদিত অ্যাক্সেস" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const user = await User.findById(userId).select("addresses");
    if (!user) {
      return NextResponse.json({ message: "ইউজার পাওয়া যায়নি" }, { status: 404 });
    }

    const targetAddress = user.addresses.id(id);
    if (!targetAddress) {
      return NextResponse.json({ message: "ঠিকানা পাওয়া যায়নি" }, { status: 404 });
    }

    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === id;
    });

    await user.save();

    return NextResponse.json(
      { message: "ডিফল্ট ঠিকানা আপডেট হয়েছে", addresses: user.addresses },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: "ঠিকানা আপডেট করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}

// ২. ঠিকানা মুছে ফেলা (DELETE)
export async function DELETE(request, { params }) {
  try {
    const userId = await verifyCustomer();
    if (!userId) {
      return NextResponse.json({ message: "অননুমোদিত অ্যাক্সেস" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const user = await User.findById(userId).select("addresses");
    if (!user) {
      return NextResponse.json({ message: "ইউজার পাওয়া যায়নি" }, { status: 404 });
    }

    const targetAddress = user.addresses.id(id);
    if (!targetAddress) {
      return NextResponse.json({ message: "ঠিকানা পাওয়া যায়নি" }, { status: 404 });
    }

    const wasDefault = targetAddress.isDefault;
    targetAddress.deleteOne();

    // ডিফল্ট ঠিকানা ডিলিট হলে অবশিষ্ট প্রথম ঠিকানাটিকে ডিফল্ট করে দেওয়া
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json(
      { message: "ঠিকানা মুছে ফেলা হয়েছে", addresses: user.addresses },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: "ঠিকানা মুছতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
