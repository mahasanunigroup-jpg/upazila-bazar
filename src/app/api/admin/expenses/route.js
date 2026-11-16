// src/app/api/admin/expenses/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Expense from "@/models/Expense";
import Notification from "@/models/Notification";
import { verifyAdmin } from "@/lib/adminAuth";

// ১. নতুন আয় বা ব্যয় / স্যালারি এন্ট্রি
export async function POST(req) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ message: "অননুমোদিত" }, { status: 401 });

    const { type = "expense", title, amount, partyName, partyPhone, note } = await req.json();

    if (!title || !amount || Number(amount) <= 0 || !partyName) {
      return NextResponse.json(
        { message: "খাতের নাম, টাকার পরিমাণ এবং প্রাপক/দাতার নাম আবশ্যক" },
        { status: 400 }
      );
    }

    await connectDB();
    const isMainSuperAdmin = admin.role === "super_admin" || admin.role === "admin";
    const initialStatus = isMainSuperAdmin ? "approved" : "pending";

    const newTransaction = await Expense.create({
      type,
      title: title.trim(),
      amount: Number(amount),
      partyName: partyName.trim(),
      partyPhone: partyPhone?.trim() || "",
      note: note?.trim() || "",
      division: admin.division || "",
      district: admin.district || "",
      upazila: admin.upazila || "",
      union: admin.union || "",
      createdBy: admin._id,
      creatorName: admin.name,
      creatorPhone: admin.phone || "",
      creatorRole: admin.role,
      status: initialStatus,
    });

    if (!isMainSuperAdmin) {
      await Notification.create({
        recipientRole: "super_admin",
        title: "💰 নতুন স্যালারি / ব্যয় অনুমোদনের অনুরোধ",
        message: `${admin.name} (${admin.upazila || admin.district || admin.division || "আঞ্চলিক"}) ৳${amount} টাকার "${title}" জমা দিয়েছেন।`,
        link: "/admin/finance",
      });
    }

    return NextResponse.json(
      {
        message:
          initialStatus === "approved"
            ? "সংরক্ষিত ও অনুমোদিত হয়েছে!"
            : "জমা হয়েছে (Pending)! সুপার অ্যাডমিন অনুমোদন করলে এটি চূড়ান্ত হবে।",
        expense: { ...newTransaction.toObject(), _id: newTransaction._id.toString() },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: "সার্ভার এরর" }, { status: 500 });
  }
}

// ২. সুপার অ্যাডমিনের Approve, Edit এবং Cancel (Delete) কন্ট্রোল
export async function PATCH(req) {
  try {
    const admin = await verifyAdmin();
    const isSuper = admin?.role === "super_admin" || admin?.role === "admin";
    if (!isSuper) {
      return NextResponse.json(
        { message: "শুধুমাত্র সুপার অ্যাডমিন অনুমোদন বা বাতিল করতে পারবেন" },
        { status: 403 }
      );
    }

    const { expenseId, status, amount, title, partyName, note } = await req.json();
    if (!expenseId) return NextResponse.json({ message: "আইডি প্রয়োজন" }, { status: 400 });

    await connectDB();

    // 🗑️ বাতিল (rejected) করলে ডাটাবেস থেকে স্থায়ীভাবে ডিলিট করে দেবে
    if (status === "rejected") {
      const deleted = await Expense.findByIdAndDelete(expenseId).lean();
      if (deleted?.createdBy) {
        await Notification.create({
          recipientId: deleted.createdBy,
          recipientRole: deleted.creatorRole || "division_admin",
          title: "❌ আপনার স্যালারি / ব্যয় বাতিল করা হয়েছে",
          message: `সুপার অ্যাডমিন আপনার "${deleted.title}" (৳${deleted.amount}) লেনদেনটি বাতিল ও তালিকা থেকে মুছে ফেলেছেন।`,
          link: "/admin/finance",
        });
      }
      return NextResponse.json({ message: "লেনদেনটি বাতিল ও মুছে ফেলা হয়েছে!", deleted: true });
    }

    // ✅ অনুমোদন বা এডিট করলে আপডেট হবে
    const updateFields = {};
    if (status) updateFields.status = status;
    if (amount !== undefined && Number(amount) > 0) updateFields.amount = Number(amount);
    if (title !== undefined) updateFields.title = title.trim();
    if (partyName !== undefined) updateFields.partyName = partyName.trim();
    if (note !== undefined) updateFields.note = note.trim();

    const updated = await Expense.findByIdAndUpdate(
      expenseId,
      { $set: updateFields },
      { new: true }
    ).lean();

    if (updated?.createdBy && status === "approved") {
      await Notification.create({
        recipientId: updated.createdBy,
        recipientRole: updated.creatorRole || "division_admin",
        title: "✅ আপনার স্যালারি / ব্যয় অনুমোদিত হয়েছে",
        message: `সুপার অ্যাডমিন আপনার "${updated.title}" (৳${updated.amount}) লেনদেনটি অনুমোদন (Approved) করেছেন। এখন প্রিন্ট করতে পারবেন।`,
        link: "/admin/finance",
      });
    }

    return NextResponse.json({
      message: "সফলভাবে আপডেট হয়েছে!",
      expense: { ...updated, _id: updated._id.toString() },
    });
  } catch (error) {
    return NextResponse.json({ message: "সার্ভার এরর" }, { status: 500 });
  }
}
