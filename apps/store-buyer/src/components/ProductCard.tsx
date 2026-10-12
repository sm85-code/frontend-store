import { fmtRp, type Produk } from '@store/shared'
import Link from 'next/link'
import { QuickAdd } from '@/components/QuickAdd'
import { produkHref } from '@/lib/catalog'

/** "Rp 50.000" or, when variants are priced differently, "Rp 50.000 – Rp 70.000". */
export function hargaLabel(p: Pick<Produk, 'harga' | 'harga_min' | 'harga_max'>): string {
  if (p.harga_min && p.harga_max && Number(p.harga_min) !== Number(p.harga_max)) return `${fmtRp(p.harga_min)} – ${fmtRp(p.harga_max)}`
  return fmtRp(p.harga_min ?? p.harga)
}

export function ProductCard({ produk, index = 0 }: { produk: Produk; index?: number }) {
  const habis = produk.stok <= 0
  const sedikit = !habis && produk.stok <= 5
  const punyaVarian = (produk.varian?.length ?? 0) > 0
  return (
    <article className="fade-up card-lift group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card" style={{ '--i': Math.min(index, 12) } as React.CSSProperties}>
      <Link href={produkHref(produk)} className="flex min-w-0 flex-1 flex-col" aria-label={produk.nama}>
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {produk.foto_url ? (
            <img
              src={produk.foto_url}
              alt=""
              loading="lazy"
              className={`size-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${habis ? 'opacity-60 grayscale' : ''}`}
            />
          ) : (
            <div className="grid size-full place-items-center bg-[var(--brand-soft)] text-xs font-medium text-muted-foreground">Foto segera hadir</div>
          )}
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {habis ? (
              <span className="rounded bg-foreground px-2 py-0.5 text-[0.7rem] font-bold text-background">Habis</span>
            ) : sedikit ? (
              <span className="rounded bg-[oklch(0.58_0.22_27)] px-2 py-0.5 text-[0.7rem] font-bold text-white">Sisa {produk.stok}</span>
            ) : null}
            {produk.preorder ? (
              <span className="rounded bg-[var(--brand-orange)] px-2 py-0.5 text-[0.7rem] font-bold text-white">Pre-order</span>
            ) : null}
          </div>
        </div>
        <div className="min-w-0 px-3 pt-3 pb-2">
          {produk.kategori_nama ? <p className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">{produk.kategori_nama}</p> : null}
          <h3 className="product-card-title mt-0.5 text-sm font-semibold" title={produk.nama}>{produk.nama}</h3>
        </div>
      </Link>
      <div className="mt-auto flex items-end justify-between gap-2 px-3 pb-3">
        <Link href={produkHref(produk)} className="min-w-0 flex-1 break-words text-[0.95rem] font-extrabold leading-snug">{hargaLabel(produk)}</Link>
        {habis ? null : <div className="shrink-0">
          {punyaVarian ? (
            <Link
              href={produkHref(produk)}
              aria-label={`Pilih varian ${produk.nama}`}
              className="grid h-8 place-items-center rounded-md bg-primary px-2.5 text-xs font-bold text-primary-foreground transition active:scale-95"
            >
              Pilih
            </Link>
          ) : (
            <QuickAdd produkId={produk.id} nama={produk.nama} />
          )}
        </div>}
      </div>
    </article>
  )
}
