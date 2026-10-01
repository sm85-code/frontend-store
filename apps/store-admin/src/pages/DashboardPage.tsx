import { LABEL_PESANAN, STATUS_PESANAN_URUT, fmtDate, fmtRp, toDateInput } from '@store/shared'
import { Card, CardContent, CardHeader, CardTitle, EmptyState, ErrorNotice, Field, Input, PageSpinner, Table, Td, Th } from '@store/ui'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { api, errorMessage } from '../lib/api'

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return toDateInput(d)
}

export default function DashboardPage() {
  const [dari, setDari] = useState(daysAgo(29))
  const [sampai, setSampai] = useState(toDateInput(new Date()))
  const rangeValid = dari !== '' && sampai !== '' && dari <= sampai

  const ringkasan = useQuery({ queryKey: ['laporan', 'ringkasan'], queryFn: api.laporanRingkasanStatus })
  const penjualan = useQuery({
    queryKey: ['laporan', 'penjualan', dari, sampai],
    queryFn: () => api.laporanPenjualan({ dari, sampai }),
    enabled: rangeValid,
  })
  const terlaris = useQuery({
    queryKey: ['laporan', 'terlaris', dari, sampai],
    queryFn: () => api.laporanProdukTerlaris({ dari, sampai, limit: 5 }),
    enabled: rangeValid,
  })

  const max = Math.max(1, ...(penjualan.data?.harian.map((h) => Number(h.total_penjualan)) ?? [0]))

  return (
    <>
      <PageHeader title="Dashboard" description="Ringkasan penjualan toko web." />

      <section aria-label="Pesanan per status" className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STATUS_PESANAN_URUT.map((s) => (
          <Card key={s}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{LABEL_PESANAN[s]}</p>
              <p className="mt-1 text-2xl font-bold">{ringkasan.data?.[s] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      {ringkasan.error ? <ErrorNotice message={errorMessage(ringkasan.error)} /> : null}

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Field label="Dari" htmlFor="dari">
          <Input id="dari" type="date" value={dari} max={sampai} onChange={(e) => setDari(e.target.value)} />
        </Field>
        <Field label="Sampai" htmlFor="sampai">
          <Input id="sampai" type="date" value={sampai} min={dari} onChange={(e) => setSampai(e.target.value)} />
        </Field>
      </div>
      {!rangeValid ? <ErrorNotice message="Rentang tanggal tidak valid." /> : null}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Penjualan harian</CardTitle>
            {penjualan.data ? (
              <p className="text-2xl font-bold">{fmtRp(penjualan.data.grand_total)}</p>
            ) : null}
          </CardHeader>
          <CardContent>
            {penjualan.isPending && rangeValid ? (
              <PageSpinner />
            ) : penjualan.error ? (
              <ErrorNotice message={errorMessage(penjualan.error)} />
            ) : !penjualan.data || penjualan.data.harian.length === 0 ? (
              <EmptyState title="Belum ada penjualan" description="Hanya pesanan berstatus dibayar ke atas yang dihitung." />
            ) : (
              <ul className="flex h-48 items-end gap-1" aria-label="Grafik penjualan harian">
                {penjualan.data.harian.map((h) => (
                  <li key={h.tanggal} className="group relative flex h-full min-w-2 flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-primary"
                      style={{ height: `${Math.max(4, (Number(h.total_penjualan) / max) * 100)}%` }}
                      role="img"
                      aria-label={`${fmtDate(h.tanggal)}: ${fmtRp(h.total_penjualan)}, ${h.jumlah_pesanan} pesanan`}
                      title={`${fmtDate(h.tanggal)} · ${fmtRp(h.total_penjualan)} · ${h.jumlah_pesanan} pesanan`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produk terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            {terlaris.error ? (
              <ErrorNotice message={errorMessage(terlaris.error)} />
            ) : !terlaris.data || terlaris.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada data.</p>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Produk</Th>
                    <Th className="text-right">Qty</Th>
                  </tr>
                </thead>
                <tbody>
                  {terlaris.data.map((p) => (
                    <tr key={p.produk_id}>
                      <Td>{p.nama_produk}</Td>
                      <Td className="text-right">{p.total_qty}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
