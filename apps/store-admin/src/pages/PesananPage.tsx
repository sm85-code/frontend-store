import { BulkActions, useBulkSelection } from '@/components/BulkActions'
import { SlidersHorizontal, RefreshCw } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LABEL_PESANAN, STATUS_PESANAN_URUT, fmtDateTime, fmtRp, type StatusPesanan } from '@store/shared'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '@/components/Spinner'
import TableShell from '@/components/TableShell'
import { ErrorLine, PageTitle } from '@/components/erp'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusPesananBadge } from '../components/StatusBadge'
import { api, errorMessage } from '../lib/api'

import { Input } from '@/components/ui/input'
import { ListPagination } from '../components/ListPagination'

export default function PesananPage() {
  const qc = useQueryClient()
  const [filterOpen, setFilterOpen] = useState(false)
  const [filter, setFilter] = useState<StatusPesanan | 'semua'>('semua')
  const [cari, setCari] = useState('')
  const [page, setPage] = useState(1)
  const [dari, setDari] = useState('')
  const [sampai, setSampai] = useState('')
  const [sort, setSort] = useState('terbaru')
  const pesanan = useQuery({ queryKey: ['pesanan', page, filter, cari, dari, sampai, sort],
    queryFn: () => api.daftarPesanan({ halaman: page, cari, status_filter: filter === 'semua' ? undefined : filter,
      dari: dari || undefined, sampai: sampai || undefined, urutan: sort }), refetchInterval: 30_000 })
  const rows = pesanan.data?.items ?? []
  const bulk = useBulkSelection(`${page}:${cari}:${filter}:${dari}:${sampai}:${sort}`, rows.map((p) => p.id))


  return (
    <div className="space-y-4">
      <PageTitle
        title="Pesanan"

        actions={
          <Button variant="outline" size="sm" aria-label="Refresh pesanan" onClick={() => void pesanan.refetch()} disabled={pesanan.isFetching}>
            <RefreshCw className={`size-4 ${pesanan.isFetching ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">Refresh</span>
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <Input className="min-w-0 flex-1" aria-label="Cari pesanan atau pembeli" placeholder="Cari pesanan / pembeli…" value={cari} onChange={(e) => { setCari(e.target.value); setPage(1) }} />
        <Button variant="outline" aria-label="Filter pesanan" onClick={() => setFilterOpen(true)}><SlidersHorizontal className="size-4" /><span>Filter{filter !== 'semua' || dari || sampai || sort !== 'terbaru' ? ' · aktif' : ''}</span></Button>
      </div>
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>Filter pesanan</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <label className="block space-y-1.5 text-sm"><span>Status</span><select aria-label="Filter status" className="h-10 w-full rounded-lg border bg-card px-3 text-sm" value={filter} onChange={(e) => { setFilter(e.target.value as StatusPesanan | 'semua'); setPage(1) }}><option value="semua">Semua status</option>{STATUS_PESANAN_URUT.map((s) => <option key={s} value={s}>{LABEL_PESANAN[s]}</option>)}</select></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="min-w-0 space-y-1.5 text-sm"><span>Dari (WIB)</span><Input type="date" value={dari} max={sampai || undefined} onChange={(e) => { setDari(e.target.value); setPage(1) }} /></label>
              <label className="min-w-0 space-y-1.5 text-sm"><span>Sampai (WIB)</span><Input type="date" value={sampai} min={dari || undefined} onChange={(e) => { setSampai(e.target.value); setPage(1) }} /></label>
            </div>
            <label className="block space-y-1.5 text-sm"><span>Urutan</span><select aria-label="Urutan pesanan" className="h-10 w-full rounded-lg border bg-card px-3 text-sm" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }}><option value="terbaru">Terbaru</option><option value="terlama">Terlama</option><option value="total">Total tertinggi</option></select></label>
            <div className="flex justify-between gap-3 border-t pt-4"><Button variant="outline" onClick={() => { setFilter('semua'); setDari(''); setSampai(''); setSort('terbaru'); setPage(1) }}>Reset</Button><Button onClick={() => setFilterOpen(false)}>Selesai</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <BulkActions ids={rows.map((p) => p.id)} selected={bulk.selected} setSelected={bulk.setSelected} actions={[{ label: 'Batalkan pesanan', destructive: true, run: (id) => api.ubahStatusPesanan(id, 'dibatalkan') }]} onComplete={() => { for (const key of ['pesanan', 'produk', 'laporan']) void qc.invalidateQueries({ queryKey: [key] }) }} />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          {pesanan.isPending ? (
            <Spinner column label="Memuat pesanan…" />
          ) : pesanan.error ? (
            <ErrorLine message={errorMessage(pesanan.error)} />
          ) : (
            <>
            <ul className="space-y-3 lg:hidden" aria-label="Daftar pesanan">
              {rows.map((p) => (
                <li key={p.id} className="space-y-3 rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-3"><input type="checkbox" className="mt-1 shrink-0" aria-label={`Pilih pesanan ${p.id.slice(0, 8)}`} checked={bulk.selected.includes(p.id)} onChange={() => bulk.toggle(p.id)} />
                    <div className="min-w-0"><p className="font-semibold break-words">{p.nama_pembeli ?? 'Pembeli'}</p><p className="text-xs text-muted-foreground">#{p.id.slice(0, 8)}</p></div>
                    <StatusPesananBadge status={p.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">{fmtDateTime(p.created_at)}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3"><span className="whitespace-nowrap font-semibold tabular-nums">{fmtRp(p.total)}</span><span className="text-sm text-muted-foreground">{p.items.reduce((n, i) => n + i.qty, 0)} item</span></div>
                  <Button asChild size="sm" variant="outline" className="w-full"><Link to={`/pesanan/${p.id}`}>Lihat detail</Link></Button>
                </li>
              ))}
              {!rows.length ? <li className="py-8 text-center text-sm text-muted-foreground">{filter === 'semua' && !cari && !dari && !sampai ? 'Belum ada pesanan.' : 'Tidak ada pesanan yang cocok dengan filter.'}</li> : null}
            </ul>
            <div className="hidden lg:block">
            <TableShell minWidth={800}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><span className="sr-only">Pilih</span></TableHead><TableHead>Tanggal</TableHead>
                    <TableHead>Pesanan</TableHead>
                    <TableHead className="text-right">Item</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p) => (
                    <TableRow key={p.id}><TableCell><input type="checkbox" aria-label={`Pilih ${p.id.slice(0, 8)}`} checked={bulk.selected.includes(p.id)} onChange={() => bulk.toggle(p.id)} /></TableCell>
                      <TableCell>{fmtDateTime(p.created_at)}</TableCell>
                      <TableCell className="font-mono text-xs">{p.id.slice(0, 8)}<p className="font-sans">{p.nama_pembeli}</p></TableCell>
                      <TableCell className="text-right tabular-nums">{p.items.reduce((n, i) => n + i.qty, 0)}</TableCell>
                      <TableCell className="whitespace-nowrap text-right tabular-nums">{fmtRp(p.total)}</TableCell>
                      <TableCell>
                        <StatusPesananBadge status={p.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/pesanan/${p.id}`}>Detail</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        Tidak ada pesanan pada status ini.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableShell>
            </div>
            </>
          )}
        </CardContent>
      </Card>
      <ListPagination page={page} total={pesanan.data?.total ?? 0} onChange={setPage} />
    </div>
  )
}
