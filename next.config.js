// next.config.js
const withMDX = require('@next/mdx')({ extension: /\.mdx?$/ });

/** @type {import('next').NextConfig} */
module.exports = withMDX({
  experimental: { serverActions: {} },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx'],
  async redirects() {
    return [
      {
        source: '/blog/govai',
        destination: '/blog/aigov',
        permanent: true,
      },
      // Legacy v3 / alternate icon paths -> current assets
      { source: '/favicon-v3.ico', destination: '/favicon.ico', permanent: true },
      { source: '/icon-v3.svg', destination: '/favicon.svg', permanent: true },
      { source: '/apple-icon-v3.png', destination: '/apple-touch-icon.png', permanent: true },
      { source: '/icon.svg', destination: '/favicon.svg', permanent: true },
      { source: '/favicon-48.png', destination: '/favicon.svg', permanent: true },
      { source: '/favicon-192.png', destination: '/icon-192.png', permanent: true },
      { source: '/apple-icon.png', destination: '/apple-touch-icon.png', permanent: true },
    ];
  },
  async headers() {
    const cache = {
      key: 'Cache-Control',
      value: 'public, max-age=86400, stale-while-revalidate=604800',
    };
    return [
      { source: '/favicon.ico', headers: [cache] },
      { source: '/favicon.svg', headers: [cache] },
      { source: '/apple-touch-icon.png', headers: [cache] },
      { source: '/icon-192.png', headers: [cache] },
      { source: '/icon-512.png', headers: [cache] },
    ];
  },
});
