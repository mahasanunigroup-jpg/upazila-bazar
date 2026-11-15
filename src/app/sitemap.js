import { cacheLife } from 'next/cache';
import * as dbModule from '@/lib/db';
import * as slugModule from '@/lib/slugify';
import Product from '@/models/Product';

export default async function sitemap() {
  'use cache';
  cacheLife('hours');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    const connect =
      dbModule.default ||
      dbModule.connectDB ||
      dbModule.dbConnect ||
      Object.values(dbModule).find((fn) => typeof fn === 'function');

    if (connect) {
      await connect();
    }

    const slugify =
      slugModule.default ||
      slugModule.slugify ||
      Object.values(slugModule).find((fn) => typeof fn === 'function');

    const products = await Product.find({}).select('title updatedAt').lean();

    // === ঠিক এই অংশে পরিবর্তনটি বসানো হয়েছে ===
    const productRoutes = products.map((product) => {
      let cleanSlug = slugify ? slugify(product.title || '') : '';

      // যদি বাংলা টাইটেল বা অন্য কারণে cleanSlug খালি আসে, তবে টাইটেল থেকে স্পেস বাদ দিয়ে স্লাগ নেবে
      if (!cleanSlug && product.title) {
        cleanSlug = product.title.trim().toLowerCase().replace(/\s+/g, '-');
      }

      const finalSlug = cleanSlug ? `${cleanSlug}-${product._id}` : `${product._id}`;

      return {
        url: `${baseUrl}/product/${finalSlug}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      };
    });
    // ============================================

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.error('Sitemap error:', error);
    return staticRoutes;
  }
}
