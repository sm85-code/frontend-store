import { fmtRp, type Produk } from '@store/shared'
import { Card } from '@store/ui'
import Link from 'next/link'

export function ProductCard({ produk }: { produk: Produk }) {
  const habis = produk.stok <= 0
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/produk/${produk.id}`} className="block" aria-label={produk.nama}>
        <div className="relative aspect-square bg-muted">
          {produk.foto_url ? (
            <img src={produk.foto_url} alt="" loading="lazy" className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-sm text-muted-foreground">Tanpa foto</div>
          )}
          {habis ? (
            <span className="absolute left-2 top-2 rounded-full bg-foreground px-2 py-0.5 text-xs font-medium text-background">Habis</span>
          ) : null}
        </div>
        <div className="p-3">
          <p className="line-clamp-2 min-h-10 text-sm font-medium">{produk.nama}</p>
          {produk.kategori_nama ? <p className="mt-0.5 text-xs text-muted-foreground">{produk.kategori_nama}</p> : null}
          <p className="mt-2 font-bold">{fmtRp(produk.harga)}</p>
        </div>
      </Link>
    </Card>
  )
}
