"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import HomeHeader from "@/components/HomeHeader";
import ServiceHighlights from "@/components/ServiceHighlights";
import CategorySidebar from "@/components/CategorySidebar";
import FlashDealBanner from "@/components/FlashDealBanner";
import ProductGridSection from "@/components/ProductGridSection";
import ProductModal from "@/components/ProductModal";
import CartDrawer from "@/components/CartDrawer";
import { Store, PhoneCall, MapPin, Search } from "lucide-react";

const SUB_MAP = {
  "মুদি": ["মুদি", "চাল ও ডাল", "ভোজ্য তেল", "আটা ও ময়দা", "লবণ ও চিনি"],
  "সবজি": ["সবজি", "নিত্যদিনের সবজি", "তাজা শাক", "আলু, পেঁয়াজ ও রসুন"],
  "ফল": ["ফল", "মৌসুমী ফল", "বারোমাসি ফল", "খেজুর ও শুকনো ফল"],
  "মাছ ও মাংস": ["মাছ ও মাংস", "নদীর তাজা মাছ", "দেশী ও ব্রয়লার মুরগি", "গরু ও খাসির মাংস"],
  "দুগ্ধ": ["দুগ্ধ", "তরল ও গুঁড়া দুধ", "হাঁস ও মুরগির ডিম", "খাঁটি ঘি ও মাখন"],
  "মসলা": ["মসলা", "গুঁড়া মসলা", "আস্ত গরম মসলা", "আদা ও রসুন বাটা"],
  "স্ন্যাকস": ["স্ন্যাকস", "বিস্কুট ও কেক", "চা ও কফি", "মুড়ি ও চানাচুর"],
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

  useEffect(() => {
    const loadLocalData = () => {
      try {
        const savedCart = JSON.parse(localStorage.getItem("upazila_cart") || "[]");
        const savedWishlist = JSON.parse(localStorage.getItem("upazila_wishlist") || "[]");
        const savedLoc = JSON.parse(localStorage.getItem("upazila_full_location") || "null");

        setCart(savedCart);
        setWishlist(savedWishlist);
        if (savedLoc) setLocation(savedLoc);
      } catch (err) {
        console.error("Local storage load error:", err);
      }
    };

    const timer = setTimeout(loadLocalData, 0);
    return () => clearTimeout(timer);
  }, []);

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
    syncCart(cart.map((item) => (item._id === id ? { ...item, quantity: newQty } : item)));
  };

  const handleRemoveFromCart = (id) => {
    syncCart(cart.filter((item) => item._id !== id));
  };

  const toggleWishlist = (e, id) => {
    e.stopPropagation();
    const updated = wishlist.includes(id) ? wishlist.filter((item) => item !== id) : [...wishlist, id];
    setWishlist(updated);
    localStorage.setItem("upazila_wishlist", JSON.stringify(updated));
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("সব পণ্য");
    setSelectedShop("সব দোকান");
    setSortBy("newest");
    setShowWishlistOnly(false);
  };

  const availableShops = [
    "সব দোকান",
    ...new Set(
      products
        .filter((p) => {
          const matchDist = !location.district || !p.district || p.district === location.district;
          const matchUpz = !location.upazila || !p.upazila || p.upazila === location.upazila;
          return matchDist && matchUpz;
        })
        .map((p) => p.shopName || "উপজেলা ভেরিফায়েড স্টোর")
    ),
  ];
  const filteredProducts = products
    .filter((product) => {
      // ১. জেলা ফিল্টার
      if (location?.district && product.district) {
        if (!product.district.includes(location.district) && !location.district.includes(product.district)) {
          return false;
        }
      } else if (location?.district && !product.district) {
        return false;
      }

      // ২. উপজেলা ফিল্টার
      if (location?.upazila && product.upazila) {
        if (!product.upazila.includes(location.upazila) && !location.upazila.includes(product.upazila)) {
          return false;
        }
      } else if (location?.upazila && !product.upazila) {
        return false;
      }

      // ৩. ইউনিয়ন / পৌরসভা ফিল্টার
      if (location?.union && product.union) {
        if (!product.union.includes(location.union) && !location.union.includes(product.union)) {
          return false;
        }
      } else if (location?.union && !product.union) {
        return false;
      }

      // ৪. মহল্লা / গ্রাম ফিল্টার
      if (location?.moholla && product.moholla) {
        if (!product.moholla.toLowerCase().includes(location.moholla.toLowerCase())) {
          return false;
        }
      }

      // ৫. ক্যাটাগরি ফিল্টার
      if (selectedCategory !== "সব পণ্য") {
        const validCats = SUB_MAP[selectedCategory] || [selectedCategory];
        if (!validCats.includes(product.category)) return false;
      }

      // ৬. দোকান ফিল্টার
      if (selectedShop !== "সব দোকান") {
        const pShop = product.shopName || "উপজেলা ভেরিফায়েড স্টোর";
        if (pShop !== selectedShop) return false;
      }

      // ৭. উইশলিস্ট ফিল্টার
      if (showWishlistOnly && !wishlist.includes(product._id)) {
        return false;
      }

      // ৮. সার্চ ফিল্টার
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = product.title?.toLowerCase().includes(q);
        const matchShop = product.shopName?.toLowerCase().includes(q);
        const matchSeller = product.sellerName?.toLowerCase().includes(q);
        if (!matchTitle && !matchShop && !matchSeller) return false;
      }

      return true;
    })
    .sort((a, b) => (sortBy === "low-to-high" ? a.price - b.price : sortBy === "high-to-low" ? b.price - a.price : 0));

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const hasActiveFilter = searchQuery || selectedCategory !== "সব পণ্য" || selectedShop !== "সব দোকান" || showWishlistOnly;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <HomeHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          location={location}
          setLocation={setLocation}
          totalCartItems={totalCartItems}
          onOpenCart={() => setIsCartOpen(true)}
        />

        <ServiceHighlights />

        <div className="max-w-6xl mx-auto pt-6 px-4 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="পণ্য, দোকানের নাম বা দোকানদারের নাম লিখুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6 items-start">
          <CategorySidebar
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            showWishlistOnly={showWishlistOnly}
            setShowWishlistOnly={setShowWishlistOnly}
            hasActiveFilter={hasActiveFilter}
            resetFilters={resetFilters}
          />

          <main className="flex-1 w-full">
            <FlashDealBanner onSelectOffer={() => setSortBy("low-to-high")} />

            <ProductGridSection
              loading={loading}
              filteredProducts={filteredProducts}
              availableShops={availableShops}
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

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} onUpdateQty={handleUpdateQty} onRemove={handleRemoveFromCart} />

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2 font-bold text-green-600 text-base">
            <Store className="w-5 h-5" /> উপজেলা বাজার
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 text-xs sm:text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-green-600" /> {location.upazila || "সারা বাংলাদেশ"}
            </span>
            <span className="flex items-center gap-1">
              <PhoneCall className="w-4 h-4 text-green-600" /> ০১৭০০-০০০০০০
            </span>
            <Link href="/seller/dashboard" className="text-green-600 font-semibold hover:underline">
              সেলার প্যানেল
            </Link>
          </div>
          <p className="text-xs text-gray-400">© ২০২৬ উপজেলা বাজার। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>
    </div>
  );
}
