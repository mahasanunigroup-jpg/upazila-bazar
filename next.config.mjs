/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  
  // নতুন Next.js আর্কিটেকচারে ফাইল সাইজ লিমিট ১০ এমবি করার লজিক
  serverActions: {
    bodySizeLimit: '10mb',
  },
  
  experimental: {
    agentFeedback: true,
    serverActionsBodySizeLimit: '10mb', // ওল্ড ব্যাকআপ সাপোর্ট
  },
  
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
