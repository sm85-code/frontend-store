import { ApiError, fmtRp } from '@store/shared'
import { Gift, MessageCircle, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { AddToCart, StickyBuyBar } from '@/components/AddToCart'
import { CATALOG_REVALIDATE_SECONDS, SITE_URL, api } from '@/lib/api'
import { canonicalRedirect, produkHref } from '@/lib/catalog'

const init = { next: { revalidate: CATALOG_REVALIDATE_SECONDS } } as RequestInit

async function load(ref: string) {
  try {
    return await api.getProduk(ref, init)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const produk = await load((await params).slug).catch(() => null)
  if (!produk) return { title: 'Produk tidak ditemukan' }
  const description = produk.deskripsi.slice(0, 160) || `Beli ${produk.nama} di Ampelkuning.`
  return {
    title: produk.nama,
    description,
    alternates: { canonical: produkHref(produk) },
    openGraph: { type: 'website', title: produk.nama, description, url: produkHref(produk), ...(produk.foto_url ? { images: [produk.foto_url] } : {}) },
    twitter: { card: produk.foto_url ? 'summary_large_image' : 'summary', title: produk.nama, description },
  }
}

export default async function ProdukPage({ params }: { params: Promise<{ slug: string }> }) {
  const ref = (await params).slug
  const produk = await load(ref)
  if (!produk) notFound()
  // An old /produk/<id> link (or any other spelling) goes to the one canonical address, permanently.
  const to = canonicalRedirect(ref, produk)
  if (to) permanentRedirect(to)

  const url = `${SITE_URL}${produkHref(produk)}`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: produk.nama,
      description: produk.deskripsi || undefined,
      image: produk.foto_url ?? undefined,
      sku: produk.id,
      category: produk.kategori_nama ?? undefined,
      url,
      offers: {
        '@type': 'Offer',
        url,
        priceCurrency: 'IDR',
        price: Number(produk.harga),
        availability: produk.stok > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${SITE_URL}/` },
        ...(produk.kategori_nama
          ? [{ '@type': 'ListItem', position: 2, name: produk.kategori_nama, item: `${SITE_URL}/?kategori=${produk.kategori_id}` }]
          : []),
        { '@type': 'ListItem', position: produk.kategori_nama ? 3 : 2, name: produk.nama, item: url },
      ],
    },
  ]
  const sedikit = produk.stok > 0 && produk.stok <= 5

  return (
    <article className="grid gap-6 pb-24 md:grid-cols-2 md:gap-10 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="md:sticky md:top-24 md:self-start">
        <div className="aspect-square overflow-hidden rounded-3xl border bg-[var(--brand-soft)] shadow-[var(--shadow-card)]">
          {produk.foto_url ? (
            <img src={produk.foto_url} alt={produk.nama} className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-sm font-medium text-muted-foreground">Foto segera hadir</div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <nav aria-label="Navigasi" className="text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">Beranda</Link>
          {produk.kategori_nama ? (
            <>
              {' / '}
              <Link href={`/?kategori=${produk.kategori_id}`} className="hover:underline">{produk.kategori_nama}</Link>
            </>
          ) : null}
        </nav>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{produk.nama}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-3xl font-extrabold tracking-tight">{fmtRp(produk.harga)}</p>
          {produk.stok <= 0 ? (
            <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">Stok habis</span>
          ) : sedikit ? (
            <span className="rounded-full bg-[oklch(0.58_0.22_27)] px-3 py-1 text-xs font-bold text-white">Tinggal {produk.stok}</span>
          ) : (
            <span className="rounded-full bg-[oklch(0.68_0.18_150)]/20 px-3 py-1 text-xs font-bold text-[oklch(0.45_0.14_150)] dark:text-[oklch(0.8_0.15_150)]">Stok tersedia</span>
          )}
        </div>

        <div className="hidden md:block">
          <AddToCart produkId={produk.id} stok={produk.stok} />
        </div>

        <ul className="grid gap-2 rounded-2xl border bg-card p-4 text-sm">
          <li className="flex items-center gap-2.5"><ShieldCheck className="size-4.5 shrink-0 text-primary" aria-hidden /> Masuk dengan Google, checkout cepat</li>
          <li className="flex items-center gap-2.5"><MessageCircle className="size-4.5 shrink-0 text-primary" aria-hidden /> Tanya penjual lewat chat sebelum membeli</li>
          <li className="flex items-center gap-2.5"><Gift className="size-4.5 shrink-0 text-primary" aria-hidden /> Pesanan Anda tersimpan dan bisa dipantau</li>
        </ul>

        {produk.deskripsi ? (
          <section aria-labelledby="judul-deskripsi">
            <h2 id="judul-deskripsi" className="mb-1.5 text-base font-extrabold">Deskripsi</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">{produk.deskripsi}</p>
          </section>
        ) : null}
      </div>

      <StickyBuyBar produkId={produk.id} stok={produk.stok} harga={produk.harga} />
    </article>
  )
}
