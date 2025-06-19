const nextConfig = {
  reactStrictMode: true,
  compress: true,
  images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'via.placeholder.com',
    },
    {
      protocol: 'https',
      hostname: 'lzrkadcfwpzxxdlzusqf.supabase.co',
    },
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
  ],
  formats: ['image/webp'],
  minimumCacheTTL: 60,
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  unoptimized: process.env.NODE_ENV === 'development',
},

  experimental: {
    serverActions: {}, // Remove if you're not using app directory
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
