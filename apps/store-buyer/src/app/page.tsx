import type { Kategori, Produk } from '@store/shared'
import { EmptyState, ErrorNotice, cn } from '@store/ui'
import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import { CATALOG_REVALIDATE_SECONDS, api, errorMessage } from '@/lib/api'
import { filterProduk } from '@/lib/catalog'

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

  return (
    <>
      <section className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Belanja produk pilihan</h1>
        <form action="/" method="get" role="search" className="mt-4 flex max-w-xl gap-2">
          {kategori ? <input type="hidden" name="kategori" value={kategori} /> : null}
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Cari produk…"
            aria-label="Cari produk"
            className="h-10 flex-1 rounded-md border border-input bg-card px-3 text-sm"
          />
          <button type="submit" className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Cari
          </button>
        </form>

        {kategoriList.length > 0 ? (
          <nav aria-label="Kategori" className="mt-4 flex flex-wrap gap-2">
            <Link href={q ? `/?q=${encodeURIComponent(q)}` : '/'} className={chip(!kategori)}>
              Semua
            </Link>
            {kategoriList.map((k) => (
              <Link
                key={k.id}
                href={`/?kategori=${k.id}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                className={chip(kategori === k.id)}
              >
                {k.nama}
              </Link>
            ))}
          </nav>
        ) : null}
      </section>

      {error ? (
        <ErrorNotice message={error} />
      ) : rows.length === 0 ? (
        <EmptyState title="Produk tidak ditemukan" description={q || kategori ? 'Coba kata kunci atau kategori lain.' : 'Belum ada produk.'} />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {rows.map((p) => (
            <li key={p.id}>
              <ProductCard produk={p} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function chip(active: boolean) {
  return cn('rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted', active && 'border-primary bg-primary/20 font-medium')
}
