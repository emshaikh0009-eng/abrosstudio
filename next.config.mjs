/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/admin/index.html',
      },
      {
        source: '/admin/',
        destination: '/admin/index.html',
      },
      {
        source: '/admin.css',
        destination: '/admin/admin.css',
      },
      {
        source: '/admin.js',
        destination: '/admin/admin.js',
      },
      {
        source: '/cards',
        destination: '/cards/index.html',
      },
      {
        source: '/cards/',
        destination: '/cards/index.html',
      },
    ];
  },
};

export default nextConfig;
