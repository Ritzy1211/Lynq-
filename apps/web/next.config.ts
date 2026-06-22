import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@lynq/types'],
  typedRoutes: true,
};

export default nextConfig;
