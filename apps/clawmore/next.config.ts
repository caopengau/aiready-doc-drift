import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  output: 'standalone',
};

// Only enable Sentry in production when not building with OpenNext
const isSentryEnabled =
  process.env.NODE_ENV === 'production' && !process.env.OPEN_NEXT_BUILD;

const config = isSentryEnabled
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: 'aiready',
      project: 'clawmore',
    })
  : nextConfig;

export default config;
