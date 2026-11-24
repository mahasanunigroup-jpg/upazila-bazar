import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find({})
      .select("title category description image price")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const seen = new Set();
    const suggestions = [];

    for (const p of products) {
      const cleanTitle = (p.title || "").replace(/\s*\(প্রতি.*?\)\s*$/, "").trim();
      if (!cleanTitle || seen.has(cleanTitle.toLowerCase())) continue;
      seen.add(cleanTitle.toLowerCase());

      const bracketMatches = [...(p.description || "").matchAll(/\[(.*?)\]/g)];
      let field1 = "";
      let field2 = "";

      if (bracketMatches.length > 1) {
        const innerText = bracketMatches.at(1)?.at(1) || "";
        const parts = innerText
          .split("•")
          .map((s) => s.trim())
          .filter((s) => s && !s.includes("প্রেসক্রিপশন"));

        field1 = parts.at(0) || "";
        field2 = parts.at(1) || "";
      }

      suggestions.push({
        title: cleanTitle,
        image: p.image || "",
        field1,
        field2,
      });
    }

    const categories = [
      ...new Set(products.map((p) => p.category?.trim()).filter(Boolean)),
    ];

    return NextResponse.json({ suggestions, categories });
  } catch (error) {
    console.error("Suggestions Error:", error);
    return NextResponse.json({ suggestions: [], categories: [] });
  }
}
