import { fmtRp, type Produk } from '@store/shared'
import Link from 'next/link'
import { QuickAdd } from '@/components/QuickAdd'
import { produkHref } from '@/lib/catalog'

export function ProductCard({ produk, index = 0 }: { produk: Produk; index?: number }) {
  const habis = produk.stok <= 0
  const sedikit = !habis && produk.stok <= 5
  return (
    <article className="fade-up card-lift group relative overflow-hidden rounded-2xl border bg-card" style={{ '--i': Math.min(index, 12) } as React.CSSProperties}>
      <Link href={produkHref(produk)} className="block" aria-label={produk.nama}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {produk.foto_url ? (
            <img
              src={produk.foto_url}
              alt=""
              loading="lazy"
              className={`size-full object-cover transition-transform duration-500 group-hover:scale-105 ${habis ? 'opacity-60 grayscale' : ''}`}
            />
          ) : (
            <div className="grid size-full place-items-center bg-[var(--brand-soft)] text-xs font-medium text-muted-foreground">Foto segera hadir</div>
          )}
          {habis ? (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background">Habis</span>
          ) : sedikit ? (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-[oklch(0.58_0.22_27)] px-2.5 py-1 text-xs font-semibold text-white">Sisa {produk.stok}</span>
          ) : null}
        </div>
        <div className="p-3 pb-3.5">
          {produk.kategori_nama ? <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">{produk.kategori_nama}</p> : null}
          <h3 className="mt-0.5 line-clamp-2 min-h-10 text-sm font-semibold leading-snug">{produk.nama}</h3>
          <p className="mt-2 text-base font-extrabold tracking-tight">{fmtRp(produk.harga)}</p>
        </div>
      </Link>
      {habis ? null : (
        <div className="absolute bottom-3 right-3">
          <QuickAdd produkId={produk.id} nama={produk.nama} />
        </div>
      )}
    </article>
  )
}
