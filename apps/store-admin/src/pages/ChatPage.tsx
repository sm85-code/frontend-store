import { fmtDateTime } from '@store/shared'
import { Button, EmptyState, ErrorNotice, Input, PageSpinner, cn } from '@store/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '../components/PageHeader'
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

  if (chat.isPending) return <PageSpinner />
  if (chat.error) return <ErrorNotice message={errorMessage(chat.error)} />

  return (
    <div className="flex h-[60vh] flex-col rounded-lg border bg-card">
      <div className="border-b px-4 py-2 font-medium">{chat.data.nama_pembeli ?? 'Pembeli'}</div>
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
        <Button type="submit" loading={kirim.isPending} disabled={!isi.trim()}>
          <Send className="size-4" /> Kirim
        </Button>
      </form>
    </div>
  )
}

export default function ChatPage() {
  const daftar = useQuery({ queryKey: ['chat', 'daftar'], queryFn: api.listChat, refetchInterval: POLL_MS })
  const qc = useQueryClient()
  const [aktif, setAktif] = useState<string | null>(null)

  return (
    <>
      <PageHeader title="Chat pembeli" description="Diperbarui otomatis setiap 10 detik." />
      {daftar.isPending ? (
        <PageSpinner />
      ) : daftar.error ? (
        <ErrorNotice message={errorMessage(daftar.error)} />
      ) : daftar.data.length === 0 ? (
        <EmptyState title="Belum ada percakapan" description="Percakapan muncul setelah pembeli mengirim pesan pertama." />
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
                    'flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm hover:bg-muted',
                    aktif === c.id && 'border-primary bg-primary/15',
                  )}
                >
                  <span className="truncate">{c.nama_pembeli ?? 'Pembeli'}</span>
                  {c.unread_admin ? <span className="size-2 shrink-0 rounded-full bg-danger" aria-label="Belum dibaca" /> : null}
                </button>
              </li>
            ))}
          </ul>
          {aktif ? <Thread key={aktif} id={aktif} /> : <EmptyState title="Pilih percakapan" />}
        </div>
      )}
    </>
  )
}
