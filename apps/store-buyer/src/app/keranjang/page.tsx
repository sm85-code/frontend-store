'use client'

import { fmtRp } from '@store/shared'
import { Button, EmptyState, ErrorNotice, PageSpinner, buttonVariants } from '@store/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Minus, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { api, errorMessage } from '@/lib/api'
import { CART_KEY, cartTotal, useCart, useMe } from '@/lib/queries'

export default function KeranjangPage() {
  const me = useMe()
  const cart = useCart()
  const qc = useQueryClient()
  const refresh = () => qc.invalidateQueries({ queryKey: CART_KEY })

  const ubah = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) => api.ubahKeranjang(id, qty),
    onSuccess: refresh,
    onError: (e) => toast.error(errorMessage(e)),
  })
  const hapus = useMutation({
    mutationFn: (id: string) => api.hapusKeranjang(id),
    onSuccess: refresh,
    onError: (e) => toast.error(errorMessage(e)),
  })

  if (me.isPending) return <PageSpinner />
  if (!me.data) {
    return (
      <EmptyState
        title="Masuk untuk melihat keranjang"
        action={<Link href="/masuk?next=/keranjang" className={buttonVariants()}>Masuk</Link>}
      />
    )
  }
  if (cart.isPending) return <PageSpinner />
  if (cart.error) return <ErrorNotice message={errorMessage(cart.error)} />

  const items = cart.data
  if (items.length === 0) {
    return <EmptyState title="Keranjang masih kosong" action={<Link href="/" className={buttonVariants()}>Mulai belanja</Link>} />
  }
  const adaMasalah = items.some((i) => i.qty > i.stok_tersedia)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <section aria-labelledby="judul-keranjang">
        <h1 id="judul-keranjang" className="font-display mb-4 text-3xl">Keranjang</h1>
        <ul className="flex flex-col gap-3">
          {items.map((i) => (
            <li key={i.id ?? i.produk_id} className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3.5 shadow-[var(--shadow-card)]">
              <div className="min-w-0 flex-1">
                <Link href={`/produk/${i.produk_id}`} className="line-clamp-2 font-medium hover:underline">{i.nama}</Link>
                {i.nama_varian ? <p className="text-sm font-medium">Varian: {i.nama_varian}</p> : null}
                <p className="text-sm text-muted-foreground">{fmtRp(i.harga)}</p>
                {i.preorder ? <p className="text-xs font-semibold text-[var(--brand-orange)]">Pre-order · diproses {i.hari_proses} hari</p> : null}
                {i.qty > i.stok_tersedia ? (
                  <p role="alert" className="text-sm text-[oklch(0.55_0.22_27)]">Stok tersisa {i.stok_tersedia}. Kurangi jumlahnya.</p>
                ) : null}
              </div>
              <div className="inline-flex items-center rounded-lg border">
                <Button variant="ghost" size="icon" aria-label={`Kurangi ${i.nama}`} disabled={i.qty <= 1 || ubah.isPending} onClick={() => ubah.mutate({ id: i.id ?? i.produk_id, qty: i.qty - 1 })}>
                  <Minus className="size-4" />
                </Button>
                <output className="w-8 text-center text-sm font-medium">{i.qty}</output>
                <Button variant="ghost" size="icon" aria-label={`Tambah ${i.nama}`} disabled={i.qty >= i.stok_tersedia || ubah.isPending} onClick={() => ubah.mutate({ id: i.id ?? i.produk_id, qty: i.qty + 1 })}>
                  <Plus className="size-4" />
                </Button>
              </div>
              <p className="w-28 text-right font-semibold">{fmtRp(i.subtotal)}</p>
              <Button variant="ghost" size="icon" aria-label={`Hapus ${i.nama}`} onClick={() => hapus.mutate(i.id ?? i.produk_id)}>
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <aside className="h-fit rounded-lg border bg-card p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
        <h2 className="font-extrabold">Ringkasan belanja</h2>
        <dl className="mt-3 flex justify-between text-sm">
          <dt>Subtotal</dt>
          <dd className="font-semibold">{fmtRp(cartTotal(items))}</dd>
        </dl>
        <p className="mt-2 text-xs text-muted-foreground">Ongkir dihitung setelah layanan pengiriman aktif.</p>
        {adaMasalah ? (
          <Button className="mt-4 w-full" disabled>Perbaiki jumlah dulu</Button>
        ) : (
          <Link href="/checkout" className={buttonVariants({ size: 'lg', className: 'mt-4 w-full rounded-lg font-bold' })}>Checkout</Link>
        )}
      </aside>
    </div>
  )
}
