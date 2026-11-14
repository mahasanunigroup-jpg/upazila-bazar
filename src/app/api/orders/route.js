import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

function extractNumber(val) {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const cleaned = val.toString().replace(/[^0-9.]/g, "");
  return Number(cleaned) || 0;
}

async function getUserFromCookie() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

// ১. কাস্টমারের অর্ডার লিস্ট (রাইডার ও সেলারের বিস্তারিত তথ্যসহ)
export async function GET() {
  try {
    await connectDB();
    const user = await getUserFromCookie();
    const userId = user ? (user.userId || user.id) : null;

    const query = userId ? { customerId: userId } : {};

    const rawOrders = await Order.find(query)
      .populate("riderId", "name phone upazila")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const formattedOrders = rawOrders.map((o) => {
      const shops = [...new Set((o.items || []).map((i) => i.shopName).filter(Boolean))];

      return {
        id: o.orderId || o._id.toString().slice(-6).toUpperCase(),
        date: new Date(o.createdAt).toLocaleDateString("bn-BD", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        total: `৳${o.total_amount || 0}`,
        status: o.deliveryStatus === "delivered" ? "delivered" : o.status || "pending",
        paymentMethod: o.payment_method || "Cash on Delivery",
        customerAddress: `${o.customer_address || ""}, ${o.upazila || ""}${o.district ? `, ${o.district}` : ""}`,
        rider: o.riderId
          ? {
              name: o.riderId.name || "নির্ধারিত রাইডার",
              phone: o.riderId.phone || "নম্বর নেই",
              upazila: o.riderId.upazila || "",
            }
          : null,
        shops: shops.length > 0 ? shops : ["উপজেলা ভেরিফায়েড স্টোর"],
        items: (o.items || []).map((i) => ({
          name: i.name || i.title || "পণ্য",
          qty: `${i.qty || 1} টি`,
          price: `৳${(i.price || 0) * (i.qty || 1)}`,
          shopName: i.shopName || "উপজেলা ভেরিফায়েড স্টোর",
        })),
      };
    });

    return NextResponse.json({ success: true, orders: formattedOrders }, { status: 200 });
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json({ success: false, orders: [], error: "অর্ডার লোড হয়নি" }, { status: 500 });
  }
}

// ২. চেকআউট থেকে নতুন অর্ডার তৈরির POST API
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      items = [],
      customer_name,
      customer_phone,
      district = "কিশোরগঞ্জ",
      upazila = "ভৈরব",
      customer_address,
      payment_method = "Cash on Delivery",
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "আপনার কার্ট খালি রয়েছে" }, { status: 400 });
    }

    const user = await getUserFromCookie();
    const customerId = user ? (user.userId || user.id) : null;

    const validProductIds = items
      .map((i) => i.productId || i._id || i.id)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    const dbProducts = await Product.find({ _id: { $in: validProductIds } })
      .select("title price sellerId shopName")
      .lean();

    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    let calculatedTotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const pid = (item.productId || item._id || item.id)?.toString();
      const dbProduct = productMap.get(pid);

      const finalPrice = dbProduct ? Number(dbProduct.price) : extractNumber(item.price);
      const finalQty = Number(item.qty || item.quantity || 1);
      calculatedTotal += finalPrice * finalQty;

      let validSellerId = dbProduct?.sellerId || item.sellerId;
      if (!mongoose.Types.ObjectId.isValid(validSellerId)) {
        validSellerId = new mongoose.Types.ObjectId();
      }

      verifiedItems.push({
        productId: mongoose.Types.ObjectId.isValid(pid) ? pid : new mongoose.Types.ObjectId(),
        name: dbProduct?.title || item.name || item.title || "পণ্য",
        qty: finalQty,
        price: finalPrice,
        sellerId: validSellerId,
        shopName: dbProduct?.shopName || item.shopName || "উপজেলা ভেরিফায়েড স্টোর",
        itemStatus: "pending",
      });
    }

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const generatedOrderId = `UB-${randomNum}`;

    const newOrder = await Order.create({
      orderId: generatedOrderId,
      customerId,
      customer_name: customer_name || "সম্মানিত ক্রেতা",
      customer_phone: customer_phone || "",
      district,
      upazila,
      customer_address: customer_address || "",
      total_amount: calculatedTotal,
      payment_method,
      items: verifiedItems,
    });
        // অর্ডার হওয়া পণ্যগুলোর স্টক অটোমেটিক কমানো (সুপার-ফাস্ট bulkWrite)
    const stockUpdates = verifiedItems.map((item) => ({
      updateOne: {
        filter: { _id: item.productId, stock: { $gt: 0 } },
        update: { $inc: { stock: -item.qty } },
      },
    }));

    if (stockUpdates.length > 0) {
      await Product.bulkWrite(stockUpdates);
    }


    return NextResponse.json(
      { success: true, message: "অর্ডার সফলভাবে সম্পন্ন হয়েছে!", order: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json(
      { error: "সার্ভারে সমস্যা হয়েছে: " + error.message },
      { status: 500 }
    );
  }
}
