import type { NextConfig } from 'next';

const avatarRemotePatterns: Array<{
  protocol: 'http' | 'https';
  hostname: string;
  port: string;
  pathname: string;
}> = [];
let supabaseOrigin = '';

// Limit the image optimizer to this project's public Supabase avatar bucket.
try {
  const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '');
  if (supabaseUrl.protocol === 'http:' || supabaseUrl.protocol === 'https:') {
    supabaseOrigin = supabaseUrl.origin;
    avatarRemotePatterns.push({
      protocol: supabaseUrl.protocol.slice(0, -1) as 'http' | 'https',
      hostname: supabaseUrl.hostname,
      port: supabaseUrl.port,
      pathname: '/storage/v1/object/public/avatars/**',
    });
  }
} catch {
  // src/lib/supabase.ts reports a clearer error when the URL is missing or invalid.
}

const isDevelopment = process.env.NODE_ENV === 'development';
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `connect-src 'self'${supabaseOrigin ? ` ${supabaseOrigin}` : ''}${isDevelopment ? ' ws: wss:' : ''}`,
  `img-src 'self' blob: data:${supabaseOrigin ? ` ${supabaseOrigin}` : ''}`,
  "font-src 'self' data:",
  "frame-src https://hudl.com https://*.hudl.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: avatarRemotePatterns,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
