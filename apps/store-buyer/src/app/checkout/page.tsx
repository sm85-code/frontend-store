'use client'

import { ApiError, fmtRp, formatAlamat, type Alamat, type OpsiOngkir } from '@store/shared'
import { Button, EmptyState, ErrorNotice, Notice, PageSpinner, buttonVariants, cn } from '@store/ui'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { ALAMAT_KEY, AlamatForm } from '@/components/AlamatForm'
import { KurirLogo } from '@/components/KurirLogo'
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
  const [opsiDipilih, setOpsiDipilih] = useState<string | null>(null)

  const daftar = alamat.data ?? []
  const aktif: Alamat | undefined = daftar.find((a) => a.id === pilih) ?? daftar.find((a) => a.utama) ?? daftar[0]
  const kodePos = aktif?.kode_pos ?? ''
  const ongkir = useQuery({
    queryKey: ['ongkir', kodePos, (cart.data ?? []).map((i) => `${i.produk_id}:${i.varian_id ?? ''}:${i.qty}`).join(',')],
    queryFn: () => api.cekOngkir(kodePos),
    enabled: !!me.data && /^\d{5}$/.test(kodePos) && (cart.data ?? []).length > 0,
    retry: false,
    staleTime: 60_000,
  })
  // Shipping (Biteship) not active yet: the backend answers 501 and checkout works as before, without a courier choice.
  const ongkirBelumAktif = ongkir.error instanceof ApiError && ongkir.error.isNotReady
  const opsi: OpsiOngkir[] = ongkir.data ?? []
  const terpilih = opsi.find((o) => `${o.kurir}:${o.layanan}` === opsiDipilih)
  const butuhKurir = !ongkirBelumAktif
  const biayaKirim = terpilih ? Number(terpilih.ongkir) : 0

  if (me.isPending) return <PageSpinner />
  if (!me.data) {
    return <EmptyState title="Masuk untuk checkout" action={<Link href="/masuk?next=/checkout" className={buttonVariants()}>Masuk</Link>} />
  }
  if (cart.isPending || alamat.isPending) return <PageSpinner />
  if (cart.error || alamat.error) return <ErrorNotice message={errorMessage(cart.error ?? alamat.error)} />

  const items = cart.data
  if (items.length === 0) return <EmptyState title="Keranjang kosong" action={<Link href="/" className={buttonVariants()}>Mulai belanja</Link>} />

  async function pesan(tujuan: Alamat) {
    setBusy(true)
    setError(null)
    let pesananId: string | null = null
    try {
      const pesanan = await api.checkout()
      pesananId = pesanan.id
      void qc.invalidateQueries({ queryKey: CART_KEY })
      await api.isiPengiriman(pesanan.id, {
        // The price is never sent: the backend looks it up again for this courier service.
        kurir: terpilih?.kurir ?? 'Menunggu konfirmasi',
        layanan: terpilih?.layanan ?? '-',
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
              <label key={a.id} className={cn('flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3.5', aktif?.id === a.id && 'border-primary bg-primary/10')}>
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

        {aktif ? (
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold">Pengiriman</h2>
            {!/^\d{5}$/.test(kodePos) ? (
              <Notice>Alamat ini belum punya kode pos yang valid. Lengkapi alamat untuk melihat ongkir.</Notice>
            ) : ongkir.isPending && !ongkirBelumAktif ? (
              <p className="text-sm text-muted-foreground">Menghitung ongkir…</p>
            ) : ongkirBelumAktif ? (
              <Notice>Ongkir dihitung setelah layanan pengiriman aktif.</Notice>
            ) : ongkir.error ? (
              <ErrorNotice message={errorMessage(ongkir.error)} />
            ) : (
              <fieldset className="flex flex-col gap-2">
                <legend className="sr-only">Pilih layanan pengiriman</legend>
                {opsi.map((o) => {
                  const id = `${o.kurir}:${o.layanan}`
                  return (
                    <label key={id} className={cn('flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3.5', opsiDipilih === id && 'border-primary bg-primary/10')}>
                      <input type="radio" name="kurir" checked={opsiDipilih === id} onChange={() => setOpsiDipilih(id)} />
                      <span className="flex-1 text-sm">
                        <KurirLogo nama={o.kurir_nama} />
                        <span className="mt-1 block text-muted-foreground">{o.layanan_nama}{o.estimasi ? ` · ${o.estimasi}` : ''}</span>
                      </span>
                      <span className="text-sm font-semibold">{fmtRp(o.ongkir)}</span>
                    </label>
                  )
                })}
              </fieldset>
            )}
          </div>
        ) : null}
      </section>

      <aside className="h-fit rounded-lg border bg-card p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
        <h2 className="font-semibold">Pesanan Anda</h2>
        <ul className="mt-3 flex flex-col gap-1 text-sm">
          {items.map((i) => (
            <li key={i.id ?? i.produk_id} className="flex justify-between gap-2">
              <span className="truncate">{i.qty}× {i.nama}{i.nama_varian ? ` (${i.nama_varian})` : ''}</span>
              <span>{fmtRp(i.subtotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 flex justify-between border-t pt-3 text-sm">
          <dt>Ongkir</dt>
          <dd>{terpilih ? fmtRp(terpilih.ongkir) : '–'}</dd>
        </dl>
        <dl className="mt-1 flex justify-between font-semibold">
          <dt>Total</dt>
          <dd>{fmtRp(Number(cartTotal(items)) + biayaKirim)}</dd>
        </dl>
        <Button className="mt-4 w-full" size="lg" loading={busy} disabled={!aktif || (butuhKurir && !terpilih)} onClick={() => aktif && void pesan(aktif)}>
          Buat pesanan &amp; bayar
        </Button>
        {!aktif ? <div className="mt-3"><Notice>Tambahkan alamat pengiriman terlebih dulu.</Notice></div> : null}
        {aktif && butuhKurir && !terpilih && !ongkir.isPending && !ongkir.error ? <p className="mt-2 text-xs text-muted-foreground">Pilih layanan pengiriman terlebih dulu.</p> : null}
      </aside>
    </div>
  )
}
