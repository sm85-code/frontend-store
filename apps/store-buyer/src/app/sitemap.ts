import type { MetadataRoute } from 'next'
import { SITE_URL, api } from '@/lib/api'
import { produkHref } from '@/lib/catalog'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const produk = await api.listProduk().catch(() => [])
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/kebijakan-privasi`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/cara-berbelanja`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/kebijakan-retur`, changeFrequency: 'yearly', priority: 0.3 },
    ...produk.map((p) => ({ url: `${SITE_URL}${produkHref(p)}`, changeFrequency: 'weekly' as const, priority: 0.7 })),
  ]
}
