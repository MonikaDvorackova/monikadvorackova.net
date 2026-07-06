// next.config.js
const withMDX = require('@next/mdx')({ extension: /\.mdx?$/ });

const ICON_V3 = {
  ico: '/favicon-v3.ico',
  svg: '/icon-v3.svg',
  apple: '/apple-icon-v3.png',
};

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
      // Legacy favicon paths → v3 assets (Google/browsers may still request these)
      { source: '/favicon.svg', destination: ICON_V3.svg, permanent: true },
      { source: '/icon.svg', destination: ICON_V3.svg, permanent: true },
      { source: '/favicon-48.png', destination: ICON_V3.svg, permanent: true },
      { source: '/favicon-192.png', destination: ICON_V3.svg, permanent: true },
      { source: '/apple-touch-icon.png', destination: ICON_V3.apple, permanent: true },
      { source: '/apple-icon.png', destination: ICON_V3.apple, permanent: true },
    ];
  },
  async headers() {
    const cache = {
      key: 'Cache-Control',
      value: 'public, max-age=86400, stale-while-revalidate=604800',
    };
    return [
      { source: '/favicon-v3.ico', headers: [cache] },
      { source: '/favicon.ico', headers: [cache] },
      { source: '/icon-v3.svg', headers: [cache] },
      { source: '/apple-icon-v3.png', headers: [cache] },
    ];
  },
});
