'use client'

import { fmtDateTime, type Percakapan } from '@store/shared'
import { ChatBubble, ChatComposer, EmptyState, ErrorNotice, PageSpinner, buttonVariants } from '@store/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { api, errorMessage } from '@/lib/api'
import { produkHref } from '@/lib/catalog'
import { useMe } from '@/lib/queries'

export default function ChatPage() {
  const me = useMe()
  const qc = useQueryClient()
  const bottom = useRef<HTMLDivElement>(null)
  const chat = useQuery({ queryKey: ['chat'], queryFn: api.getChat, enabled: !!me.data, refetchInterval: 10_000 })
  const produk = useQuery({ queryKey: ['produk-chat'], queryFn: () => api.listProduk(), enabled: !!me.data, staleTime: 5 * 60_000 })
  const simpan = (data: Percakapan) => qc.setQueryData(['chat'], data)
  const kirimTeks = useMutation({
    mutationFn: ({ isi, produkId }: { isi: string; produkId: string | null }) => api.kirimChat(isi, produkId),
    onSuccess: simpan,
    onError: (e) => toast.error(errorMessage(e)),
  })
  const kirimFile = useMutation({
    mutationFn: ({ file, isi }: { file: File; isi: string }) => api.kirimLampiranChat(file, isi),
    onSuccess: simpan,
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
      <h1 className="font-display mb-4 text-3xl">Chat dengan toko</h1>
      <div className="flex h-[70vh] flex-col rounded-lg border bg-card">
        <ul className="flex flex-1 flex-col gap-2 overflow-y-auto p-4" aria-live="polite">
          {count === 0 ? <li className="m-auto text-sm text-muted-foreground">Tulis pesan pertama Anda.</li> : null}
          {chat.data.pesan?.map((m) => (
            <ChatBubble key={m.id} pesan={m} milik={!m.pengirim_admin} waktu={fmtDateTime(m.created_at)} produkHref={(p) => produkHref({ id: p.id, slug: p.slug })} />
          ))}
          <div ref={bottom} />
        </ul>
        <ChatComposer
          produk={produk.data ?? []}
          onKirimTeks={(isi, produkId) => kirimTeks.mutateAsync({ isi, produkId })}
          onKirimFile={(file, isi) => kirimFile.mutateAsync({ file, isi })}
          onTolak={(m) => toast.error(m)}
        />
      </div>
    </div>
  )
}
