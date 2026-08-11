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
      // Retire every legacy icon URL without serving an old cached asset.
      // Keep /favicon.ico as a real file (browsers + Googlebot request it by default).
      {
        source: '/:legacy(favicon\\.svg|favicon-v3\\.ico|icon\\.svg|icon-v3\\.svg|favicon-48\\.png|favicon-192\\.png|icon-192\\.png|icon-512\\.png|apple-icon\\.png|apple-icon-v3\\.png|apple-touch-icon\\.png)',
        destination: '/favicon-monika-v2.png',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/favicon-monika-v2.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          },
        ],
      },
      {
        source: '/site.webmanifest',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },
});
