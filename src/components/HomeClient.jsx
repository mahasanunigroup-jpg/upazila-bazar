"use client";

import React, { useEffect, useState, useMemo } from "react";
import HomeHeader from "@/components/HomeHeader";
import ServiceHighlights from "@/components/ServiceHighlights";
import CategorySidebar from "@/components/CategorySidebar";
import FlashDealBanner from "@/components/FlashDealBanner";
import UnionMarketSection from "@/components/UnionMarketSection";
import ProductGridSection from "@/components/ProductGridSection";
import ProductModal from "@/components/ProductModal";
import CartDrawer from "@/components/CartDrawer";
import HomeFooter from "@/components/HomeFooter";
import { Search } from "lucide-react";
import {
  getAreaProducts,
  buildUnionMarkets,
  filterAndSortProducts,
} from "@/lib/filterHomeProducts";

export default function HomeClient({
  initialProducts = [],
  initialUser = null,
}) {
  const [products] = useState(initialProducts);
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
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [openDrawerForShop, setOpenDrawerForShop] = useState(false);

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("upazila_cart") || "[]"));
      setWishlist(JSON.parse(localStorage.getItem("upazila_wishlist") || "[]"));
      const savedLoc = JSON.parse(
        localStorage.getItem("upazila_full_location") || "null",
      );
      if (savedLoc) setLocation(savedLoc);
    } catch {}

    if (!initialUser) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data?.user) setCurrentUser(data.user);
        })
        .catch(() => {});
    }
  }, [initialUser]);

  const syncCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("upazila_cart", JSON.stringify(updatedCart));
  };

  const handleAddToCart = (product) => {
    const idx = cart.findIndex((item) => item._id === product._id);
    const updated = [...cart];
    if (idx > -1) {
      updated[idx].quantity = Number((updated[idx].quantity + 1).toFixed(2));
    } else {
       updated.push({
        _id: product._id,
        title: product.title,
        price: product.price,
        sellingType: product.sellingType || "",
        piecesPerBox: product.piecesPerBox || 0,
        category: product.category || "",
        image: product.image,
        quantity: 1,
        sellerId: product.sellerId || "seller_default",
        shopName: product.shopName || "উপজেলা ভেরিফায়েড স্টোর",
      });
    }
    syncCart(updated);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1000);
  };

  // ০.২৫ (২৫০ গ্রাম) বা ০.৫ (৫০০ গ্রাম) সাপোর্টসহ আপডেট লজিক
  const handleUpdateQty = (id, newQty) => {
    if (newQty <= 0) return syncCart(cart.filter((item) => item._id !== id));
    syncCart(
      cart.map((item) =>
        item._id === id ? { ...item, quantity: Number(newQty) } : item,
      ),
    );
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

  const areaProducts = useMemo(
    () => getAreaProducts(products, currentUser, location),
    [products, currentUser, location],
  );

  const unionMarketsData = useMemo(
    () => buildUnionMarkets(areaProducts, location.union),
    [areaProducts, location.union],
  );

  const activeMarketShops = useMemo(() => {
    if (selectedMarket === "সব বাজার") {
      return unionMarketsData.flatMap((m) => m.shopList || []);
    }
    return (
      unionMarketsData.find((m) => m.name === selectedMarket)?.shopList || []
    );
  }, [unionMarketsData, selectedMarket]);

  const availableShops = useMemo(
    () => [...new Set(activeMarketShops.map((s) => s.shopName))],
    [activeMarketShops],
  );

  const currentShopDetails = useMemo(
    () =>
      selectedShop === "সব দোকান"
        ? null
        : activeMarketShops.find((s) => s.shopName === selectedShop) || null,
    [selectedShop, activeMarketShops],
  );

  const filteredProducts = useMemo(
    () =>
      filterAndSortProducts({
        areaProducts,
        location,
        selectedMarket,
        selectedCategory,
        selectedShop,
        showWishlistOnly,
        wishlist,
        searchQuery,
        sortBy,
      }),
    [
      areaProducts,
      location,
      selectedMarket,
      selectedCategory,
      selectedShop,
      showWishlistOnly,
      wishlist,
      searchQuery,
      sortBy,
    ],
  );

  const isSeller = currentUser?.role === "seller";
  const totalCartItems = cart.length;
  const hasActiveFilter = Boolean(
    searchQuery ||
    selectedCategory !== "সব পণ্য" ||
    selectedMarket !== "সব বাজার" ||
    selectedShop !== "সব দোকান" ||
    showWishlistOnly,
  );
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 flex flex-col justify-between">
      <div className="w-full">
        <HomeHeader
          initialUser={currentUser}
          selectedCategory={selectedCategory}
          externalOpenDrawer={openDrawerForShop}
          onDrawerOpened={() => setOpenDrawerForShop(false)}
          marketProps={{
            location,
            unionMarketsData,
            activeMarketShops,
            selectedMarket,
            setSelectedMarket,
            selectedShop,
            setSelectedShop,
            currentShopDetails,
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          location={location}
          setLocation={(newLoc) => {
            setLocation(newLoc);
            setSelectedMarket("সব বাজার");
            setSelectedShop("সব দোকান");
          }}
          totalCartItems={totalCartItems}
          onOpenCart={() => setIsCartOpen(true)}
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
          {!isSeller && (
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

            {!isSeller && (
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
              loading={false}
              filteredProducts={filteredProducts}
              availableShops={isSeller ? [] : availableShops}
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
              currentShopDetails={currentShopDetails}
              onOpenShopSelector={() => setOpenDrawerForShop(true)}
              userRole={currentUser?.role || null}
            />
          </main>
        </div>
      </div>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        userRole={currentUser?.role || null}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemove={(id) => syncCart(cart.filter((item) => item._id !== id))}
      />
      <HomeFooter upazila={location.upazila} />
    </div>
  );
}
