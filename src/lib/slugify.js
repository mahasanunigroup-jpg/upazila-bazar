export function createProductSlug(title, id) {
  if (!id) return "";
  const cleanTitle = (title || "product")
    .toString()
    .trim()
    .toLowerCase()
    // ইংরেজি, বাংলা অক্ষর ও সংখ্যা রেখে বাকি স্পেশাল ক্যারেক্টারকে হাইফেন বানানো
    .replace(/[^\w\u0980-\u09FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleanTitle ? `${cleanTitle}-${id}` : id.toString();
}

export function extractIdFromSlug(slugParam) {
  if (!slugParam) return "";
  const decoded = decodeURIComponent(slugParam);
  // শেষের ২৪-অক্ষরের MongoDB ObjectId বের করা
  const parts = decoded.split("-");
  const lastPart = parts[parts.length - 1];
  return lastPart;
}
