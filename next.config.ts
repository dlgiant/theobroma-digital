import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: [],
  // Support for environment-based configuration
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
  },
};

export default withNextIntl(nextConfig);
