import { fmtDateTime, type Percakapan } from '@store/shared'
import { ChatBubble, ChatComposer } from '@store/ui'
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
  const chat = useQuery({ queryKey: ['chat', id], queryFn: () => api.getChat(id), refetchInterval: POLL_MS })
  const produk = useQuery({ queryKey: ['produk'], queryFn: api.listProduk, staleTime: 60_000 })
  const simpan = (data: Percakapan) => {
    qc.setQueryData(['chat', id], data)
    void qc.invalidateQueries({ queryKey: ['chat', 'daftar'] })
  }
  const kirimTeks = useMutation({
    mutationFn: ({ isi, produkId }: { isi: string; produkId: string | null }) => api.kirimChat(id, isi, produkId),
    onSuccess: simpan,
    onError: (e) => toast.error(errorMessage(e)),
  })
  const kirimFile = useMutation({
    mutationFn: ({ file, isi }: { file: File; isi: string }) => api.kirimLampiranChat(id, file, isi),
    onSuccess: simpan,
    onError: (e) => toast.error(errorMessage(e)),
  })

  const count = chat.data?.pesan?.length ?? 0
  useEffect(() => {
    bottom.current?.scrollIntoView?.({ block: 'end' })
  }, [count, id])

  if (chat.isPending) return <Spinner column label="Memuat percakapan…" />
  if (chat.error) return <ErrorLine message={errorMessage(chat.error)} />

  return (
    <Card className="flex h-[60vh] flex-col">
      <CardHeader className="border-b py-3">
        <CardTitle>{chat.data.nama_pembeli ?? 'Pembeli'}</CardTitle>
      </CardHeader>
      <ul className="flex flex-1 flex-col gap-2 overflow-y-auto p-4" aria-live="polite">
        {chat.data.pesan?.map((m) => (
          <ChatBubble key={m.id} pesan={m} milik={m.pengirim_admin} waktu={fmtDateTime(m.created_at)} />
        ))}
        <div ref={bottom} />
      </ul>
      <ChatComposer
        produk={(produk.data ?? []).filter((p) => p.aktif)}
        placeholder="Tulis balasan…"
        onKirimTeks={(isi, produkId) => kirimTeks.mutateAsync({ isi, produkId })}
        onKirimFile={(file, isi) => kirimFile.mutateAsync({ file, isi })}
        onTolak={(m) => toast.error(m)}
      />
    </Card>
  )
}

export default function ChatPage() {
  const daftar = useQuery({ queryKey: ['chat', 'daftar'], queryFn: api.listChat, refetchInterval: POLL_MS })
  const qc = useQueryClient()
  const [aktif, setAktif] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <PageTitle title="Chat Pembeli" description="Diperbarui otomatis setiap 10 detik." />
      {daftar.isPending ? (
        <Spinner column label="Memuat percakapan…" />
      ) : daftar.error ? (
        <ErrorLine message={errorMessage(daftar.error)} />
      ) : daftar.data.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Belum ada percakapan. Percakapan muncul setelah pembeli mengirim pesan pertama.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-[16rem_1fr]">
          <ul className="flex flex-col gap-1" aria-label="Daftar percakapan">
            {daftar.data.map((c) => (
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
                  <span className="truncate">{c.nama_pembeli ?? 'Pembeli'}</span>
                  {c.unread_admin ? <span className="size-2 shrink-0 rounded-full bg-destructive" aria-label="Belum dibaca" /> : null}
                </button>
              </li>
            ))}
          </ul>
          {aktif ? (
            <Thread key={aktif} id={aktif} />
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
