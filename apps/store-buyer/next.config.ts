import type { NextConfig } from 'next'

const backend = (process.env.BACKEND_URL ?? 'http://localhost:8000').replace(/\/+$/, '').replace(/\/api$/i, '')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@store/shared', '@store/ui'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async rewrites() {
    // Leave NEXT_PUBLIC_BACKEND_URL empty and the browser calls this origin; /api is forwarded to the
    // backend, so the buyer cookie stays first-party (also the simplest dev setup).
    return process.env.NEXT_PUBLIC_BACKEND_URL ? [] : [{ source: '/api/:path*', destination: `${backend}/api/:path*` }]
  },
}

export default config
