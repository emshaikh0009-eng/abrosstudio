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
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'ambrosstudio.space',
          },
        ],
        destination: 'https://ambrosstudio.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.ambrosstudio.space',
          },
        ],
        destination: 'https://ambrosstudio.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
