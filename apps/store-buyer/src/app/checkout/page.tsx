'use client'

import { ApiError, fmtRp, formatAlamat, type Alamat } from '@store/shared'
import { Button, EmptyState, ErrorNotice, Notice, PageSpinner, buttonVariants, cn } from '@store/ui'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { ALAMAT_KEY, AlamatForm } from '@/components/AlamatForm'
import { api, errorMessage } from '@/lib/api'
import { CART_KEY, cartTotal, useCart, useMe } from '@/lib/queries'

export default function CheckoutPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const me = useMe()
  const cart = useCart()
  const alamat = useQuery({ queryKey: ALAMAT_KEY, queryFn: api.listAlamat, enabled: !!me.data })
  const [pilih, setPilih] = useState<string | null>(null)
  const [tambah, setTambah] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (me.isPending) return <PageSpinner />
  if (!me.data) {
    return <EmptyState title="Masuk untuk checkout" action={<Link href="/masuk?next=/checkout" className={buttonVariants()}>Masuk</Link>} />
  }
  if (cart.isPending || alamat.isPending) return <PageSpinner />
  if (cart.error || alamat.error) return <ErrorNotice message={errorMessage(cart.error ?? alamat.error)} />

  const items = cart.data
  if (items.length === 0) return <EmptyState title="Keranjang kosong" action={<Link href="/" className={buttonVariants()}>Mulai belanja</Link>} />

  const daftar = alamat.data
  const aktif: Alamat | undefined = daftar.find((a) => a.id === pilih) ?? daftar.find((a) => a.utama) ?? daftar[0]

  async function pesan(tujuan: Alamat) {
    setBusy(true)
    setError(null)
    let pesananId: string | null = null
    try {
      const pesanan = await api.checkout()
      pesananId = pesanan.id
      void qc.invalidateQueries({ queryKey: CART_KEY })
      await api.isiPengiriman(pesanan.id, {
        // Courier/service/ongkir are decided server-side once shipping (Biteship) is live.
        kurir: 'Menunggu konfirmasi',
        layanan: '-',
        nama_penerima: tujuan.nama_penerima,
        telepon_penerima: tujuan.telepon_penerima,
        alamat_tujuan: tujuan.alamat_lengkap,
        kota_tujuan: tujuan.kota,
        provinsi_tujuan: tujuan.provinsi,
        kode_pos_tujuan: tujuan.kode_pos,
        kecamatan_tujuan: tujuan.kecamatan ?? '',
        kelurahan_tujuan: tujuan.kelurahan ?? '',
        kode_wilayah_tujuan: tujuan.kode_wilayah ?? '',
      })
      const { checkout_url } = await api.bayar(pesanan.id)
      window.location.assign(checkout_url)
    } catch (e) {
      if (pesananId) {
        // The order exists: send the buyer to it instead of leaving them on a stale checkout.
        const paymentUnavailable = e instanceof ApiError && (e.isNotReady || e.isServerError)
        toast[paymentUnavailable ? 'info' : 'error'](
          paymentUnavailable ? 'Pesanan dibuat. Pembayaran online belum bisa dilakukan saat ini.' : errorMessage(e),
        )
        router.replace(`/pesanan/${pesananId}`)
        return
      }
      setError(errorMessage(e))
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <section aria-labelledby="judul-alamat" className="flex flex-col gap-4">
        <h1 id="judul-alamat" className="text-2xl font-extrabold tracking-tight">Checkout</h1>
        {error ? <ErrorNotice message={error} /> : null}
        <h2 className="font-semibold">Alamat pengiriman</h2>

        {daftar.length > 0 ? (
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Pilih alamat</legend>
            {daftar.map((a) => (
              <label key={a.id} className={cn('flex cursor-pointer items-start gap-3 rounded-2xl border bg-card p-3.5', aktif?.id === a.id && 'border-primary bg-primary/10')}>
                <input type="radio" name="alamat" className="mt-1" checked={aktif?.id === a.id} onChange={() => setPilih(a.id)} />
                <span className="text-sm">
                  <span className="block font-medium">{a.label}{a.utama ? ' · utama' : ''}</span>
                  {a.nama_penerima} ({a.telepon_penerima})<br />
                  {formatAlamat({ alamat: a.alamat_lengkap, kelurahan: a.kelurahan, kecamatan: a.kecamatan, kota: a.kota, provinsi: a.provinsi, kodePos: a.kode_pos })}
                </span>
              </label>
            ))}
          </fieldset>
        ) : null}

        {tambah || daftar.length === 0 ? (
          <AlamatForm
            onSaved={(a) => {
              setPilih(a.id)
              setTambah(false)
            }}
            {...(daftar.length > 0 ? { onCancel: () => setTambah(false) } : {})}
          />
        ) : (
          <Button variant="outline" className="self-start" onClick={() => setTambah(true)}>Tambah alamat baru</Button>
        )}
      </section>

      <aside className="h-fit rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
        <h2 className="font-semibold">Pesanan Anda</h2>
        <ul className="mt-3 flex flex-col gap-1 text-sm">
          {items.map((i) => (
            <li key={i.produk_id} className="flex justify-between gap-2">
              <span className="truncate">{i.qty}× {i.nama}</span>
              <span>{fmtRp(i.subtotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 flex justify-between border-t pt-3 font-semibold">
          <dt>Total</dt>
          <dd>{fmtRp(cartTotal(items))}</dd>
        </dl>
        <p className="mt-2 text-xs text-muted-foreground">Ongkir dihitung setelah layanan pengiriman aktif.</p>
        <Button className="mt-4 w-full" size="lg" loading={busy} disabled={!aktif} onClick={() => aktif && void pesan(aktif)}>
          Buat pesanan &amp; bayar
        </Button>
        {!aktif ? <div className="mt-3"><Notice>Tambahkan alamat pengiriman terlebih dulu.</Notice></div> : null}
      </aside>
    </div>
  )
}
