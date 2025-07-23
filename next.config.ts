import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

// Check if we're building for static export
const isStaticExport = process.env.BUILD_STATIC === 'true';

const nextConfig: NextConfig = {
  // Only use export output for static builds
  ...(isStaticExport && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true
    }
  }),
  // For development, use standard configuration
  ...(!isStaticExport && {
    images: {
      // Default image optimization for dev
    }
  }),
  serverExternalPackages: [],
  // Support for environment-based configuration
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
  },
};

export default withNextIntl(nextConfig);
