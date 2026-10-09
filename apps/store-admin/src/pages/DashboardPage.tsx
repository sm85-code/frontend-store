import { LABEL_PESANAN, STATUS_PESANAN_URUT, fmtDate, fmtRp, toDateInput } from '@store/shared'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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

      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(['menunggu_konfirmasi', 'dibayar', 'diproses', 'dikirim'] as const).map((status) => (
          <Card key={status}><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{LABEL_PESANAN[status]}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{ringkasan.isPending || ringkasan.error ? '—' : ringkasan.data?.[status] ?? 0}</p>
          </CardContent></Card>
        ))}
      </div>
      {ringkasan.error ? <div className="space-y-2"><ErrorLine error={ringkasan.error} /><Button variant="outline" size="sm" onClick={() => void ringkasan.refetch()}>Coba lagi</Button></div> : null}
      <details className="rounded-xl border bg-card">
        <summary className="cursor-pointer p-3 text-sm font-medium">Semua status pesanan</summary>
        <div className="grid grid-cols-2 gap-3 border-t p-3 sm:grid-cols-3">
          {STATUS_PESANAN_URUT.map((status) => <div key={status} className="flex justify-between gap-2 text-sm"><span className="text-muted-foreground">{LABEL_PESANAN[status]}</span><strong>{ringkasan.isPending || ringkasan.error ? '—' : ringkasan.data?.[status] ?? 0}</strong></div>)}
        </div>
      </details>
      <Button asChild variant="outline"><Link to="/pesanan">Lihat pesanan</Link></Button>
      <Card>
        <CardHeader className="p-4"><CardTitle>Periode penjualan</CardTitle></CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0 space-y-1.5"><Label htmlFor="dari">Dari</Label><Input className="min-w-0 w-full" id="dari" type="date" value={dari} max={sampai} onChange={(e) => setDari(e.target.value)} /></div>
            <div className="min-w-0 space-y-1.5"><Label htmlFor="sampai">Sampai</Label><Input className="min-w-0 w-full" id="sampai" type="date" value={sampai} min={dari} onChange={(e) => setSampai(e.target.value)} /></div>
          </div>
          {!rangeValid ? <p className="mt-3 text-sm text-destructive">Rentang tanggal tidak valid.</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nilai Pesanan Harian (WIB)</CardTitle>
            {penjualan.data ? <CardDescription>Total {fmtRp(penjualan.data.grand_total)}</CardDescription> : null}
          </CardHeader>
          <CardContent>
            {penjualan.isPending && rangeValid ? (
              <Spinner column label="Memuat penjualan…" />
            ) : penjualan.error ? (
              <div className="space-y-3"><ErrorLine error={penjualan.error} /><Button variant="outline" size="sm" onClick={() => void penjualan.refetch()}>Coba lagi</Button></div>
            ) : hariChart.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Belum ada penjualan.
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
            {terlaris.isPending && rangeValid ? (
              <Spinner column label="Memuat produk terlaris…" />
            ) : terlaris.error ? (
              <div className="space-y-3"><ErrorLine error={terlaris.error} /><Button variant="outline" size="sm" onClick={() => void terlaris.refetch()}>Coba lagi</Button></div>
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
