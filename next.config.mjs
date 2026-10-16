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
        source: '/admin/reset-password',
        destination: '/admin/reset-password.html',
      },
      {
        source: '/admin/reset-password/',
        destination: '/admin/reset-password.html',
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
  async headers() {
    return [
      {
        source: '/assets/brochures/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
      {
        source: '/cards/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
