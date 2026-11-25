import { getCategoryRules } from "@/data/productOptions";
import { optimizeImageFile } from "@/lib/optimizeImage";

const bnToEn = { "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9" };
const parseCleanNum = (val) =>
  String(val || "").replace(/[০-৯]/g, (d) => bnToEn[d]).replace(/[^0-9.]/g, "");

export async function uploadSellerProducts({ items, sellerInfo, onProgress }) {
  let uploadedCount = 0;

  for (let i = 0; i < items.length; i++) {
    const current = items[i];
    onProgress(`পণ্য ${i + 1} / ${items.length} আপলোড হচ্ছে...`);

    const data = new FormData();
    Object.keys(sellerInfo).forEach((key) => {
      if (sellerInfo[key]) data.append(key, sellerInfo[key]);
    });

    const unitLabel = current.unit || "কেজি (kg)";
    const packLabel = current.packagingType || "প্যাকেটজাত";
    const rxTag = current.prescriptionRequired ? "📄 প্রেসক্রিপশন বাধ্যতামূলক" : "";
    const smartMeta = [current.smartField1?.trim(), current.smartField2?.trim(), rxTag]
      .filter(Boolean)
      .join(" • ");
    const extraInfo = smartMeta ? ` [${smartMeta}]` : "";

    const regularPrice = Number(parseCleanNum(current.price) || 0);
    const discountPrice = Number(parseCleanNum(current.discountPrice) || 0);
    const hasValidDiscount = discountPrice > 0 && discountPrice < regularPrice;
    const finalSellingPrice = hasValidDiscount ? discountPrice : regularPrice;
    const discountBadge = hasValidDiscount ? ` • 🔥 ছাড় (আগের দাম ৳${regularPrice})` : "";

    data.append("marketName", sellerInfo.moholla);
    data.append("title", `${current.title.trim()} (প্রতি ${unitLabel})`);
    data.append("description", `[${packLabel} • প্রতি ${unitLabel}${discountBadge}]${extraInfo} ${current.description.trim()}`);
    data.append("price", String(finalSellingPrice));
    if (hasValidDiscount) data.append("originalPrice", String(regularPrice));
    data.append("unit", unitLabel);
    data.append("packagingType", packLabel);
    data.append("category", current.category || "সাধারণ");

    const ruleKey = getCategoryRules(current.category).key;
    if (current.smartField1?.trim()) {
      const prev1 = JSON.parse(localStorage.getItem(`upazila_smart_${ruleKey}_f1`) || "[]");
      localStorage.setItem(`upazila_smart_${ruleKey}_f1`, JSON.stringify([...new Set([current.smartField1.trim(), ...prev1])]));
    }
    if (current.smartField2?.trim()) {
      const prev2 = JSON.parse(localStorage.getItem(`upazila_smart_${ruleKey}_f2`) || "[]");
      localStorage.setItem(`upazila_smart_${ruleKey}_f2`, JSON.stringify([...new Set([current.smartField2.trim(), ...prev2])]));
    }

    if (current.imageFile) {
      const optimized = await optimizeImageFile(current.imageFile);
      data.append("image", optimized);
    } else if (current.existingImage) {
      data.append("existingImage", current.existingImage);
    }

    const res = await fetch("/api/products", { method: "POST", body: data });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `পণ্য #${i + 1} আপলোড ব্যর্থ হয়েছে`);
    }
    uploadedCount++;
  }

  return uploadedCount;
}
