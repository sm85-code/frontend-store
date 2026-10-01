'use client'

import { useState } from 'react'

export interface FotoItem {
  id: string | null
  url: string | null
}

/** Product photo gallery: large image + thumbnails. `pilihId` lets a chosen variant jump to its own photo. */
export function Galeri({ foto, nama, pilihId }: { foto: FotoItem[]; nama: string; pilihId?: string | null }) {
  const fotos = foto.filter((f): f is { id: string | null; url: string } => !!f.url)
  const [dipilih, setDipilih] = useState(0)
  const [terakhir, setTerakhir] = useState<string | null | undefined>(pilihId)
  if (pilihId !== terakhir) {
    setTerakhir(pilihId)
    const i = fotos.findIndex((f) => f.id === pilihId)
    if (i >= 0) setDipilih(i)
  }
  const aktif = fotos[Math.min(dipilih, fotos.length - 1)]

  return (
    <div className="flex flex-col gap-2.5">
      <div className="aspect-square overflow-hidden rounded-xl border bg-[var(--brand-soft)]">
        {aktif ? (
          <img src={aktif.url} alt={nama} className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-sm font-medium text-muted-foreground">Foto segera hadir</div>
        )}
      </div>
      {fotos.length > 1 ? (
        <ul className="grid grid-cols-5 gap-2 sm:grid-cols-7" aria-label="Foto produk">
          {fotos.map((f, i) => (
            <li key={f.id ?? i}>
              <button
                type="button"
                onClick={() => setDipilih(i)}
                aria-label={`Lihat foto ${i + 1}`}
                aria-current={i === dipilih}
                className={`block aspect-square w-full overflow-hidden rounded-md border-2 transition ${i === dipilih ? 'border-primary' : 'border-transparent opacity-75 hover:opacity-100'}`}
              >
                <img src={f.url} alt="" loading="lazy" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
