'use client'

import { ApiError, fmtRp, type Produk } from '@store/shared'
import { Button } from '@store/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, Minus, PackageCheck, Plus, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Galeri } from '@/components/Galeri'
import { hargaLabel } from '@/components/ProductCard'
import { api, errorMessage } from '@/lib/api'
import { CART_KEY } from '@/lib/queries'

function useAddToCart(produkId: string, varianId: string | null) {
  const router = useRouter()
  const pathname = usePathname()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (qty: number) => api.tambahKeranjang(produkId, qty, varianId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CART_KEY })
      toast.success('Ditambahkan ke keranjang')
    },
    onError: (e) => {
      if (e instanceof ApiError && e.isUnauthorized) {
        router.push(`/masuk?next=${encodeURIComponent(pathname)}`)
        return
      }
      toast.error(errorMessage(e))
    },
  })
}

/** Gallery, price, variant picker, processing time and the add-to-cart actions: they share one selected variant. */
export function ProdukDetail({ produk, children }: { produk: Produk; children?: ReactNode }) {
  const varian = (produk.varian ?? []).filter((v) => v.aktif)
  const punyaVarian = varian.length > 0
  const [varianId, setVarianId] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const dipilih = varian.find((v) => v.id === varianId) ?? null
  const add = useAddToCart(produk.id, varianId)

  const stok = dipilih ? dipilih.stok : produk.stok
  const harga = dipilih ? fmtRp(dipilih.harga) : hargaLabel(produk)
  const perluPilih = punyaVarian && !dipilih
  const habis = punyaVarian ? varian.every((v) => v.stok <= 0) : produk.stok <= 0
  const hari = produk.hari_proses ?? 2
  const berat = dipilih ? dipilih.berat_gram : (produk.berat_gram ?? 0)
  const foto = produk.foto?.length ? produk.foto : produk.foto_url ? [{ id: null, url: produk.foto_url }] : []

  function klikTambah(jumlah: number) {
    if (perluPilih) return void toast.info('Pilih varian terlebih dahulu')
    add.mutate(jumlah)
  }
  const tombol = habis ? 'Stok habis' : perluPilih ? 'Pilih varian' : dipilih && stok <= 0 ? 'Varian habis' : 'Tambah ke keranjang'
  const nonaktif = habis || (dipilih !== null && stok <= 0)

  return (
    <article className="grid gap-6 md:grid-cols-2 md:gap-10 md:pb-0">
      <div className="md:sticky md:top-24 md:self-start">
        <Galeri foto={foto} nama={produk.nama} pilihId={dipilih?.foto_id} />
      </div>

      <div className="flex flex-col gap-5">
        <nav aria-label="Navigasi" className="text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">Beranda</Link>
          {produk.kategori_nama ? (
            <>
              {' / '}
              <Link href={`/?kategori=${produk.kategori_id}`} className="hover:underline">{produk.kategori_nama}</Link>
            </>
          ) : null}
        </nav>

        <div>
          <h1 className="font-display text-[1.75rem] leading-tight sm:text-4xl">{produk.nama}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">{harga}</p>
            {habis ? (
              <span className="rounded bg-foreground px-2.5 py-1 text-xs font-bold text-background">Stok habis</span>
            ) : !perluPilih && stok > 0 && stok <= 5 ? (
              <span className="rounded bg-[oklch(0.58_0.22_27)] px-2.5 py-1 text-xs font-bold text-white">Tinggal {stok}</span>
            ) : !perluPilih ? (
              <span className="rounded bg-[oklch(0.68_0.18_150)]/20 px-2.5 py-1 text-xs font-bold text-[oklch(0.42_0.14_150)] dark:text-[oklch(0.8_0.15_150)]">Stok {stok}</span>
            ) : null}
          </div>
        </div>

        {produk.cod ? (
          <p className="inline-flex items-center gap-2 self-start rounded-md bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
            Bisa COD · bayar di tempat
          </p>
        ) : null}

        <div
          className={`flex items-start gap-3 rounded-lg border p-3.5 text-sm ${produk.preorder ? 'border-[var(--brand-orange)] bg-[var(--brand-soft)]' : 'bg-card'}`}
        >
          {produk.preorder ? <Clock className="mt-0.5 size-5 shrink-0 text-[var(--brand-orange)]" aria-hidden /> : <PackageCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />}
          <p>
            <span className="font-bold">{produk.preorder ? `Pre-order · diproses ${hari} hari` : 'Ready stock · diproses 2 hari'}</span>
            <span className="block text-muted-foreground">
              {produk.preorder ? 'Barang dibuat atau dipesan setelah Anda membayar, lalu dikirim setelah proses selesai.' : 'Barang tersedia dan dikirim dalam 2 hari setelah pembayaran.'}
            </span>
          </p>
        </div>

        {punyaVarian ? (
          <fieldset>
            <legend className="mb-2 text-sm font-bold">
              Pilih varian{dipilih ? <span className="font-medium text-muted-foreground"> · {dipilih.nama}</span> : null}
            </legend>
            <div className="flex flex-wrap gap-2">
              {varian.map((v) => {
                const on = v.id === varianId
                const kosong = v.stok <= 0
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={kosong}
                    aria-pressed={on}
                    onClick={() => {
                      setVarianId(v.id)
                      setQty(1)
                    }}
                    className={`rounded-md border px-3.5 py-2 text-sm font-semibold transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 disabled:line-through ${
                      on ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:border-primary'
                    }`}
                  >
                    {v.nama}
                  </button>
                )
              })}
            </div>
          </fieldset>
        ) : null}

        <div className="hidden flex-wrap items-center gap-3 md:flex">
          <div className="inline-flex items-center rounded-lg border bg-card">
            <Button variant="ghost" size="icon" aria-label="Kurangi" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>
              <Minus className="size-4" />
            </Button>
            <output aria-live="polite" className="w-9 text-center text-sm font-bold">{qty}</output>
            <Button variant="ghost" size="icon" aria-label="Tambah" disabled={perluPilih || qty >= stok} onClick={() => setQty((q) => Math.min(stok, q + 1))}>
              <Plus className="size-4" />
            </Button>
          </div>
          <Button size="lg" className="rounded-lg px-7 font-bold" disabled={nonaktif} loading={add.isPending} onClick={() => klikTambah(qty)}>
            <ShoppingCart className="size-5" /> {tombol}
          </Button>
        </div>

        {berat > 0 ? <p className="text-xs text-muted-foreground">Berat kemasan {berat} gram</p> : null}

        {children}
      </div>

      {/* Phones: price and the main action stay within reach above the tab bar. */}
      <div className="purchase-bar fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t px-4 py-3 md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0">
            <p className="text-[0.7rem] font-medium text-muted-foreground">Harga</p>
            <p className="truncate text-base font-extrabold leading-tight">{harga}</p>
          </div>
          <Button className="ml-auto h-11 flex-1 rounded-lg font-bold" disabled={nonaktif} loading={add.isPending} onClick={() => klikTambah(1)}>
            <ShoppingCart className="size-5" /> {habis ? 'Stok habis' : perluPilih ? 'Pilih varian' : 'Tambah'}
          </Button>
        </div>
      </div>
    </article>
  )
}
