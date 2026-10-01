import { fmtDateTime } from '@store/shared'
import Spinner from '@/components/Spinner'
import { ErrorLine, PageTitle } from '@/components/erp'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { api, errorMessage } from '../lib/api'

const POLL_MS = 10_000

function Thread({ id }: { id: string }) {
  const qc = useQueryClient()
  const [isi, setIsi] = useState('')
  const bottom = useRef<HTMLDivElement>(null)
  const chat = useQuery({ queryKey: ['chat', id], queryFn: () => api.getChat(id), refetchInterval: POLL_MS })
  const kirim = useMutation({
    mutationFn: (text: string) => api.kirimChat(id, text),
    onSuccess: (data) => {
      setIsi('')
      qc.setQueryData(['chat', id], data)
      void qc.invalidateQueries({ queryKey: ['chat', 'daftar'] })
    },
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
          <li
            key={m.id}
            className={cn(
              'max-w-[80%] rounded-lg px-3 py-2 text-sm',
              m.pengirim_admin ? 'self-end bg-primary/25' : 'self-start bg-muted',
            )}
          >
            <p className="whitespace-pre-wrap break-words">{m.isi}</p>
            <p className="mt-1 text-[0.7rem] text-muted-foreground">{fmtDateTime(m.created_at)}</p>
          </li>
        ))}
        <div ref={bottom} />
      </ul>
      <form
        className="flex gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault()
          const text = isi.trim()
          if (text) kirim.mutate(text)
        }}
      >
        <Input aria-label="Pesan" value={isi} maxLength={2000} onChange={(e) => setIsi(e.target.value)} placeholder="Tulis balasan…" />
        <Button type="submit" disabled={kirim.isPending || !isi.trim()}>
          {kirim.isPending ? 'Mengirim…' : 'Kirim'}
        </Button>
      </form>
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
