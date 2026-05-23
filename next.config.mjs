/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // ImgBB domains للصور الحقيقية
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "ibb.co",
      },
    ],
    // نبقي unoptimized لتجنب مشاكل الـ free tier
    unoptimized: true,
  },
}

export default nextConfig
