import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const price = formData.get("price");
    const category = formData.get("category");
    const stock = formData.get("stock");
    const shopName = formData.get("shopName");
    const sellerName = formData.get("sellerName");
    const district = formData.get("district");
    const upazila = formData.get("upazila");
    const union = formData.get("union");
    const file = formData.get("image");

    if (!title || !description || !price || !category || !file) {
      return NextResponse.json({ message: "সব তথ্য এবং ছবি সঠিকভাবে দিন" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "upazila_bazar_products" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const newProduct = await Product.create({
      title,
      description,
      price: Number(price),
      category,
      stock: stock ? Number(stock) : 10,
      shopName: shopName || "উপজেলা ভেরিফায়েড স্টোর",
      sellerName: sellerName || "স্থানীয় বিক্রেতা",
      district: district || "কিশোরগঞ্জ",
      upazila: upazila || "ভৈরব",
      union: union || "",
      image: uploadResult.secure_url,
    });

    return NextResponse.json({ message: "পণ্যটি সফলভাবে আপলোড হয়েছে", product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Product Upload Error:", error);
    return NextResponse.json({ message: `আপলোড ব্যর্থ হয়েছে: ${error.message}` }, { status: 500 });
  }
}
