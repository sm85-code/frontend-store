'use client'

import { fmtDateTime } from '@store/shared'
import { Button, EmptyState, ErrorNotice, Input, PageSpinner, buttonVariants, cn } from '@store/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Send } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { api, errorMessage } from '@/lib/api'
import { useMe } from '@/lib/queries'

export default function ChatPage() {
  const me = useMe()
  const qc = useQueryClient()
  const [isi, setIsi] = useState('')
  const bottom = useRef<HTMLDivElement>(null)
  const chat = useQuery({ queryKey: ['chat'], queryFn: api.getChat, enabled: !!me.data, refetchInterval: 10_000 })
  const kirim = useMutation({
    mutationFn: (text: string) => api.kirimChat(text),
    onSuccess: (data) => {
      setIsi('')
      qc.setQueryData(['chat'], data)
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
  const count = chat.data?.pesan?.length ?? 0
  useEffect(() => {
    bottom.current?.scrollIntoView?.({ block: 'end' })
  }, [count])

  if (me.isPending) return <PageSpinner />
  if (!me.data) return <EmptyState title="Masuk untuk chat dengan toko" action={<Link href="/masuk?next=/chat" className={buttonVariants()}>Masuk</Link>} />
  if (chat.isPending) return <PageSpinner />
  if (chat.error) return <ErrorNotice message={errorMessage(chat.error)} />

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Chat dengan toko</h1>
      <div className="flex h-[65vh] flex-col rounded-lg border bg-card">
        <ul className="flex flex-1 flex-col gap-2 overflow-y-auto p-4" aria-live="polite">
          {count === 0 ? <li className="m-auto text-sm text-muted-foreground">Tulis pesan pertama Anda.</li> : null}
          {chat.data.pesan?.map((m) => (
            <li key={m.id} className={cn('max-w-[80%] rounded-lg px-3 py-2 text-sm', m.pengirim_admin ? 'self-start bg-muted' : 'self-end bg-primary/25')}>
              <p className="whitespace-pre-wrap break-words">{m.isi}</p>
              <p className="mt-1 text-[0.7rem] text-muted-foreground">{fmtDateTime(m.created_at)}</p>
            </li>
          ))}
          <div ref={bottom} />
        </ul>
        <form className="flex gap-2 border-t p-3" onSubmit={(e) => { e.preventDefault(); const t = isi.trim(); if (t) kirim.mutate(t) }}>
          <Input aria-label="Pesan" value={isi} maxLength={2000} onChange={(e) => setIsi(e.target.value)} placeholder="Tulis pesan…" />
          <Button type="submit" loading={kirim.isPending} disabled={!isi.trim()}><Send className="size-4" /> Kirim</Button>
        </form>
      </div>
    </div>
  )
}
