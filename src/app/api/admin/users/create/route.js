import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyAdmin } from "@/lib/adminAuth";
import { MANAGEABLE_ROLES } from "@/lib/adminScope";
import { generateRoleUserId } from "@/lib/generateUserId";
import { recordAuditLog } from "@/lib/auditLogger";

export async function POST(req) {
  try {
    // ১. অ্যাডমিন সেশন যাচাই
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

    // ২. মৌলিক ফিল্ড যাচাই
    if (!name || !email || !phone || !password || !role) {
      return NextResponse.json(
        { message: "নাম, ইমেইল, ফোন, পাসওয়ার্ড এবং রোল আবশ্যক" },
        { status: 400 }
      );
    }

    // ৩. কঠোর ফরম্যাট ভ্যালিডেশন
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const nidRegex = /^(\d{10}|\d{13}|\d{17})$/;
    const hasDigitRegex = /[0-9০-৯]/;

    if (name.trim().length < 3 || hasDigitRegex.test(name)) {
      return NextResponse.json(
        { message: "পূর্ণ নামে কোনো সংখ্যা থাকতে পারবে না (কমপক্ষে ৩ অক্ষর দিন)" },
        { status: 400 }
      );
    }

    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { message: "সঠিক ইমেইল ঠিকানা দিন (যেমন: example@gmail.com)" },
        { status: 400 }
      );
    }

    if (!bdPhoneRegex.test(phone.trim())) {
      return NextResponse.json(
        { message: "সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" },
        { status: 400 }
      );
    }

    if (biodata.fatherName && hasDigitRegex.test(biodata.fatherName)) {
      return NextResponse.json(
        { message: "পিতার নামে কোনো সংখ্যা থাকতে পারবে না" },
        { status: 400 }
      );
    }

    if (biodata.motherName && hasDigitRegex.test(biodata.motherName)) {
      return NextResponse.json(
        { message: "মাতার নামে কোনো সংখ্যা থাকতে পারবে না" },
        { status: 400 }
      );
    }

    if (biodata.nidNumber && !nidRegex.test(biodata.nidNumber.trim())) {
      return NextResponse.json(
        { message: "সঠিক ১০, ১৩ অথবা ১৭ ডিজিটের NID নম্বর দিন" },
        { status: 400 }
      );
    }

    if (
      biodata.emergencyPhone &&
      !bdPhoneRegex.test(biodata.emergencyPhone.trim())
    ) {
      return NextResponse.json(
        { message: "জরুরি যোগাযোগ নম্বরটি ১১ ডিজিটের হতে হবে (01XXXXXXXXX)" },
        { status: 400 }
      );
    }

    // ৪. হায়ারার্কি পারমিশন চেক
    const allowedRoles = MANAGEABLE_ROLES[admin.role] || [];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { message: "আপনি এই স্তরের অ্যাকাউন্ট তৈরি করার অনুমতি রাখেন না" },
        { status: 403 }
      );
    }

    await connectDB();

    // ৫. ডুপ্লিকেট ফোন বা ইমেইল চেক
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

    // ৬. রোল অনুযায়ী লোকেশন সেভ করা
    const finalDivision = division || admin.division || "";
    const finalDistrict =
      role === "division_admin" ? "" : district || admin.district || "";
    const finalUpazila = ["division_admin", "district_admin"].includes(role)
      ? ""
      : upazila || admin.upazila || "";
    const finalUnion = [
      "division_admin",
      "district_admin",
      "upazila_admin",
    ].includes(role)
      ? ""
      : union || admin.union || "";

    // ৭. ইউনিক অফিশিয়াল আইডি তৈরি
    const generatedCustomId = generateRoleUserId(role);

    // ৮. ডাটাবেজে নতুন অ্যাকাউন্ট তৈরি
    const newUser = await User.create({
      customId: generatedCustomId,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      division: finalDivision,
      district: finalDistrict,
      upazila: finalUpazila,
      union: finalUnion,
      address: address || biodata.presentAddress || "",
      biodata: {
        avatar: biodata.avatar || "",
        fatherName: biodata.fatherName?.trim() || "",
        motherName: biodata.motherName?.trim() || "",
        nidNumber: biodata.nidNumber?.trim() || "",
        nidFrontImage: biodata.nidFrontImage || "",
        nidBackImage: biodata.nidBackImage || "",
        dateOfBirth: biodata.dateOfBirth || "",
        bloodGroup: biodata.bloodGroup || "",
        emergencyPhone: biodata.emergencyPhone?.trim() || "",
        permanentAddress: biodata.permanentAddress?.trim() || "",
        presentAddress: biodata.presentAddress?.trim() || "",
        vehicleType: biodata.vehicleType || "",
      },
      isApproved: true,
      isBlocked: false,
      status: "active",
    });

    // ৯. অডিট লগ এবং সুপার অ্যাডমিন নোটিফিকেশন সেভ করা
    await recordAuditLog({
      admin,
      actionType: "ROLE_CHANGE",
      targetId: newUser._id.toString(),
      description: `নতুন অ্যাকাউন্ট (${newUser.name}) তৈরি করা হয়েছে এবং রোল '${role}' দেওয়া হয়েছে।`,
      metadata: { customId: newUser.customId, newRole: role },
    });

    return NextResponse.json(
      {
        message: `পূর্ণাঙ্গ বায়োডাটাসহ নতুন অ্যাকাউন্ট তৈরি হয়েছে! (ID: ${newUser.customId})`,
        user: {
          _id: newUser._id.toString(),
          customId: newUser.customId,
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
