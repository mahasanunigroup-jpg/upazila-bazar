import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

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

export async function PATCH(request) {
  try {
    const userId = await verifyCustomer();
    if (!userId) {
      return NextResponse.json({ message: "অননুমোদিত অ্যাক্সেস" }, { status: 401 });
    }

    const body = await request.json();
    const {
      companyName,
      division,
      district,
      upazila,
      union,
      moholla,
      address,
      currentPassword,
      newPassword,
    } = body;

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "ইউজার পাওয়া যায়নি" }, { status: 404 });
    }

    // শুধুমাত্র অনুমোদিত ফিল্ডগুলো আপডেট (name, phone, email অপরিবর্তিত থাকবে)
    if (companyName !== undefined) user.companyName = companyName.trim();
    if (division !== undefined) user.division = division.trim();
    if (district !== undefined) user.district = district.trim();
    if (upazila !== undefined) user.upazila = upazila.trim();
    if (union !== undefined) user.union = union.trim();
    if (moholla !== undefined) user.moholla = moholla.trim();
    if (address !== undefined) user.address = address.trim();

    // পাসওয়ার্ড পরিবর্তন লজিক
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: "পাসওয়ার্ড পরিবর্তন করতে বর্তমান পাসওয়ার্ড দিন" },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { message: "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { message: "বর্তমান পাসওয়ার্ডটি সঠিক নয়" },
          { status: 400 }
        );
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return NextResponse.json(
      { message: "প্রোফাইল সফলভাবে আপডেট হয়েছে" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "প্রোফাইল আপডেট করতে সার্ভার ত্রুটি হয়েছে" },
      { status: 500 }
    );
  }
}
