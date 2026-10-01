import type { Kategori, Produk } from '@store/shared'
import { EmptyState, ErrorNotice } from '@store/ui'
import Link from 'next/link'
import { Hero, KategoriRail } from '@/components/Hero'
import { ProductCard } from '@/components/ProductCard'
import { CATALOG_REVALIDATE_SECONDS, api, errorMessage } from '@/lib/api'
import { filterProduk, segeraHabis } from '@/lib/catalog'

const init = { next: { revalidate: CATALOG_REVALIDATE_SECONDS } } as RequestInit

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string; kategori?: string }> }) {
  const { q, kategori } = await searchParams
  let produk: Produk[] = []
  let kategoriList: Kategori[] = []
  let error: string | null = null
  try {
    ;[produk, kategoriList] = await Promise.all([api.listProduk(init), api.listKategori(init)])
  } catch (e) {
    error = errorMessage(e, 'Katalog belum bisa dimuat. Coba lagi sebentar lagi.')
  }
  const rows = filterProduk(produk, q, kategori)
  const mencari = Boolean(q || kategori)
  const terbatas = mencari ? [] : segeraHabis(produk)
  const namaKategori = kategoriList.find((k) => k.id === kategori)?.nama

  return (
    <div className="flex flex-col gap-6">
      {mencari ? null : <Hero />}

      <KategoriRail kategori={kategoriList} aktif={kategori} q={q} />

      {terbatas.length > 0 ? (
        <section aria-labelledby="judul-terbatas">
          <h2 id="judul-terbatas" className="mb-3 text-lg font-extrabold">
            Segera habis <span aria-hidden>⏳</span>
          </h2>
          <ul className="scroll-x -mx-4 px-4 pb-1 sm:mx-0 sm:px-0">
            {terbatas.map((p, i) => (
              <li key={p.id} className="w-44 sm:w-52">
                <ProductCard produk={p} index={i} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section id="produk" aria-labelledby="judul-produk" className="scroll-mt-32">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="judul-produk" className="text-lg font-extrabold">
            {q ? `Hasil untuk “${q}”` : namaKategori ?? 'Semua produk'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {rows.length} produk
            {mencari ? (
              <>
                {' · '}
                <Link href="/" className="font-semibold text-foreground underline underline-offset-2">
                  Hapus filter
                </Link>
              </>
            ) : null}
          </p>
        </div>

        {error ? (
          <ErrorNotice message={error} />
        ) : rows.length === 0 ? (
          <EmptyState title="Produk tidak ditemukan" description={mencari ? 'Coba kata kunci atau kategori lain.' : 'Belum ada produk.'} />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {rows.map((p, i) => (
              <li key={p.id}>
                <ProductCard produk={p} index={i} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
