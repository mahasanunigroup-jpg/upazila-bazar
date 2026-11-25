"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import HomeHeader from "@/components/HomeHeader";
import ServiceHighlights from "@/components/ServiceHighlights";
import CategorySidebar from "@/components/CategorySidebar";
import FlashDealBanner from "@/components/FlashDealBanner";
import UnionMarketSection from "@/components/UnionMarketSection";
import ProductGridSection from "@/components/ProductGridSection";
import ProductModal from "@/components/ProductModal";
import CartDrawer from "@/components/CartDrawer";
import { Store, PhoneCall, MapPin, Search } from "lucide-react";

const SUB_MAP = {
  মুদি: ["মুদি", "চাল ও ডাল", "ভোজ্য তেল", "আটা ও ময়দা", "লবণ ও চিনি"],
  সবজি: ["সবজি", "নিত্যদিনের সবজি", "তাজা শাক", "আলু, পেঁয়াজ ও রসুন"],
  ফল: ["ফল", "মৌসুমী ফল", "বারোমাসি ফল", "খেজুর ও শুকনো ফল"],
  "মাছ ও মাংস": [
    "মাছ ও মাংস",
    "নদীর তাজা মাছ",
    "দেশী ও ব্রয়লার মুরগি",
    "গরু ও খাসির মাংস",
  ],
  দুগ্ধ: ["দুগ্ধ", "তরল ও গুঁড়া দুধ", "হাঁস ও মুরগির ডিম", "খাঁটি ঘি ও মাখন"],
  মসলা: ["মসলা", "গুঁড়া মসলা", "আস্ত গরম মসলা", "আদা ও রসুন বাটা"],
  স্ন্যাকস: ["স্ন্যাকস", "বিস্কুট ও কেক", "চা ও কফি", "মুড়ি ও চানাচুর"],
  "ওষুধ ও ফার্মেসি": [
    "ওষুধ ও ফার্মেসি",
    "সাধারণ ওষুধ",
    "প্রেসক্রিপশন ওষুধ",
    "শিশু ও মাতৃযত্ন",
    "ফার্স্ট এইড ও ডিভাইস",
  ],
  "রেস্টুরেন্ট ও বিরিয়ানি": [
    "রেস্টুরেন্ট ও বিরিয়ানি",
    "কাচ্চি ও বিরিয়ানি",
    "ভাত, মাছ ও ভর্তা",
    "গ্রিল ও কাবাব",
  ],
  "ফাস্ট ফুড": [
    "ফাস্ট ফুড",
    "বার্গার ও স্যান্ডউইচ",
    "পিৎজা ও পাস্তা",
    "ফ্রাইড চিকেন ও রোল",
  ],
  "কাপড় ও গার্মেন্টস": [
    "কাপড় ও গার্মেন্টস",
    "ছেলেদের পোশাক",
    "মেয়েদের পোশাক",
    "বাচ্চাদের পোশাক",
  ],
  "মোবাইল ও ইলেকট্রনিক্স": [
    "মোবাইল ও ইলেকট্রনিক্স",
    "মোবাইল এক্সেসরিজ",
    "লাইট, ফ্যান ও সুইচ",
    "হোম অ্যাপ্লায়েন্স",
  ],
  কসমেটিকস: ["কসমেটিকস", "স্কিন ও হেয়ার কেয়ার", "পারফিউম ও বডি স্প্রে"],
};

export default function HomeClient({ initialProducts = [] }) {
  const [products] = useState(initialProducts);
  const [loading] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addedId, setAddedId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("সব পণ্য");
  const [selectedShop, setSelectedShop] = useState("সব দোকান");
  const [selectedMarket, setSelectedMarket] = useState("সব বাজার");
  const [sortBy, setSortBy] = useState("newest");
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  const [location, setLocation] = useState({
    district: "",
    upazila: "",
    union: "",
    moholla: "",
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("upazila_cart") || "[]",
      );
      const savedWishlist = JSON.parse(
        localStorage.getItem("upazila_wishlist") || "[]",
      );
      const savedLoc = JSON.parse(
        localStorage.getItem("upazila_full_location") || "null",
      );

      setCart(savedCart);
      setWishlist(savedWishlist);
      if (savedLoc) setLocation(savedLoc);
    } catch (err) {
      console.error("Local storage load error:", err);
    }
  }, []);

  const handleLocationChange = (newLoc) => {
    setLocation(newLoc);
    setSelectedMarket("সব বাজার");
    setSelectedShop("সব দোকান");
  };

  const syncCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("upazila_cart", JSON.stringify(updatedCart));
  };

  const handleAddToCart = (product) => {
    const idx = cart.findIndex((item) => item._id === product._id);
    const updated = [...cart];
    if (idx > -1) updated[idx].quantity += 1;
    else
      updated.push({
        _id: product._id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1,
        sellerId: product.sellerId || "seller_default",
        shopName: product.shopName || "উপজেলা ভেরিফায়েড স্টোর",
      });

    syncCart(updated);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1000);
  };

  const handleUpdateQty = (id, newQty) => {
    if (newQty < 1) return handleRemoveFromCart(id);
    syncCart(
      cart.map((item) =>
        item._id === id ? { ...item, quantity: newQty } : item,
      ),
    );
  };

  const handleRemoveFromCart = (id) => {
    syncCart(cart.filter((item) => item._id !== id));
  };

  const toggleWishlist = (e, id) => {
    e.stopPropagation();
    const updated = wishlist.includes(id)
      ? wishlist.filter((item) => item !== id)
      : [...wishlist, id];
    setWishlist(updated);
    localStorage.setItem("upazila_wishlist", JSON.stringify(updated));
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("সব পণ্য");
    setSelectedMarket("সব বাজার");
    setSelectedShop("সব দোকান");
    setSortBy("newest");
    setShowWishlistOnly(false);
  };

  const areaProducts = useMemo(() => {
    // যদি লগইন করা ইউজার সেলার হন, তবে তার সব সম্ভাব্য ফিল্ড (id, _id, email, shopName, name) মিলিয়ে পণ্য দেখাবে
    if (currentUser?.role === "seller") {
      const userId = String(currentUser._id || currentUser.id || "").trim();
      const userEmail = (currentUser.email || "").trim().toLowerCase();
      const userShop = (currentUser.shopName || "").trim().toLowerCase();
      const userName = (currentUser.name || "").trim().toLowerCase();

      return products.filter((product) => {
        const prodSellerId = String(
          product.sellerId || product.userId || "",
        ).trim();
        const prodEmail = (product.sellerEmail || product.email || "")
          .trim()
          .toLowerCase();
        const prodShop = (product.shopName || "").trim().toLowerCase();
        const prodSellerName = (product.sellerName || "").trim().toLowerCase();

        if (userId && prodSellerId && userId === prodSellerId) return true;
        if (userEmail && prodEmail && userEmail === prodEmail) return true;
        if (userShop && prodShop && userShop === prodShop) return true;
        if (userName && prodSellerName && userName === prodSellerName)
          return true;

        return false;
      });
    }

    // সাধারণ কাস্টমার বা গেস্ট ইউজারদের জন্য এলাকা অনুযায়ী সব পণ্য দেখাবে
    return products.filter((product) => {
      if (
        location?.district &&
        (!product.district ||
          (!product.district.includes(location.district) &&
            !location.district.includes(product.district)))
      )
        return false;
      if (
        location?.upazila &&
        (!product.upazila ||
          (!product.upazila.includes(location.upazila) &&
            !location.upazila.includes(product.upazila)))
      )
        return false;
      if (
        location?.union &&
        (!product.union ||
          (!product.union.includes(location.union) &&
            !location.union.includes(product.union)))
      )
        return false;
      return true;
    });
  }, [
    products,
    currentUser,
    location.district,
    location.upazila,
    location.union,
  ]);

  const unionMarketsData = useMemo(() => {
    const marketMap = {};
    const defaultMarketName = location?.union
      ? `${location.union} মূল সদর বাজার`
      : "মূল সদর বাজার";

    areaProducts.forEach((p) => {
      const mName = p.moholla?.trim() || defaultMarketName;
      const sName = p.shopName || "উপজেলা ভেরিফায়েড স্টোর";

      if (!marketMap[mName])
        marketMap[mName] = { name: mName, shops: {}, productCount: 0 };
      marketMap[mName].productCount += 1;

      if (!marketMap[mName].shops[sName]) {
        marketMap[mName].shops[sName] = {
          shopName: sName,
          sellerName: p.sellerName || "স্থানীয় বিক্রেতা",
          marketName: mName,
          productCount: 0,
          ratingSum: 0,
          ratedCount: 0,
        };
      }

      marketMap[mName].shops[sName].productCount += 1;
      if (p.rating > 0) {
        marketMap[mName].shops[sName].ratingSum += p.rating;
        marketMap[mName].shops[sName].ratedCount += 1;
      }
    });

    return Object.values(marketMap).map((m) => ({
      ...m,
      shopList: Object.values(m.shops).map((s) => ({
        ...s,
        avgRating:
          s.ratedCount > 0 ? (s.ratingSum / s.ratedCount).toFixed(1) : "নতুন",
      })),
    }));
  }, [areaProducts, location.union]);

  const activeMarketShops = useMemo(() => {
    if (selectedMarket === "সব বাজার")
      return unionMarketsData.flatMap((m) => m.shopList);
    return (
      unionMarketsData.find((m) => m.name === selectedMarket)?.shopList || []
    );
  }, [unionMarketsData, selectedMarket]);

  const availableShops = useMemo(
    () => ["সব দোকান", ...new Set(activeMarketShops.map((s) => s.shopName))],
    [activeMarketShops],
  );

  const filteredProducts = useMemo(() => {
    const defaultMarketName = location?.union
      ? `${location.union} মূল সদর বাজার`
      : "মূল সদর বাজার";

    return areaProducts
      .filter((product) => {
        if (
          location?.moholla &&
          product.moholla &&
          !product.moholla
            .toLowerCase()
            .includes(location.moholla.toLowerCase())
        )
          return false;
        if (
          selectedMarket !== "সব বাজার" &&
          (product.moholla?.trim() || defaultMarketName) !== selectedMarket
        )
          return false;

        if (selectedCategory !== "সব পণ্য") {
          const allowedCategories = SUB_MAP[selectedCategory] || [
            selectedCategory,
          ];
          const isMatched =
            allowedCategories.includes(product.category) ||
            (product.subCategory &&
              allowedCategories.includes(product.subCategory));
          if (!isMatched) return false;
        }

        if (
          selectedShop !== "সব দোকান" &&
          (product.shopName || "উপজেলা ভেরিফায়েড স্টোর") !== selectedShop
        )
          return false;
        if (showWishlistOnly && !wishlist.includes(product._id)) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match = [
            product.title,
            product.shopName,
            product.sellerName,
            product.moholla,
            product.category,
          ].some((f) => f?.toLowerCase().includes(q));
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) =>
        sortBy === "low-to-high"
          ? a.price - b.price
          : sortBy === "high-to-low"
            ? b.price - a.price
            : 0,
      );
  }, [
    areaProducts,
    location.moholla,
    location.union,
    selectedMarket,
    selectedCategory,
    selectedShop,
    showWishlistOnly,
    wishlist,
    searchQuery,
    sortBy,
  ]);

  const currentShopDetails = useMemo(
    () =>
      selectedShop === "সব দোকান"
        ? null
        : activeMarketShops.find((s) => s.shopName === selectedShop) || null,
    [selectedShop, activeMarketShops],
  );
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const hasActiveFilter =
    searchQuery ||
    selectedCategory !== "সব পণ্য" ||
    selectedMarket !== "সব বাজার" ||
    selectedShop !== "সব দোকান" ||
    showWishlistOnly;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 flex flex-col justify-between">
      <div className="w-full">
        <HomeHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          location={location}
          setLocation={handleLocationChange}
          totalCartItems={totalCartItems}
          onOpenCart={() => setIsCartOpen(true)}
          // নিচের এই ৩টি লাইন নতুন যোগ করুন:
          wishlistCount={wishlist.length}
          onOpenWishlist={() => setShowWishlistOnly(true)}
          onSelectCategory={(cat) => {
            setShowWishlistOnly(false);
            setSelectedCategory(cat);
          }}
        />

        <ServiceHighlights />

        <div className="max-w-6xl mx-auto pt-4 px-3 sm:px-6 md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="পণ্য, বাজার বা দোকানের নাম লিখুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-green-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto py-4 sm:py-8 px-3 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
                   {/* সেলার লগইন থাকলে ক্যাটাগরি সাইডবার হাইড থাকবে */}
          {currentUser?.role !== "seller" && (
            <CategorySidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              showWishlistOnly={showWishlistOnly}
              setShowWishlistOnly={setShowWishlistOnly}
              hasActiveFilter={hasActiveFilter}
              resetFilters={resetFilters}
            />
          )}


          <main className="flex-1 w-full min-w-0">
            <FlashDealBanner onSelectOffer={() => setSortBy("low-to-high")} />

            {/* সেলার লগইন থাকলে বাজার লিস্ট হাইড থাকবে */}
            {currentUser?.role !== "seller" && (
              <UnionMarketSection
                location={location}
                unionMarketsData={unionMarketsData}
                activeMarketShops={activeMarketShops}
                selectedMarket={selectedMarket}
                setSelectedMarket={setSelectedMarket}
                selectedShop={selectedShop}
                setSelectedShop={setSelectedShop}
                currentShopDetails={currentShopDetails}
              />
            )}

            <ProductGridSection
              loading={loading}
              filteredProducts={filteredProducts}
              // সেলার লগইন থাকলে দোকান ফিল্টার বার হাইড থাকবে
              availableShops={
                currentUser?.role === "seller" ? [] : availableShops
              }
              selectedShop={selectedShop}
              setSelectedShop={setSelectedShop}
              location={location}
              showWishlistOnly={showWishlistOnly}
              selectedCategory={selectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              hasActiveFilter={hasActiveFilter}
              resetFilters={resetFilters}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              setSelectedProduct={setSelectedProduct}
              handleAddToCart={handleAddToCart}
              addedId={addedId}
            />
          </main>
        </div>
      </div>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemoveFromCart}
      />

      <footer className="bg-white border-t border-gray-200 mt-12 w-full">
        <div className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold text-green-600 text-base">
            <Store className="w-5 h-5" /> উপজেলা বাজার
          </div>
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-green-600" />{" "}
              {location.upazila || "সারা বাংলাদেশ"}
            </span>
            <span className="flex items-center gap-1">
              <PhoneCall className="w-4 h-4 text-green-600" /> ০১৭০০-০০০০০০
            </span>
            <Link
              href="/seller/dashboard"
              className="text-green-600 font-semibold hover:underline"
            >
              সেলার প্যানেল
            </Link>
          </div>
          <p className="text-xs text-gray-400">
            © ২০২৬ উপজেলা বাজার। সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </footer>
    </div>
  );
}
