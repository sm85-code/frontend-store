import type { Produk } from '@store/shared'

export function filterProduk(produk: Produk[], q: string | undefined, kategori: string | undefined): Produk[] {
  const needle = (q ?? '').trim().toLowerCase()
  return produk.filter(
    (p) => (!kategori || p.kategori_id === kategori) && (!needle || p.nama.toLowerCase().includes(needle)),
  )
}

/** Address of a product page: the slug when the backend has one, the id otherwise (it redirects to the slug). */
export function produkHref(p: { slug?: string | null; id: string }): string {
  return `/produk/${p.slug || p.id}`
}

/** Where a product page should permanently redirect to, or null when the URL is already the canonical one. */
export function canonicalRedirect(param: string, p: { slug?: string | null }): string | null {
  return p.slug && param !== p.slug ? `/produk/${p.slug}` : null
}

/** Products worth a "selling out" rail: some stock, but not much. */
export function segeraHabis(produk: Produk[], limit = 8): Produk[] {
  return produk.filter((p) => p.stok > 0 && p.stok <= 5).slice(0, limit)
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** True for the id format of old product links (/produk/<uuid>). */
export function looksLikeId(ref: string): boolean {
  return UUID.test(ref)
}
