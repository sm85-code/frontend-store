import { fmtDateTime, type Percakapan } from '@store/shared'
import { ChatBubble, ChatComposer } from '@store/ui'
import { ListPagination } from '../components/ListPagination'
import Spinner from '@/components/Spinner'
import { ErrorLine, PageTitle } from '@/components/erp'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { api, errorMessage } from '../lib/api'

const POLL_MS = 10_000

function Thread({ id }: { id: string }) {
  const qc = useQueryClient()
  const bottom = useRef<HTMLDivElement>(null)
  const nearBottom = useRef(true)
  const [history, setHistory] = useState<NonNullable<Percakapan['pesan']>>([])
  const [noOlder, setNoOlder] = useState(false)
  const chat = useQuery({ queryKey: ['chat', id], queryFn: () => api.getChat(id), refetchInterval: POLL_MS })
  const orders = useQuery({ queryKey: ["chat", id, "pesanan"], queryFn: () => api.pesananChat(id) })
  const produk = useQuery({ queryKey: ['produk'], queryFn: api.listProduk, staleTime: 60_000 })
  const simpan = (data: Percakapan) => {
    qc.setQueryData(['chat', id], data)
    void qc.invalidateQueries({ queryKey: ['chat', 'daftar'] })
  }
  const kirimTeks = useMutation({
    mutationFn: ({ isi, produkId, orderId }: { isi: string; produkId: string | null; orderId?: string | null }) => api.kirimChat(id, isi, produkId, orderId),
    onSuccess: simpan,
    onError: (e) => toast.error(errorMessage(e)),
  })
  const kirimFile = useMutation({
    mutationFn: ({ file, isi }: { file: File; isi: string }) => api.kirimLampiranChat(id, file, isi),
    onSuccess: simpan,
    onError: (e) => toast.error(errorMessage(e)),
  })

  useEffect(() => {
    if (chat.data?.pesan) setHistory((old) => Array.from(new Map([...old, ...chat.data.pesan!].map((m) => [m.id, m])).values()).sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id)))
  }, [chat.data?.pesan])
  const older = useMutation({ mutationFn: () => api.getChat(id, history[0]?.id), onSuccess: (data) => {
    setHistory((old) => Array.from(new Map([...(data.pesan ?? []), ...old].map((m) => [m.id, m])).values()))
    setNoOlder(!data.has_older)
  }, onError: (e) => toast.error(errorMessage(e)) })
  const count = history.length
  useEffect(() => {
    if (nearBottom.current) bottom.current?.scrollIntoView?.({ block: 'end' })
  }, [count, id])

  if (chat.isPending) return <Spinner column label="Memuat percakapan…" />
  if (chat.error) return <ErrorLine message={errorMessage(chat.error)} />

  return (
    <Card className="flex min-w-0 h-[60vh] flex-col">
      <CardHeader className="border-b py-3">
        <CardTitle>{chat.data.nama_pembeli ?? 'Pembeli'}</CardTitle>
      </CardHeader>
      {!noOlder && chat.data.has_older ? <button className="m-2 rounded-lg border px-3 py-2 text-sm" disabled={older.isPending} onClick={() => { nearBottom.current = false; older.mutate() }}>Pesan lebih lama</button> : null}
      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4" aria-live="polite" onScroll={(e) => { const el = e.currentTarget; nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80 }}>
        {history.map((m) => (
          <ChatBubble key={m.id} pesan={m} milik={m.pengirim_admin} waktu={fmtDateTime(m.created_at)} />
        ))}
        <div ref={bottom} />
      </ul>
      <ChatComposer
        pesanan={orders.data ?? []}
        produk={(produk.data ?? []).filter((p) => p.aktif)}
        placeholder="Tulis balasan…"
        onKirimTeks={(isi, produkId, orderId) => kirimTeks.mutateAsync({ isi, produkId, orderId })}
        onKirimFile={(file, isi) => kirimFile.mutateAsync({ file, isi })}
        onTolak={(m) => toast.error(m)}
      />
    </Card>
  )
}

export default function ChatPage() {
  const qc = useQueryClient()
  const [aktif, setAktif] = useState<string | null>(null)
  const [cari, setCari] = useState('')
  const [unread, setUnread] = useState(false)
  const [unanswered, setUnanswered] = useState(false)
  const [page, setPage] = useState(1)
  const daftar = useQuery({ queryKey: ['chat', 'daftar', page, cari, unread, unanswered], queryFn: () => api.daftarChat({ halaman: page, cari, unread, unanswered }), refetchInterval: POLL_MS })
  const visible = daftar.data?.items ?? []

  return (
    <div className="space-y-4">
      <PageTitle title="Chat Pembeli" description="Diperbarui otomatis setiap 10 detik." />
      <div className="flex flex-wrap items-center gap-3 text-sm"><input aria-label="Cari pembeli" placeholder="Cari pembeli" className="rounded-lg border bg-card px-3 py-2" value={cari} onChange={(e) => { setCari(e.target.value); setPage(1) }} /><label className="flex items-center gap-2"><input type="checkbox" checked={unread} onChange={(e) => { setUnread(e.target.checked); setPage(1) }} />Belum dibaca</label><label className="flex items-center gap-2"><input type="checkbox" checked={unanswered} onChange={(e) => { setUnanswered(e.target.checked); setPage(1) }} />Belum dibalas</label></div>
      {daftar.isPending ? (
        <Spinner column label="Memuat percakapan…" />
      ) : daftar.error ? (
        <ErrorLine message={errorMessage(daftar.error)} />
      ) : daftar.data.items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Belum ada percakapan. Percakapan muncul setelah pembeli mengirim pesan pertama.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[16rem_minmax(0,1fr)]">
          <ul className={cn("min-w-0 flex flex-col gap-1", aktif && "hidden md:flex")} aria-label="Daftar percakapan">
            {visible.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    setAktif(c.id)
                    void qc.invalidateQueries({ queryKey: ['chat', 'daftar'] })
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg border bg-card px-3 py-2 text-left text-sm hover:bg-muted/40',
                    aktif === c.id && 'border-primary bg-primary/15',
                  )}
                >
                  <span className="min-w-0"><span className="block truncate font-medium">{c.nama_pembeli ?? 'Pembeli'}</span><span className="block text-xs text-muted-foreground">{fmtDateTime(c.updated_at)}</span><span className="block truncate text-xs">{c.preview}</span></span>
                  {c.unread_admin ? <span className="size-2 shrink-0 rounded-full bg-destructive" aria-label="Belum dibaca" /> : null}
                </button>
              </li>
            ))}
            <li><ListPagination page={page} total={daftar.data.total} onChange={setPage} /></li>
          </ul>
          {aktif ? (
            <div className="min-w-0"><button className="mb-3 rounded-lg border bg-card px-4 py-2 md:hidden" onClick={() => setAktif(null)}>← Kembali ke daftar</button><Thread key={aktif} id={aktif} /></div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">Pilih percakapan.</CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
