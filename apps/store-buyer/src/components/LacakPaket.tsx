'use client'

import { fmtDateTime } from '@store/shared'
import { Button } from '@store/ui'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, errorMessage } from '@/lib/api'

/** Where the parcel is, as reported by the courier (through Biteship). */
export function LacakPaket({ pesananId }: { pesananId: string }) {
  const qc = useQueryClient()
  const lacak = useQuery({
    queryKey: ['lacak', pesananId],
    queryFn: () => api.lacakPengiriman(pesananId),
    retry: false,
    staleTime: 60_000,
  })

  function perbarui() {
    void qc.invalidateQueries({ queryKey: ['lacak', pesananId] })
    void qc.invalidateQueries({ queryKey: ['pengiriman', pesananId] })
    void qc.invalidateQueries({ queryKey: ['pesanan', pesananId] })
  }

  return (
    <div className="mt-2 flex flex-col gap-2 border-t pt-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">Lacak paket</h3>
        <Button variant="outline" size="sm" loading={lacak.isFetching} onClick={perbarui}>Perbarui</Button>
      </div>
      {lacak.isPending ? <p className="text-muted-foreground">Memuat riwayat…</p> : null}
      {lacak.error ? <p className="text-muted-foreground">{errorMessage(lacak.error, 'Riwayat belum tersedia.')}</p> : null}
      {lacak.data && lacak.data.riwayat.length === 0 ? <p className="text-muted-foreground">Belum ada pembaruan dari kurir.</p> : null}
      {lacak.data && lacak.data.riwayat.length > 0 ? (
        <ol className="flex flex-col gap-3 border-l pl-4">
          {lacak.data.riwayat.map((r, i) => (
            <li key={`${r.waktu}-${i}`} className="relative">
              <span className={`absolute -left-[1.3rem] top-1.5 size-2 rounded-full ${i === 0 ? 'bg-primary' : 'bg-muted-foreground/40'}`} aria-hidden />
              <p className={i === 0 ? 'font-medium' : ''}>{r.catatan || r.status}</p>
              <p className="text-xs text-muted-foreground">{fmtDateTime(r.waktu)}</p>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}
