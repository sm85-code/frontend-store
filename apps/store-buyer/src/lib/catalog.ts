import type { Produk } from '@store/shared'

export function filterProduk(produk: Produk[], q: string | undefined, kategori: string | undefined): Produk[] {
  const needle = (q ?? '').trim().toLowerCase()
  return produk.filter(
    (p) => (!kategori || p.kategori_id === kategori) && (!needle || p.nama.toLowerCase().includes(needle)),
  )
}
