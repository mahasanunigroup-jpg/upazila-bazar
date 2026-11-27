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
    return payload.userId || payload.id || payload._id || payload.sub;
  } catch {
    return null;
  }
}

// ১. কাস্টমারের প্রোফাইল ও সেভ করা ঠিকানাগুলো আনা (চেকআউট অটো-ফিলের জন্য)
export async function GET() {
  try {
    const userId = await verifyCustomer();
    if (!userId) {
      return NextResponse.json({ customer: null, addresses: [] }, { status: 200 });
    }

    await dbConnect();
    const user = await User.findById(userId)
      .select("name phone companyName district upazila union moholla address addresses")
      .lean();

    if (!user) {
      return NextResponse.json({ customer: null, addresses: [] }, { status: 200 });
    }

    return NextResponse.json(
      {
        customer: {
          name: user.name || "",
          phone: user.phone || "",
          companyName: user.companyName || "",
          district: user.district || "",
          upazila: user.upazila || "",
          union: user.union || "",
          moholla: user.moholla || "",
          address: user.address || "",
        },
        addresses: user.addresses || [],
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ customer: null, addresses: [] }, { status: 200 });
  }
}

// ২. নতুন ডেলিভারি ঠিকানা যোগ করা (ড্যাশবোর্ডের অ্যাড্রেস বুকের জন্য)
export async function POST(request) {
  try {
    const userId = await verifyCustomer();
    if (!userId) {
      return NextResponse.json({ message: "অননুমোদিত অ্যাক্সেস" }, { status: 401 });
    }

    const body = await request.json();
    const { label, receiverName, phone, union, villageOrWard, landmark, isDefault } = body;

    if (!receiverName?.trim() || !phone?.trim() || !union?.trim() || !villageOrWard?.trim()) {
      return NextResponse.json(
        { message: "প্রাপকের নাম, মোবাইল, ইউনিয়ন ও গ্রাম/ওয়ার্ড আবশ্যক" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(userId).select("addresses");
    if (!user) {
      return NextResponse.json({ message: "ইউজার পাওয়া যায়নি" }, { status: 404 });
    }

    const shouldBeDefault = user.addresses.length === 0 || Boolean(isDefault);

    if (shouldBeDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      label: label || "বাসা",
      receiverName: receiverName.trim(),
      phone: phone.trim(),
      union: union.trim(),
      villageOrWard: villageOrWard.trim(),
      landmark: landmark?.trim() || "",
      isDefault: shouldBeDefault,
    });

    await user.save();

    return NextResponse.json(
      { message: "নতুন ঠিকানা সেভ হয়েছে", addresses: user.addresses },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "ঠিকানা সেভ করতে সার্ভার ত্রুটি হয়েছে" },
      { status: 500 }
    );
  }
}
