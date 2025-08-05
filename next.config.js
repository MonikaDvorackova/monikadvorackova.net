/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {},
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx'],
};

module.exports = nextConfig;
