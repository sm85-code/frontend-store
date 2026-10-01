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

export default function PesananPage() {
  const pesanan = useQuery({ queryKey: ['pesanan'], queryFn: api.listPesanan, refetchInterval: 30_000 })
  const [filter, setFilter] = useState<StatusPesanan | 'semua'>('semua')

  const rows = (pesanan.data ?? []).filter((p) => filter === 'semua' || p.status === filter)
  const count = (s: StatusPesanan) => (pesanan.data ?? []).filter((p) => p.status === s).length

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

      <Tabs value={filter} onValueChange={(v) => setFilter(v as StatusPesanan | 'semua')}>
        <TabsList className="tab-strip" aria-label="Filter status">
          <TabsTrigger value="semua">Semua ({pesanan.data?.length ?? 0})</TabsTrigger>
          {STATUS_PESANAN_URUT.map((s) => (
            <TabsTrigger key={s} value={s}>
              {LABEL_PESANAN[s]} ({count(s)})
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
                      <TableCell className="font-mono text-xs">{p.id.slice(0, 8)}</TableCell>
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
    </div>
  )
}
