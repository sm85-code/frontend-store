import type { Produk } from '@store/shared'
import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, ImageUp, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { api, errorMessage } from '../lib/api'

export const MAKS_FOTO = 7

/** Gallery of up to 7 photos: the first one is the cover. Each action saves immediately. */
export default function FotoManager({ produk, onChange }: { produk: Produk; onChange: (p: Produk) => void }) {
  const qc = useQueryClient()
  const [notice, setNotice] = useState<string | null>(null)
  const fotos = (produk.foto ?? []).filter((f): f is { id: string; url: string | null } => !!f.id)
  const penuh = fotos.length >= MAKS_FOTO

  const done = (p: Produk) => {
    onChange(p)
    void qc.invalidateQueries({ queryKey: ['produk'] })
  }
  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      let last = produk
      for (const f of files) last = await api.uploadFoto(produk.id, f)
      return last
    },
    onSuccess: (p) => {
      done(p)
      toast.success('Foto diunggah')
    },
    onError: (e: Error & { isNotReady?: boolean }) =>
      e.isNotReady ? setNotice(e.message) : toast.error(errorMessage(e)),
  })
  const hapus = useMutation({
    mutationFn: (id: string) => api.deleteFoto(produk.id, id),
    onSuccess: done,
    onError: (e) => toast.error(errorMessage(e)),
  })
  const urut = useMutation({
    mutationFn: (ids: string[]) => api.urutkanFoto(produk.id, ids),
    onSuccess: done,
    onError: (e) => toast.error(errorMessage(e)),
  })

  function geser(i: number, arah: -1 | 1) {
    const ids = fotos.map((f) => f.id)
    const j = i + arah
    if (j < 0 || j >= ids.length) return
    const a = ids[i]
    const b = ids[j]
    if (a === undefined || b === undefined) return
    ids[i] = b
    ids[j] = a
    urut.mutate(ids)
  }

  const sibuk = upload.isPending || hapus.isPending || urut.isPending

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">
          Foto produk ({fotos.length}/{MAKS_FOTO})
        </p>
        <label
          className={`inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium ${penuh || sibuk ? 'opacity-50' : 'cursor-pointer hover:bg-muted'}`}
        >
          <ImageUp className="size-4" /> {upload.isPending ? 'Mengunggah…' : 'Tambah foto'}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={penuh || sibuk}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? [])
              e.target.value = ''
              if (!files.length) return
              setNotice(null)
              if (fotos.length + files.length > MAKS_FOTO) return toast.error(`Maksimal ${MAKS_FOTO} foto per produk`)
              if (files.some((f) => f.size > 5 * 1024 * 1024)) return toast.error('Ukuran foto maksimal 5 MB')
              upload.mutate(files)
            }}
          />
        </label>
      </div>
      {fotos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada foto. Foto pertama menjadi sampul produk.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {fotos.map((f, i) => (
            <li key={f.id} className="flex flex-col gap-1">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                {f.url ? <img src={f.url} alt={`Foto ${i + 1}`} className="size-full object-cover" /> : null}
                {i === 0 ? (
                  <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    Sampul
                  </span>
                ) : null}
              </div>
              <div className="flex justify-between">
                <Button type="button" size="icon" variant="ghost" aria-label={`Geser foto ${i + 1} ke kiri`} disabled={sibuk || i === 0} onClick={() => geser(i, -1)}>
                  <ArrowLeft className="size-4" />
                </Button>
                <Button type="button" size="icon" variant="ghost" aria-label={`Hapus foto ${i + 1}`} disabled={sibuk} onClick={() => hapus.mutate(f.id)}>
                  <Trash2 className="size-4" />
                </Button>
                <Button type="button" size="icon" variant="ghost" aria-label={`Geser foto ${i + 1} ke kanan`} disabled={sibuk || i === fotos.length - 1} onClick={() => geser(i, 1)}>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {notice ? (
        <p className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}>
          {notice}
        </p>
      ) : null}
    </div>
  )
}
