/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only use static export when building for mobile (via EXPORT_MOBILE=true env var)
  ...(process.env.EXPORT_MOBILE === 'true' ? {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  } : {}),
};

module.exports = nextConfig;
