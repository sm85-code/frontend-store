import { BUYER_PREFIX, buyerEndpoints, createClient } from '@store/shared'

/** Server components call the backend directly (BACKEND_URL); the browser uses NEXT_PUBLIC_BACKEND_URL,
 *  or this origin when it is empty (the /api rewrite in next.config.ts forwards it). */
function baseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? ''
}

export const api = buyerEndpoints(createClient({ baseUrl: baseUrl(), prefix: BUYER_PREFIX }))

export function errorMessage(error: unknown, fallback = 'Terjadi kesalahan. Silakan coba lagi.'): string {
  return error instanceof Error && error.message ? error.message : fallback
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')
export const CATALOG_REVALIDATE_SECONDS = 60
