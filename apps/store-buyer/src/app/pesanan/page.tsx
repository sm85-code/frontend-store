'use client'

import { fmtDateTime, fmtRp } from '@store/shared'
import { EmptyState, ErrorNotice, PageSpinner, buttonVariants } from '@store/ui'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { StatusBadge } from '@/components/StatusBadge'
import { api, errorMessage } from '@/lib/api'
import { useMe } from '@/lib/queries'

export default function PesananSayaPage() {
  const me = useMe()
  const pesanan = useQuery({ queryKey: ['pesanan'], queryFn: api.listPesanan, enabled: !!me.data })

  if (me.isPending) return <PageSpinner />
  if (!me.data) return <EmptyState title="Masuk untuk melihat pesanan" action={<Link href="/masuk?next=/pesanan" className={buttonVariants()}>Masuk</Link>} />
  if (pesanan.isPending) return <PageSpinner />
  if (pesanan.error) return <ErrorNotice message={errorMessage(pesanan.error)} />

  return (
    <>
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight">Pesanan saya</h1>
      {pesanan.data.length === 0 ? (
        <EmptyState title="Belum ada pesanan" action={<Link href="/" className={buttonVariants()}>Mulai belanja</Link>} />
      ) : (
        <ul className="flex flex-col gap-3">
          {pesanan.data.map((p) => (
            <li key={p.id}>
              <Link href={`/pesanan/${p.id}`} className="flex flex-wrap items-center justify-between gap-2 card-lift rounded-lg border bg-card p-4">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">#{p.id.slice(0, 8)}</p>
                  <p className="text-sm">{fmtDateTime(p.created_at)} · {p.items.reduce((n, i) => n + i.qty, 0)} item</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={p.status} />
                  <span className="font-semibold">{fmtRp(p.total)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
