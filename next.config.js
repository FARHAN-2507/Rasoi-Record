/** @type {import('next').NextConfig} */
const nextConfig = {
  // Preserve existing configuration here if any
  output: process.env.NEXT_PUBLIC_IS_STATIC ? 'export' : undefined,
};

module.exports = nextConfig;