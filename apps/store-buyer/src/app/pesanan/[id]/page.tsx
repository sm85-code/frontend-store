'use client'

import { ApiError, fmtDateTime, fmtRp, formatAlamat } from '@store/shared'
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, ErrorNotice, Notice, PageSpinner, buttonVariants } from '@store/ui'
import { useMutation, useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { KurirLogo } from '@/components/KurirLogo'
import { LacakPaket } from '@/components/LacakPaket'
import { PengirimanBadge, StatusBadge } from '@/components/StatusBadge'
import { api, errorMessage } from '@/lib/api'
import { useMe } from '@/lib/queries'

export default function PesananDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const me = useMe()
  const pesanan = useQuery({ queryKey: ['pesanan', id], queryFn: () => api.getPesanan(id), enabled: !!me.data })
  const pengiriman = useQuery({ queryKey: ['pengiriman', id], queryFn: () => api.getPengiriman(id), enabled: !!me.data, retry: false })
  const [belumAktif, setBelumAktif] = useState<string | null>(null)

  const bayar = useMutation({
    mutationFn: () => api.bayar(id),
    onSuccess: ({ checkout_url }) => window.location.assign(checkout_url),
    // Not wired yet (501) or the server/gateway failed (5xx): the order is saved either way, so show a calm notice.
    onError: (e) => (e instanceof ApiError && (e.isNotReady || e.isServerError) ? setBelumAktif(e.message) : toast.error(errorMessage(e))),
  })

  if (me.isPending) return <PageSpinner />
  if (!me.data) return <EmptyState title="Masuk untuk melihat pesanan" action={<Link href={`/masuk?next=/pesanan/${id}`} className={buttonVariants()}>Masuk</Link>} />
  if (pesanan.isPending) return <PageSpinner />
  if (pesanan.error) {
    return pesanan.error instanceof ApiError && pesanan.error.status === 404
      ? <EmptyState title="Pesanan tidak ditemukan" action={<Link href="/pesanan" className={buttonVariants()}>Pesanan saya</Link>} />
      : <ErrorNotice message={errorMessage(pesanan.error)} />
  }
  const p = pesanan.data

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Pesanan #{p.id.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">{fmtDateTime(p.created_at)}</p>
        </div>
        <StatusBadge status={p.status} />
      </div>

      {p.status === 'menunggu_pembayaran' ? (
        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <p className="text-sm">Selesaikan pembayaran agar pesanan Anda diproses.</p>
            {belumAktif ? <Notice tone="warning">{belumAktif} Pesanan Anda tersimpan dan tidak hilang.</Notice> : null}
            <Button className="self-start" loading={bayar.isPending} onClick={() => bayar.mutate()}>Bayar sekarang</Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader><CardTitle>Rincian</CardTitle></CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-1 text-sm">
            {p.items.map((i) => (
              <li key={`${i.produk_id}-${i.varian_id ?? ''}`} className="flex justify-between gap-2">
                <span>
                  {i.qty}× {i.nama_produk}{i.nama_varian ? ` (${i.nama_varian})` : ''}
                  {i.preorder ? <span className="block text-xs text-muted-foreground">Pre-order · diproses {i.hari_proses} hari</span> : null}
                </span>
                <span>{fmtRp(i.subtotal)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t pt-3 font-semibold"><span>Total</span><span>{fmtRp(p.total)}</span></p>
        </CardContent>
      </Card>

      {pengiriman.data ? (
        <Card>
          <CardHeader><CardTitle>Pengiriman</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {pengiriman.data.kurir ? (
              <div className="flex flex-wrap items-center gap-3">
                <KurirLogo nama={pengiriman.data.kurir} />
                {pengiriman.data.layanan_nama || pengiriman.data.layanan ? <span className="text-muted-foreground">{pengiriman.data.layanan_nama || pengiriman.data.layanan}{Number(pengiriman.data.ongkir) > 0 ? ` · ongkir ${fmtRp(pengiriman.data.ongkir)}` : ''}</span> : null}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <PengirimanBadge status={pengiriman.data.status} />
              {pengiriman.data.tracking_id ? <span className="font-mono">Resi: {pengiriman.data.tracking_id}</span> : null}
            </div>
            <p><strong>{pengiriman.data.nama_penerima}</strong> ({pengiriman.data.telepon_penerima})<br />{formatAlamat({ alamat: pengiriman.data.alamat_tujuan, kelurahan: pengiriman.data.kelurahan_tujuan, kecamatan: pengiriman.data.kecamatan_tujuan, kota: pengiriman.data.kota_tujuan, provinsi: pengiriman.data.provinsi_tujuan, kodePos: pengiriman.data.kode_pos_tujuan })}</p>
            {pengiriman.data.biteship ? <LacakPaket pesananId={id} /> : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
