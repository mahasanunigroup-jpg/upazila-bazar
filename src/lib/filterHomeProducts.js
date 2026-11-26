export const SUB_MAP = {
  মুদি: ["মুদি", "চাল ও ডাল", "ভোজ্য তেল", "আটা ও ময়দা", "লবণ ও চিনি"],
  সবজি: ["সবজি", "নিত্যদিনের সবজি", "তাজা শাক", "আলু, পেঁয়াজ ও রসুন"],
  ফল: ["ফল", "মৌসুমী ফল", "বারোমাসি ফল", "খেজুর ও শুকনো ফল"],
  "মাছ ও মাংস": ["মাছ ও মাংস", "নদীর তাজা মাছ", "দেশী ও ব্রয়লার মুরগি", "গরু ও খাসির মাংস"],
  দুগ্ধ: ["দুগ্ধ", "তরল ও গুঁড়া দুধ", "হাঁস ও মুরগির ডিম", "খাঁটি ঘি ও মাখন"],
  মসলা: ["মসলা", "গুঁড়া মসলা", "আস্ত গরম মসলা", "আদা ও রসুন বাটা"],
  স্ন্যাকস: ["স্ন্যাকস", "বিস্কুট ও কেক", "চা ও কফি", "মুড়ি ও চানাচুর"],
  "ওষুধ ও ফার্মেসি": ["ওষুধ ও ফার্মেসি", "সাধারণ ওষুধ", "প্রেসক্রিপশন ওষুধ", "শিশু ও মাতৃযত্ন", "ফার্স্ট এইড ও ডিভাইস"],
  "রেস্টুরেন্ট ও বিরিয়ানি": ["রেস্টুরেন্ট ও বিরিয়ানি", "কাচ্চি ও বিরিয়ানি", "ভাত, মাছ ও ভর্তা", "গ্রিল ও কাবাব"],
  "ফাস্ট ফুড": ["ফাস্ট ফুড", "বার্গার ও স্যান্ডউইচ", "পিৎজা ও পাস্তা", "ফ্রাইড চিকেন ও রোল"],
  "কাপড় ও গার্মেন্টস": ["কাপড় ও গার্মেন্টস", "ছেলেদের পোশাক", "মেয়েদের পোশাক", "বাচ্চাদের পোশাক"],
  "মোবাইল ও ইলেকট্রনিক্স": ["মোবাইল ও ইলেকট্রনিক্স", "মোবাইল এক্সেসরিজ", "লাইট, ফ্যান ও সুইচ", "হোম অ্যাপ্লায়েন্স"],
  কসমেটিকস: ["কসমেটিকস", "স্কিন ও হেয়ার কেয়ার", "পারফিউম ও বডি স্প্রে"],
};

export function getAreaProducts(products, currentUser, location) {
  if (currentUser?.role === "seller") {
    const userId = String(
      currentUser._id || currentUser.id || currentUser.userId || ""
    ).trim();

    if (!userId) return [];

    return products.filter((p) => {
      const rawSellerId =
        typeof p.sellerId === "object" && p.sellerId !== null
          ? p.sellerId._id || p.sellerId.id
          : p.sellerId || p.userId;
      const pId = String(rawSellerId || "").trim();

      return pId !== "" && pId === userId;
    });
  }

  return products.filter((p) => {
    if (
      location?.district &&
      (!p.district ||
        (!p.district.includes(location.district) &&
          !location.district.includes(p.district)))
    )
      return false;
    if (
      location?.upazila &&
      (!p.upazila ||
        (!p.upazila.includes(location.upazila) &&
          !location.upazila.includes(p.upazila)))
    )
      return false;
    if (
      location?.union &&
      (!p.union ||
        (!p.union.includes(location.union) &&
          !location.union.includes(p.union)))
    )
      return false;
    return true;
  });
}

export function buildUnionMarkets(areaProducts, unionName) {
  const marketMap = {};
  const defaultMarketName = unionName ? `${unionName} মূল সদর বাজার` : "মূল সদর বাজার";

  areaProducts.forEach((p) => {
    const mName = p.moholla?.trim() || defaultMarketName;
    const sName = p.shopName || "উপজেলা ভেরিফায়েড স্টোর";

    if (!marketMap[mName]) marketMap[mName] = { name: mName, shops: {}, productCount: 0 };
    marketMap[mName].productCount += 1;

    if (!marketMap[mName].shops[sName]) {
      marketMap[mName].shops[sName] = {
        shopName: sName,
        sellerName: p.sellerName || "স্থানীয় বিক্রেতা",
        marketName: mName,
        avgRating: Number(p.rating || p.averageRating || 4.8).toFixed(1),
        productCount: 0,
      };
    }
    marketMap[mName].shops[sName].productCount += 1;
  });

  return Object.values(marketMap).map((m) => {
    const shopsArray = Object.values(m.shops || {});
    return {
      ...m,
      shopList: shopsArray,
      shops: shopsArray,
    };
  });
}

export function filterAndSortProducts({
  areaProducts,
  location,
  selectedMarket,
  selectedCategory,
  selectedShop,
  showWishlistOnly,
  wishlist,
  searchQuery,
  sortBy,
}) {
  const defaultMarketName = location?.union ? `${location.union} মূল সদর বাজার` : "মূল সদর বাজার";

  return areaProducts
    .filter((product) => {
      if (
        location?.moholla &&
        product.moholla &&
        !product.moholla.toLowerCase().includes(location.moholla.toLowerCase())
      )
        return false;
      if (
        selectedMarket !== "সব বাজার" &&
        (product.moholla?.trim() || defaultMarketName) !== selectedMarket
      )
        return false;
      if (selectedCategory !== "সব পণ্য") {
        const allowed = SUB_MAP[selectedCategory] || [selectedCategory];
        if (
          !allowed.includes(product.category) &&
          !(product.subCategory && allowed.includes(product.subCategory))
        )
          return false;
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
        : 0
    );
}
