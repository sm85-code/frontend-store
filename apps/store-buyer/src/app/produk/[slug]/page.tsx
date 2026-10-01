import { ApiError } from '@store/shared'
import { Gift, MessageCircle, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { ProdukDetail } from '@/components/AddToCart'
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
      image: produk.foto?.length ? produk.foto.map((f) => f.url).filter(Boolean) : (produk.foto_url ?? undefined),
      sku: produk.id,
      category: produk.kategori_nama ?? undefined,
      url,
      offers: {
        '@type': 'Offer',
        url,
        priceCurrency: 'IDR',
        price: Number(produk.harga_min ?? produk.harga),
        availability:
          produk.stok <= 0 ? 'https://schema.org/OutOfStock' : produk.preorder ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
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
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <ProdukDetail produk={produk}>
        <ul className="grid gap-2.5 rounded-lg border bg-card p-4 text-sm">
          <li className="flex items-center gap-2.5"><ShieldCheck className="size-[1.1rem] shrink-0 text-[var(--brand-orange)]" aria-hidden /> Masuk dengan Google, checkout cepat</li>
          <li className="flex items-center gap-2.5"><MessageCircle className="size-[1.1rem] shrink-0 text-[var(--brand-orange)]" aria-hidden /> Tanya penjual lewat chat sebelum membeli</li>
          <li className="flex items-center gap-2.5"><Gift className="size-[1.1rem] shrink-0 text-[var(--brand-orange)]" aria-hidden /> Pesanan Anda tersimpan dan bisa dipantau</li>
        </ul>

        {produk.deskripsi ? (
          <section aria-labelledby="judul-deskripsi">
            <h2 id="judul-deskripsi" className="section-title mb-3">Deskripsi</h2>
            <div className="prose-id whitespace-pre-line text-[0.95rem] text-foreground/90">{produk.deskripsi}</div>
          </section>
        ) : null}
      </ProdukDetail>
    </>
  )
}
