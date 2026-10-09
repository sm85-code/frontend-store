'use client'

import { fmtDateTime, type Percakapan } from '@store/shared'
import { ChatBubble, ChatComposer, EmptyState, ErrorNotice, PageSpinner, buttonVariants } from '@store/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { api, errorMessage } from '@/lib/api'
import { produkHref } from '@/lib/catalog'
import { useMe } from '@/lib/queries'

export default function ChatPage() {
  const me = useMe()
  const qc = useQueryClient()
  const bottom = useRef<HTMLDivElement>(null)
  const nearBottom = useRef(true)
  const [history, setHistory] = useState<NonNullable<Percakapan['pesan']>>([])
  const [noOlder, setNoOlder] = useState(false)
  const orders = useQuery({ queryKey: ['pesanan-chat'], queryFn: api.listPesanan, enabled: !!me.data })
  const chat = useQuery({ queryKey: ['chat'], queryFn: () => api.getChat(), enabled: !!me.data, refetchInterval: 10_000 })
  const produk = useQuery({ queryKey: ['produk-chat'], queryFn: () => api.listProduk(), enabled: !!me.data, staleTime: 5 * 60_000 })
  const simpan = (data: Percakapan) => qc.setQueryData(['chat'], data)
  const kirimTeks = useMutation({
    mutationFn: ({ isi, produkId, orderId }: { isi: string; produkId: string | null; orderId?: string | null }) => api.kirimChat(isi, produkId, orderId),
    onSuccess: simpan,
    onError: (e) => toast.error(errorMessage(e)),
  })
  const kirimFile = useMutation({
    mutationFn: ({ file, isi }: { file: File; isi: string }) => api.kirimLampiranChat(file, isi),
    onSuccess: simpan,
    onError: (e) => toast.error(errorMessage(e)),
  })
  useEffect(() => {
    if (chat.data?.pesan) setHistory((old) => Array.from(new Map([...old, ...chat.data.pesan!].map((m) => [m.id, m])).values()).sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id)))
  }, [chat.data?.pesan])
  const older = useMutation({ mutationFn: () => api.getChat(history[0]?.id), onSuccess: (data) => {
    setHistory((old) => Array.from(new Map([...(data.pesan ?? []), ...old].map((m) => [m.id, m])).values()))
    setNoOlder(!data.has_older)
  }, onError: (e) => toast.error(errorMessage(e)) })
  const count = history.length
  useEffect(() => {
    if (nearBottom.current) bottom.current?.scrollIntoView?.({ block: 'end' })
  }, [count])

  if (me.isPending) return <PageSpinner />
  if (!me.data) return <EmptyState title="Masuk untuk chat dengan toko" action={<Link href="/masuk?next=/chat" className={buttonVariants()}>Masuk</Link>} />
  if (chat.isPending) return <PageSpinner />
  if (chat.error) return <ErrorNotice message={errorMessage(chat.error)} />

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display mb-4 text-3xl">Chat dengan toko</h1>
      <div className="flex h-[70vh] flex-col rounded-lg border bg-card">
        {!noOlder && chat.data.has_older ? <button className="m-2 rounded-lg border px-3 py-2 text-sm" disabled={older.isPending} onClick={() => { nearBottom.current = false; older.mutate() }}>Pesan lebih lama</button> : null}
        <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4" aria-live="polite" onScroll={(e) => { const el = e.currentTarget; nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80 }}>
          {count === 0 ? <li className="m-auto text-sm text-muted-foreground">Tulis pesan pertama Anda.</li> : null}
          {history.map((m) => (
            <ChatBubble key={m.id} pesan={m} milik={!m.pengirim_admin} waktu={fmtDateTime(m.created_at)} produkHref={(p) => produkHref({ id: p.id, slug: p.slug })} />
          ))}
          <div ref={bottom} />
        </ul>
        <ChatComposer
          pesanan={orders.data ?? []}
          produk={produk.data ?? []}
          onKirimTeks={(isi, produkId, orderId) => kirimTeks.mutateAsync({ isi, produkId, orderId })}
          onKirimFile={(file, isi) => kirimFile.mutateAsync({ file, isi })}
          onTolak={(m) => toast.error(m)}
        />
      </div>
    </div>
  )
}
