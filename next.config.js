/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.externals = [...(config.externals || []), 'esbuild'];
    return config;
  },
};

module.exports = nextConfig;
