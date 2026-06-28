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
    ];
  },
});
