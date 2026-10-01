import { ApiError, fmtRp } from '@store/shared'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AddToCart } from '@/components/AddToCart'
import { CATALOG_REVALIDATE_SECONDS, SITE_URL, api } from '@/lib/api'

const init = { next: { revalidate: CATALOG_REVALIDATE_SECONDS } } as RequestInit

async function load(id: string) {
  try {
    return await api.getProduk(id, init)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const produk = await load((await params).id).catch(() => null)
  if (!produk) return { title: 'Produk tidak ditemukan' }
  const description = produk.deskripsi.slice(0, 160) || `Beli ${produk.nama} di Ampelkuning.`
  return {
    title: produk.nama,
    description,
    alternates: { canonical: `/produk/${produk.id}` },
    openGraph: { title: produk.nama, description, ...(produk.foto_url ? { images: [produk.foto_url] } : {}) },
  }
}

export default async function ProdukPage({ params }: { params: Promise<{ id: string }> }) {
  const produk = await load((await params).id)
  if (!produk) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: produk.nama,
    description: produk.deskripsi || undefined,
    image: produk.foto_url ?? undefined,
    url: `${SITE_URL}/produk/${produk.id}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IDR',
      price: Number(produk.harga),
      availability: produk.stok > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <article className="grid gap-8 md:grid-cols-2">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
        {produk.foto_url ? (
          <img src={produk.foto_url} alt={produk.nama} className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">Tanpa foto</div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <nav aria-label="Navigasi" className="text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">Beranda</Link>
          {produk.kategori_nama ? <> / <Link href={`/?kategori=${produk.kategori_id}`} className="hover:underline">{produk.kategori_nama}</Link></> : null}
        </nav>
        <h1 className="text-2xl font-bold tracking-tight">{produk.nama}</h1>
        <p className="text-3xl font-bold">{fmtRp(produk.harga)}</p>
        <p className="text-sm text-muted-foreground">{produk.stok > 0 ? `Stok tersedia: ${produk.stok}` : 'Stok habis'}</p>
        <AddToCart produkId={produk.id} stok={produk.stok} />
        {produk.deskripsi ? <p className="whitespace-pre-line text-sm leading-relaxed">{produk.deskripsi}</p> : null}
      </div>
    </article>
  )
}
