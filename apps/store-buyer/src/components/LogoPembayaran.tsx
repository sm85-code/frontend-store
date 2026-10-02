/** Payment-method logos (public/pembayaran). Shown on a white tile so the brand colours stay correct in dark mode too. */
export interface MetodeLogo {
  slug: string
  nama: string
  /** Rendered height in px; wide wordmarks and square marks need different sizes to look balanced. */
  tinggi?: number
}

export function LogoPembayaran({ metode }: { metode: MetodeLogo[] }) {
  return (
    <ul className="flex flex-wrap gap-2.5" aria-label="Logo metode pembayaran">
      {metode.map((m) => (
        <li key={m.slug} className="grid h-14 min-w-24 place-items-center rounded-lg border bg-white px-4">
          <img
            src={`/pembayaran/${m.slug}.png`}
            alt={m.nama}
            title={m.nama}
            loading="lazy"
            style={{ height: m.tinggi ?? 26 }}
            className="w-auto max-w-32 object-contain"
          />
        </li>
      ))}
    </ul>
  )
}
