import { ADMIN_PREFIX, adminEndpoints, createClient } from '@store/shared'

const baseUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin

export const api = adminEndpoints(createClient({ baseUrl, prefix: ADMIN_PREFIX }))

export function errorMessage(error: unknown, fallback = 'Terjadi kesalahan. Silakan coba lagi.'): string {
  return error instanceof Error && error.message ? error.message : fallback
}
