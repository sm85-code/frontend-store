import { LABEL_PESANAN, STATUS_PESANAN_URUT, fmtDate, fmtRp, toDateInput } from '@store/shared'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Spinner from '@/components/Spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api, errorMessage } from '../lib/api'

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return toDateInput(d)
}

/** Axis labels: 2.600.000 -> "2,6 jt" so they never wrap. */
function ringkasRupiah(v: number): string {
  if (v >= 1_000_000) return `${+(v / 1_000_000).toFixed(1)} jt`.replace('.', ',')
  if (v >= 1_000) return `${+(v / 1_000).toFixed(1)} rb`.replace('.', ',')
  return String(v)
}

function ErrorLine({ error }: { error: unknown }) {
  return (
    <p
      className="rounded-lg border px-3 py-2 text-sm"
      style={{ borderColor: 'var(--status-error-border)', background: 'var(--status-error-bg)', color: 'var(--status-error)' }}
    >
      {errorMessage(error)}
    </p>
  )
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

  const hariChart = useMemo(
    () => (penjualan.data?.harian ?? []).map((h) => ({ tanggal: fmtDate(h.tanggal), total: Number(h.total_penjualan) })),
    [penjualan.data],
  )
  const produkChart = useMemo(
    () => (terlaris.data ?? []).map((p) => ({ nama: p.nama_produk, qty: Number(p.total_qty) })),
    [terlaris.data],
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-h1 font-heading text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Ringkasan penjualan toko web.</p>
      </div>

      {ringkasan.error ? <ErrorLine error={ringkasan.error} /> : null}
      <section aria-label="Pesanan per status" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {STATUS_PESANAN_URUT.map((s) => (
          <Card key={s}>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground">{LABEL_PESANAN[s]}</div>
              <div className="text-2xl font-bold">{ringkasan.data?.[s] ?? 0}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Rentang Tanggal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dari">Dari</Label>
              <Input id="dari" type="date" value={dari} max={sampai} onChange={(e) => setDari(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sampai">Sampai</Label>
              <Input id="sampai" type="date" value={sampai} min={dari} onChange={(e) => setSampai(e.target.value)} />
            </div>
          </div>
          {!rangeValid ? <p className="mt-3 text-sm text-destructive">Rentang tanggal tidak valid.</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nilai Pesanan Harian (WIB)</CardTitle>
            {penjualan.data ? <CardDescription>Total {fmtRp(penjualan.data.grand_total)} · Termasuk ongkir dan biaya COD; bukan saldo dana cair.</CardDescription> : null}
          </CardHeader>
          <CardContent>
            {penjualan.isPending && rangeValid ? (
              <Spinner column label="Memuat penjualan…" />
            ) : penjualan.error ? (
              <ErrorLine error={penjualan.error} />
            ) : hariChart.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Belum ada penjualan. Hanya pesanan berstatus dibayar ke atas yang dihitung.
              </p>
            ) : (
              <div className="h-64 w-full" role="img" aria-label="Grafik penjualan harian">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hariChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={ringkasRupiah} width={56} />
                    <Tooltip formatter={(v) => fmtRp(Number(v))} />
                    <Bar dataKey="total" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            {terlaris.error ? (
              <ErrorLine error={terlaris.error} />
            ) : produkChart.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Belum ada penjualan pada periode ini.</p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={produkChart} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="nama" tick={{ fontSize: 11 }} width={110} />
                    <Tooltip />
                    <Bar dataKey="qty" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
