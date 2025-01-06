/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // WebAssembly configuration
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Optional: Add polyfill for older browsers
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    // Suppress WebAssembly warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@sidan-lab\/sidan-csl-rs-browser\/sidan_csl_rs_bg\.wasm/ }
    ];

    return config;
  },
}

module.exports = nextConfig; 