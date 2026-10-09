import { LABEL_PESANAN, STATUS_PESANAN_URUT, fmtDateTime, fmtRp, type StatusPesanan } from '@store/shared'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '@/components/Spinner'
import TableShell from '@/components/TableShell'
import { ErrorLine, PageTitle } from '@/components/erp'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusPesananBadge } from '../components/StatusBadge'
import { api, errorMessage } from '../lib/api'

import { Input } from '@/components/ui/input'
import { ListPagination } from '../components/ListPagination'

export default function PesananPage() {
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


  return (
    <div className="space-y-4">
      <PageTitle
        title="Pesanan"
        description="Diperbarui otomatis setiap 30 detik."
        actions={
          <Button variant="outline" onClick={() => void pesanan.refetch()} disabled={pesanan.isFetching}>
            {pesanan.isFetching ? 'Memuat…' : 'Segarkan'}
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Input aria-label="Cari pesanan atau pembeli" placeholder="Nomor pesanan / pembeli" value={cari} onChange={(e) => { setCari(e.target.value); setPage(1) }} />
        <label className="text-xs">Dari (WIB)<Input type="date" value={dari} onChange={(e) => { setDari(e.target.value); setPage(1) }} /></label>
        <label className="text-xs">Sampai (WIB)<Input type="date" value={sampai} onChange={(e) => { setSampai(e.target.value); setPage(1) }} /></label>
        <select aria-label="Urutan pesanan" className="rounded-lg border bg-card px-3" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }}><option value="terbaru">Terbaru</option><option value="terlama">Terlama</option><option value="total">Total tertinggi</option></select>
      </div>
      <Tabs value={filter} onValueChange={(v) => { setFilter(v as StatusPesanan | 'semua'); setPage(1) }}>
        <TabsList className="tab-strip" aria-label="Filter status">
          <TabsTrigger value="semua">Semua</TabsTrigger>
          {STATUS_PESANAN_URUT.map((s) => (
            <TabsTrigger key={s} value={s}>
              {LABEL_PESANAN[s]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Inbox Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          {pesanan.isPending ? (
            <Spinner column label="Memuat pesanan…" />
          ) : pesanan.error ? (
            <ErrorLine message={errorMessage(pesanan.error)} />
          ) : (
            <TableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pesanan</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{fmtDateTime(p.created_at)}</TableCell>
                      <TableCell className="font-mono text-xs">{p.id.slice(0, 8)}<p className="font-sans">{p.nama_pembeli}</p></TableCell>
                      <TableCell>{p.items.reduce((n, i) => n + i.qty, 0)}</TableCell>
                      <TableCell>{fmtRp(p.total)}</TableCell>
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
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        Tidak ada pesanan pada status ini.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableShell>
          )}
        </CardContent>
      </Card>
      <ListPagination page={page} total={pesanan.data?.total ?? 0} onChange={setPage} />
    </div>
  )
}
