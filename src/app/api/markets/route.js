import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get("district") || "";
    const upazila = searchParams.get("upazila") || "";
    const union = searchParams.get("union") || "";

    if (!district || !upazila || !union) {
      return NextResponse.json({ markets: [] });
    }

    await connectDB();

    const filter = {
      district: { $regex: district, $options: "i" },
      upazila: { $regex: upazila, $options: "i" },
      union: { $regex: union, $options: "i" },
    };

    const [userMarkets, userMohollas, productMohollas] = await Promise.all([
      User.distinct("marketName", filter),
      User.distinct("moholla", filter),
      Product.distinct("moholla", filter),
    ]);

    const allMarkets = [
      ...new Set(
        [...userMarkets, ...userMohollas, ...productMohollas]
          .map((m) => (m ? m.trim() : ""))
          .filter(Boolean)
      ),
    ];

    return NextResponse.json({ markets: allMarkets });
  } catch (error) {
    console.error("Markets Fetch Error:", error);
    return NextResponse.json({ markets: [] }, { status: 500 });
  }
}
