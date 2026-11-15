import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyAdmin } from "@/lib/adminAuth";
import { MANAGEABLE_ROLES } from "@/lib/adminScope";

export async function POST(req) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ message: "অননুমোদিত অ্যাক্সেস" }, { status: 401 });
    }

    const {
      name,
      phone,
      email,
      password,
      role,
      division,
      district,
      upazila,
      union,
      address,
      biodata = {},
    } = await req.json();

    if (!name || !email || !phone || !password || !role) {
      return NextResponse.json(
        { message: "নাম, ইমেইল, ফোন, পাসওয়ার্ড এবং রোল আবশ্যক" },
        { status: 400 }
      );
    }

    const allowedRoles = MANAGEABLE_ROLES[admin.role] || [];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { message: "আপনি এই স্তরের অ্যাকাউন্ট তৈরি করার অনুমতি রাখেন না" },
        { status: 403 }
      );
    }

    await connectDB();

    const existing = await User.findOne({
      $or: [{ phone: phone.trim() }, { email: email.trim().toLowerCase() }],
    }).lean();

    if (existing) {
      return NextResponse.json(
        { message: "এই ফোন নম্বর বা ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা আছে" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // রোল অনুযায়ী কেবল প্রয়োজনীয় স্তরের লোকেশন সেভ করা
    const finalDivision = division || admin.division || "";
    const finalDistrict =
      role === "division_admin" ? "" : district || admin.district || "";
    const finalUpazila = ["division_admin", "district_admin"].includes(role)
      ? ""
      : upazila || admin.upazila || "";
    const finalUnion = ["division_admin", "district_admin", "upazila_admin"].includes(role)
      ? ""
      : union || admin.union || "";

    const newUser = await User.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      division: finalDivision,
      district: finalDistrict,
      upazila: finalUpazila,
      union: finalUnion,
      address: address || "",
      biodata: {
        fatherName: biodata.fatherName || "",
        nidNumber: biodata.nidNumber || "",
        dateOfBirth: biodata.dateOfBirth || "",
        bloodGroup: biodata.bloodGroup || "",
        emergencyPhone: biodata.emergencyPhone || "",
        vehicleType: biodata.vehicleType || "",
      },
      isApproved: true,
      isBlocked: false,
      status: "active",
    });

    return NextResponse.json(
      {
        message: "বায়োডাটাসহ নতুন অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!",
        user: {
          _id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          division: newUser.division,
          district: newUser.district,
          upazila: newUser.upazila,
          union: newUser.union,
          address: newUser.address,
          biodata: newUser.biodata,
          isApproved: true,
          isBlocked: false,
          status: "active",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Admin/Rider Error:", error);
    return NextResponse.json(
      { message: "অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
