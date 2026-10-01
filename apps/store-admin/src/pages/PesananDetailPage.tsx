import { zodResolver } from '@hookform/resolvers/zod'
import {
  LABEL_PESANAN,
  TRANSISI_PENGIRIMAN,
  TRANSISI_PESANAN,
  LABEL_PENGIRIMAN,
  ApiError,
  fmtDateTime,
  fmtRp,
  type Pengiriman,
  type Pesanan,
  type StatusPengiriman,
  type StatusPesanan,
} from '@store/shared'
import { Button, Card, CardContent, CardHeader, CardTitle, ErrorNotice, Field, Input, PageSpinner, Table, Td, Textarea, Th } from '@store/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PageHeader } from '../components/PageHeader'
import { StatusPengirimanBadge, StatusPesananBadge } from '../components/StatusBadge'
import { api, errorMessage } from '../lib/api'

const pengirimanSchema = z.object({
  kurir: z.string().trim().min(1, 'Kurir wajib diisi'),
  layanan: z.string().trim().min(1, 'Layanan wajib diisi'),
  ongkir: z.string().refine((v) => v === '' || Number(v) >= 0, 'Ongkir tidak valid'),
  nama_penerima: z.string().trim().min(1, 'Nama penerima wajib diisi'),
  telepon_penerima: z.string().regex(/^\+?[0-9][0-9\-\s]{7,19}$/, 'Nomor telepon tidak valid (8-20 digit)'),
  alamat_tujuan: z.string().trim().min(1, 'Alamat wajib diisi'),
  kota_tujuan: z.string(),
  provinsi_tujuan: z.string(),
  kode_pos_tujuan: z.string().regex(/^([0-9]{5})?$/, 'Kode pos harus 5 digit'),
})
type PengirimanValues = z.infer<typeof pengirimanSchema>

function PengirimanForm({ pesananId }: { pesananId: string }) {
  const qc = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PengirimanValues>({
    resolver: zodResolver(pengirimanSchema),
    defaultValues: { kurir: '', layanan: '', ongkir: '0', nama_penerima: '', telepon_penerima: '', alamat_tujuan: '', kota_tujuan: '', provinsi_tujuan: '', kode_pos_tujuan: '' },
  })
  const simpan = useMutation({
    mutationFn: (v: PengirimanValues) => api.buatPengiriman(pesananId, { ...v, ongkir: v.ongkir || '0' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['pengiriman', pesananId] })
      toast.success('Data pengiriman disimpan')
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  return (
    <form className="grid gap-3 sm:grid-cols-2" noValidate onSubmit={handleSubmit((v) => simpan.mutate(v))}>
      <Field label="Kurir" htmlFor="kurir" error={errors.kurir?.message}>
        <Input id="kurir" {...register('kurir')} />
      </Field>
      <Field label="Layanan" htmlFor="layanan" error={errors.layanan?.message}>
        <Input id="layanan" {...register('layanan')} />
      </Field>
      <Field label="Ongkir (Rp)" htmlFor="ongkir" error={errors.ongkir?.message}>
        <Input id="ongkir" inputMode="decimal" {...register('ongkir')} />
      </Field>
      <Field label="Nama penerima" htmlFor="penerima" error={errors.nama_penerima?.message}>
        <Input id="penerima" {...register('nama_penerima')} />
      </Field>
      <Field label="Telepon penerima" htmlFor="telepon" error={errors.telepon_penerima?.message}>
        <Input id="telepon" type="tel" {...register('telepon_penerima')} />
      </Field>
      <Field label="Kode pos" htmlFor="kodepos" error={errors.kode_pos_tujuan?.message}>
        <Input id="kodepos" inputMode="numeric" {...register('kode_pos_tujuan')} />
      </Field>
      <Field label="Kota" htmlFor="kota">
        <Input id="kota" {...register('kota_tujuan')} />
      </Field>
      <Field label="Provinsi" htmlFor="provinsi">
        <Input id="provinsi" {...register('provinsi_tujuan')} />
      </Field>
      <Field label="Alamat lengkap" htmlFor="alamat" error={errors.alamat_tujuan?.message} className="sm:col-span-2">
        <Textarea id="alamat" {...register('alamat_tujuan')} />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" loading={simpan.isPending}>
          Simpan pengiriman
        </Button>
      </div>
    </form>
  )
}

function PengirimanPanel({ pesanan }: { pesanan: Pesanan }) {
  const qc = useQueryClient()
  const [tracking, setTracking] = useState('')
  const pengiriman = useQuery({
    queryKey: ['pengiriman', pesanan.id],
    queryFn: () => api.getPengiriman(pesanan.id),
    // 404 = no shipment recorded yet; that is a normal state, not an error to retry.
    retry: false,
  })
  const ubah = useMutation({
    mutationFn: (status: StatusPengiriman) => api.ubahStatusPengiriman(pesanan.id, status, tracking.trim() || undefined),
    onSuccess: () => {
      setTracking('')
      void qc.invalidateQueries({ queryKey: ['pengiriman', pesanan.id] })
      void qc.invalidateQueries({ queryKey: ['pesanan'] })
      toast.success('Status pengiriman diperbarui')
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  if (pengiriman.isPending) return <PageSpinner />
  const missing = pengiriman.error instanceof ApiError && pengiriman.error.status === 404
  if (pengiriman.error && !missing) return <ErrorNotice message={errorMessage(pengiriman.error)} />
  if (missing || !pengiriman.data) {
    return pesanan.status === 'dibatalkan' ? (
      <p className="text-sm text-muted-foreground">Pesanan dibatalkan, tidak ada pengiriman.</p>
    ) : (
      <PengirimanForm pesananId={pesanan.id} />
    )
  }

  const p: Pengiriman = pengiriman.data
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPengirimanBadge status={p.status} />
        <span>
          {p.kurir} · {p.layanan} · ongkir {fmtRp(p.ongkir)}
        </span>
        {p.tracking_id ? <span className="font-mono">Resi: {p.tracking_id}</span> : null}
      </div>
      <p>
        <strong>{p.nama_penerima}</strong> ({p.telepon_penerima})
        <br />
        {p.alamat_tujuan}
      </p>
      {TRANSISI_PENGIRIMAN[p.status].length > 0 ? (
        <div className="flex flex-wrap items-end gap-2">
          <Field label="Nomor resi (opsional)" htmlFor="resi">
            <Input id="resi" value={tracking} onChange={(e) => setTracking(e.target.value)} />
          </Field>
          {TRANSISI_PENGIRIMAN[p.status].map((s) => (
            <Button key={s} variant={s === 'bermasalah' ? 'outline' : 'primary'} loading={ubah.isPending} onClick={() => ubah.mutate(s)}>
              Tandai: {LABEL_PENGIRIMAN[s]}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default function PesananDetailPage() {
  const { id = '' } = useParams()
  const qc = useQueryClient()
  const pesanan = useQuery({ queryKey: ['pesanan', id], queryFn: () => api.getPesanan(id) })
  const [batal, setBatal] = useState(false)

  const ubah = useMutation({
    mutationFn: (status: StatusPesanan) => api.ubahStatusPesanan(id, status),
    onSuccess: () => {
      setBatal(false)
      void qc.invalidateQueries({ queryKey: ['pesanan'] })
      void qc.invalidateQueries({ queryKey: ['laporan'] })
      void qc.invalidateQueries({ queryKey: ['produk'] })
      toast.success('Status pesanan diperbarui')
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  if (pesanan.isPending) return <PageSpinner />
  if (pesanan.error) return <ErrorNotice message={errorMessage(pesanan.error)} />
  const p = pesanan.data
  const next = TRANSISI_PESANAN[p.status]

  return (
    <>
      <Link to="/pesanan" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="size-4" /> Semua pesanan
      </Link>
      <PageHeader
        title={`Pesanan ${p.id.slice(0, 8)}`}
        description={fmtDateTime(p.created_at)}
        actions={<StatusPesananBadge status={p.status} />}
      />

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Item</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr>
                  <Th>Produk</Th>
                  <Th className="text-right">Harga</Th>
                  <Th className="text-right">Qty</Th>
                  <Th className="text-right">Subtotal</Th>
                </tr>
              </thead>
              <tbody>
                {p.items.map((i) => (
                  <tr key={`${i.produk_id}`}>
                    <Td>{i.nama_produk}</Td>
                    <Td className="text-right">{fmtRp(i.harga_satuan)}</Td>
                    <Td className="text-right">{i.qty}</Td>
                    <Td className="text-right">{fmtRp(i.subtotal)}</Td>
                  </tr>
                ))}
                <tr>
                  <Td colSpan={3} className="text-right font-semibold">
                    Total
                  </Td>
                  <Td className="text-right font-semibold">{fmtRp(p.total)}</Td>
                </tr>
              </tbody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status pesanan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {next.length === 0 ? (
              <p className="text-sm text-muted-foreground">Status akhir, tidak bisa diubah lagi.</p>
            ) : (
              next.map((s) =>
                s === 'dibatalkan' ? (
                  <Button key={s} variant="danger" onClick={() => setBatal(true)}>
                    Batalkan pesanan
                  </Button>
                ) : (
                  <Button key={s} loading={ubah.isPending} onClick={() => ubah.mutate(s)}>
                    Tandai: {LABEL_PESANAN[s]}
                  </Button>
                ),
              )
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengiriman</CardTitle>
          </CardHeader>
          <CardContent>
            <PengirimanPanel pesanan={p} />
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={batal}
        title="Batalkan pesanan?"
        message="Stok produk pada pesanan ini akan dikembalikan. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Ya, batalkan"
        loading={ubah.isPending}
        onClose={() => setBatal(false)}
        onConfirm={() => ubah.mutate('dibatalkan')}
      />
    </>
  )
}
