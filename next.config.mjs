import withPWAInit from 'next-pwa';
import defaultRuntimeCaching from 'next-pwa/cache.js';

const runtimeCaching = defaultRuntimeCaching.filter(
  ({ options }) =>
    !['apis', 'others', 'cross-origin'].includes(options?.cacheName ?? ''),
);

const withPWA = withPWAInit({
  dest: 'public',
  disable: true, // Disabled to resolve Next.js 14 App Router compatibility issues
  register: true,
  skipWaiting: true,
  runtimeCaching,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
