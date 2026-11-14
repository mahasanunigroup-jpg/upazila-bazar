export function optimizeCloudinaryUrl(url, width = 400) {
  if (!url || typeof url !== "string") return "/placeholder.png";
  // যদি Cloudinary URL হয়, তবে অটো WebP/AVIF এবং সাইজ অপটিমাইজেশন যোগ করবে
  if (url.includes("://cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
  }
  return url;
}
