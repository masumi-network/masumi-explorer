/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: ['ipfs.io', 'gateway.pinata.cloud'],  // Add any image domains you might need
    },
  }
  
  module.exports = nextConfig