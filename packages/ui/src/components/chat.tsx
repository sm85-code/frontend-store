'use client'

import { ImagePlus, Package, Send, Smile, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { cn } from '../cn'

export const CHAT_MAX_IMAGE = 5 * 1024 * 1024
export const CHAT_MAX_VIDEO = 20 * 1024 * 1024

export interface ChatLampiran {
  jenis: 'gambar' | 'video'
  url: string | null
}
export interface ChatProduk {
  id: string
  slug?: string | null
  nama: string
  harga: string
  foto_url: string | null
}
export interface ChatPesan {
  id: string
  isi: string
  created_at: string
  lampiran?: ChatLampiran | null
  produk?: ChatProduk | null
}

const EMOJI = (
  '😀 😃 😄 😁 😆 😅 😂 🤣 😊 🙂 😉 😍 🥰 😘 😎 🤩 🥳 🤗 🤔 😐 😴 😢 😭 😡 🙏 👍 👎 👏 🙌 💪 👌 ✌️ 🤝 ❤️ 💛 🧡 💚 💙 💔 🔥 ✨ ⭐ 🎉 🎁 🛒 📦 🚚 💰 💳 ✅ ❌ ⏳ 📷 🛍️ 👕 👟 👜 🍯 ☕'
).split(' ')

const URL_RE = /(https?:\/\/[^\s<]+)/g

/** Text with http(s) links made clickable. Anything else stays plain text (never HTML). */
function Teks({ isi }: { isi: string }) {
  const parts = isi.split(URL_RE)
  return (
    <p className="whitespace-pre-wrap break-words">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </p>
  )
}

const rp = (v: string) => `Rp ${Number(v).toLocaleString('id-ID')}`

export function ChatBubble({
  pesan,
  milik,
  waktu,
  produkHref,
}: {
  pesan: ChatPesan
  /** True for the viewer's own messages (right side, tinted). */
  milik: boolean
  waktu: string
  produkHref?: (p: ChatProduk) => string | undefined
}) {
  const { lampiran, produk } = pesan
  const href = produk ? produkHref?.(produk) : undefined
  const kartu = produk ? (
    <div className="flex items-center gap-2.5 rounded-md border bg-card p-2 text-card-foreground">
      {produk.foto_url ? <img src={produk.foto_url} alt="" className="size-12 shrink-0 rounded object-cover" /> : <div className="size-12 shrink-0 rounded bg-muted" aria-hidden />}
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm font-semibold">{produk.nama}</p>
        <p className="text-xs font-bold">{rp(produk.harga)}</p>
      </div>
    </div>
  ) : null
  return (
    <li className={cn('flex max-w-[82%] flex-col gap-1.5 rounded-lg px-3 py-2 text-sm', milik ? 'self-end bg-primary/25' : 'self-start bg-muted')}>
      {lampiran?.url ? (
        lampiran.jenis === 'video' ? (
          <video src={lampiran.url} controls preload="metadata" playsInline className="max-h-72 w-full rounded-md bg-black" />
        ) : (
          <a href={lampiran.url} target="_blank" rel="noopener noreferrer">
            <img src={lampiran.url} alt="Lampiran foto" loading="lazy" className="max-h-72 rounded-md object-cover" />
          </a>
        )
      ) : null}
      {kartu ? href ? <a href={href} className="block hover:opacity-90">{kartu}</a> : kartu : null}
      {pesan.isi ? <Teks isi={pesan.isi} /> : null}
      <p className="text-[0.7rem] text-muted-foreground">{waktu}</p>
    </li>
  )
}

export interface ChatComposerProps {
  /** Products that can be attached as a card. */
  produk: ChatProduk[]
  placeholder?: string
  onKirimTeks: (isi: string, produkId: string | null) => Promise<unknown>
  onKirimFile: (file: File, isi: string) => Promise<unknown>
  /** Called with a message when a picked file is rejected (too big / wrong type). */
  onTolak: (pesan: string) => void
}

const ikon = 'grid size-9 shrink-0 place-items-center rounded-md border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50'

export function ChatComposer({ produk, placeholder = 'Tulis pesan…', onKirimTeks, onKirimFile, onTolak }: ChatComposerProps) {
  const [isi, setIsi] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dipilih, setDipilih] = useState<ChatProduk | null>(null)
  const [panel, setPanel] = useState<'emoji' | 'produk' | null>(null)
  const [cari, setCari] = useState('')
  const [kirim, setKirim] = useState(false)
  const area = useRef<HTMLTextAreaElement>(null)
  const preview = useMemo(() => (file?.type.startsWith('image/') ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase()
    return produk.filter((p) => !q || p.nama.toLowerCase().includes(q)).slice(0, 30)
  }, [produk, cari])

  const bisaKirim = !kirim && (isi.trim() !== '' || file !== null || dipilih !== null)

  function sisipkan(emoji: string) {
    const el = area.current
    const a = el?.selectionStart ?? isi.length
    const b = el?.selectionEnd ?? isi.length
    setIsi((t) => t.slice(0, a) + emoji + t.slice(b))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(a + emoji.length, a + emoji.length)
    })
  }

  function pilihFile(f: File | undefined) {
    if (!f) return
    const video = f.type.startsWith('video/')
    if (!video && !f.type.startsWith('image/')) return onTolak('Pilih foto atau video')
    if (video && f.size > CHAT_MAX_VIDEO) return onTolak('Ukuran video maksimal 20 MB')
    if (!video && f.size > CHAT_MAX_IMAGE) return onTolak('Ukuran foto maksimal 5 MB')
    setFile(f)
    setPanel(null)
  }

  async function submit(e?: FormEvent) {
    e?.preventDefault()
    if (!bisaKirim) return
    setKirim(true)
    try {
      if (file) await onKirimFile(file, isi.trim())
      else await onKirimTeks(isi.trim(), dipilih?.id ?? null)
      setIsi('')
      setFile(null)
      setDipilih(null)
      setPanel(null)
    } catch {
      // The caller shows the error; the draft stays so nothing is lost.
    } finally {
      setKirim(false)
    }
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) void submit(e)
  }

  return (
    <form className="flex flex-col gap-2 border-t p-3" onSubmit={submit}>
      {file || dipilih ? (
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-2 text-sm">
          {file ? (
            <>
              {preview ? <img src={preview} alt="" className="size-10 rounded object-cover" /> : <span className="grid size-10 place-items-center rounded bg-muted text-xs">Video</span>}
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
            </>
          ) : dipilih ? (
            <>
              {dipilih.foto_url ? <img src={dipilih.foto_url} alt="" className="size-10 rounded object-cover" /> : <span className="size-10 rounded bg-muted" />}
              <span className="min-w-0 flex-1 truncate">
                <span className="font-semibold">{dipilih.nama}</span> · {rp(dipilih.harga)}
              </span>
            </>
          ) : null}
          <button type="button" aria-label="Batalkan lampiran" className="grid size-7 place-items-center rounded hover:bg-muted" onClick={() => { setFile(null); setDipilih(null) }}>
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      {panel === 'emoji' ? (
        <div role="group" aria-label="Pilih emoji" className="grid max-h-40 grid-cols-8 gap-1 overflow-y-auto rounded-md border bg-card p-2 sm:grid-cols-10">
          {EMOJI.map((e) => (
            <button key={e} type="button" onClick={() => sisipkan(e)} className="grid size-9 place-items-center rounded text-xl hover:bg-muted" aria-label={`Emoji ${e}`}>
              {e}
            </button>
          ))}
        </div>
      ) : null}

      {panel === 'produk' ? (
        <div className="flex flex-col gap-2 rounded-md border bg-card p-2">
          <input
            type="search"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari produk untuk dikirim…"
            aria-label="Cari produk"
            className="h-9 rounded-md border bg-background px-2.5 text-sm outline-none focus:border-ring"
          />
          <ul className="flex max-h-44 flex-col gap-1 overflow-y-auto">
            {hasil.length === 0 ? <li className="px-2 py-3 text-center text-xs text-muted-foreground">Produk tidak ditemukan.</li> : null}
            {hasil.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => { setDipilih(p); setFile(null); setPanel(null) }}
                  className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-left hover:bg-muted"
                >
                  {p.foto_url ? <img src={p.foto_url} alt="" className="size-9 rounded object-cover" /> : <span className="size-9 rounded bg-muted" />}
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm font-medium">{p.nama}</span>
                    <span className="text-xs text-muted-foreground">{rp(p.harga)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <button type="button" className={ikon} aria-label="Emoji" aria-pressed={panel === 'emoji'} onClick={() => setPanel(panel === 'emoji' ? null : 'emoji')}>
          <Smile className="size-5" />
        </button>
        <label className={cn(ikon, 'cursor-pointer')} aria-label="Lampirkan foto atau video">
          <ImagePlus className="size-5" />
          <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" className="sr-only" onChange={(e) => { pilihFile(e.target.files?.[0]); e.target.value = '' }} />
        </label>
        <button type="button" className={ikon} aria-label="Kirim link produk" aria-pressed={panel === 'produk'} disabled={produk.length === 0} onClick={() => setPanel(panel === 'produk' ? null : 'produk')}>
          <Package className="size-5" />
        </button>
        <textarea
          ref={area}
          rows={1}
          value={isi}
          maxLength={2000}
          aria-label="Pesan"
          placeholder={file ? 'Tambah keterangan (opsional)…' : placeholder}
          onChange={(e) => setIsi(e.target.value)}
          onKeyDown={onKey}
          className="max-h-28 min-h-9 flex-1 resize-none rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:border-ring"
        />
        <button type="submit" disabled={!bisaKirim} aria-label="Kirim" className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground transition disabled:opacity-50">
          <Send className="size-4" />
        </button>
      </div>
    </form>
  )
}
