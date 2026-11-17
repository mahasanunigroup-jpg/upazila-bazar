import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { verifyAdmin } from "@/lib/adminAuth";
import { recordAuditLog } from "@/lib/auditLogger";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req, { params }) {
  try {
    // ১০০% অ্যাডমিন ভেরিফিকেশন
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { message: "অ্যাক্সেস অস্বীকৃত (Forbidden)" },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectDB();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: "পণ্য পাওয়া যায়নি" }, { status: 404 });
    }

    const productName = product.name || product.title || "অজানা পণ্য";
    const shopName = product.shopName || "";

    // Cloudinary থেকে ছবি ডিলিট করা
    const imgList =
      product.images?.length > 0
        ? product.images
        : product.image
        ? [product.image]
        : [];
    for (const imgUrl of imgList) {
      try {
        const parts = imgUrl.split("/");
        const fileName = parts[parts.length - 1].split(".");
        const folder = parts[parts.length - 2];
        if (folder && fileName) {
          await cloudinary.uploader.destroy(`${folder}/${fileName}`);
        }
      } catch {}
    }

    await Product.findByIdAndDelete(id);

    // স্থায়ী অডিট লগ এবং সুপার অ্যাডমিনের কাছে রিয়েল-টাইম অ্যালার্ট পাঠানো
    await recordAuditLog({
      admin,
      actionType: "PRODUCT_DELETE",
      targetId: id.toString(),
      description: `পণ্য "${productName}"${shopName ? ` (দোকান: ${shopName})` : ""} স্থায়ীভাবে ডিলিট করা হয়েছে।`,
      metadata: { productName, shopName, price: product.price },
    });

    return NextResponse.json({
      message: "পণ্যটি প্ল্যাটফর্ম থেকে স্থায়ীভাবে মুছে ফেলা হয়েছে!",
    });
  } catch (error) {
    console.error("Admin Delete Product Error:", error);
    return NextResponse.json({ message: "ডিলিট করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
