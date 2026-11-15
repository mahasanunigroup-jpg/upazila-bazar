export async function optimizeImageFile(file, maxWidth = 1200, quality = 0.92) {
  if (!file || !file.type.startsWith("image/")) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // ১২০০px-এর চেয়ে বড় ছবি হলে আনুপাতিক হারে রিসাইজ হবে (ছোট ছবি বড় করে ফাটাবে না)
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            // অপ্টিমাইজড ফাইল আসল ফাইলের চেয়ে বড় হলে আসল ফাইলটিই রাখবে
            if (blob.size >= file.size) return resolve(file);

            const optimizedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".webp"),
              { type: "image/webp", lastModified: Date.now() }
            );
            resolve(optimizedFile);
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}
