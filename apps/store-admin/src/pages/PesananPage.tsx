import { LABEL_PESANAN, STATUS_PESANAN_URUT, fmtDateTime, fmtRp, type StatusPesanan } from '@store/shared'
import { Button, EmptyState, ErrorNotice, Table, Td, Th, cn } from '@store/ui'
import { PageSpinner } from '../components/Spinner'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StatusPesananBadge } from '../components/StatusBadge'
import { api, errorMessage } from '../lib/api'

export default function PesananPage() {
  const pesanan = useQuery({ queryKey: ['pesanan'], queryFn: api.listPesanan, refetchInterval: 30_000 })
  const [filter, setFilter] = useState<StatusPesanan | 'semua'>('semua')

  const rows = (pesanan.data ?? []).filter((p) => filter === 'semua' || p.status === filter)
  const count = (s: StatusPesanan) => (pesanan.data ?? []).filter((p) => p.status === s).length

  return (
    <>
      <PageHeader
        title="Pesanan"
        description="Diperbarui otomatis setiap 30 detik."
        actions={
          <Button variant="outline" size="sm" onClick={() => void pesanan.refetch()} loading={pesanan.isFetching}>
            Segarkan
          </Button>
        }
      />
      <div role="tablist" aria-label="Filter status" className="mb-4 flex flex-wrap gap-2">
        {(['semua', ...STATUS_PESANAN_URUT] as const).map((s) => (
          <button
            key={s}
            role="tab"
            type="button"
            aria-selected={filter === s}
            onClick={() => setFilter(s)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted',
              filter === s && 'border-primary bg-primary/20 font-medium',
            )}
          >
            {s === 'semua' ? `Semua (${pesanan.data?.length ?? 0})` : `${LABEL_PESANAN[s]} (${count(s)})`}
          </button>
        ))}
      </div>

      {pesanan.isPending ? (
        <PageSpinner />
      ) : pesanan.error ? (
        <ErrorNotice message={errorMessage(pesanan.error)} />
      ) : rows.length === 0 ? (
        <EmptyState title="Tidak ada pesanan" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Pesanan</Th>
              <Th>Tanggal</Th>
              <Th>Item</Th>
              <Th className="text-right">Total</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <Td>
                  <Link to={`/pesanan/${p.id}`} className="font-mono text-xs underline underline-offset-2">
                    {p.id.slice(0, 8)}
                  </Link>
                </Td>
                <Td>{fmtDateTime(p.created_at)}</Td>
                <Td>{p.items.reduce((n, i) => n + i.qty, 0)}</Td>
                <Td className="text-right">{fmtRp(p.total)}</Td>
                <Td>
                  <StatusPesananBadge status={p.status} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}
