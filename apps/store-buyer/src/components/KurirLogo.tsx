import { cariKurir, type Kurir } from '@/lib/kurir'

function Ubin({ k, label }: { k: Kurir | null; label: string }) {
  if (k?.logo) {
    return (
      <span className={`grid h-12 min-w-24 place-items-center rounded-lg border px-3.5 ${k.gelap ? 'border-transparent bg-[#262626]' : 'bg-white'}`}>
        <img src={`/kurir/${k.logo}`} alt={k.nama} title={k.nama} loading="lazy" style={{ height: k.tinggi ?? 26 }} className="w-auto max-w-28 object-contain" />
      </span>
    )
  }
  return (
    <span className="grid h-12 min-w-24 place-items-center rounded-lg border bg-card px-3.5 text-sm font-bold" title={label}>
      {label}
    </span>
  )
}

/** One courier as a logo tile, or a text badge when there is no logo for it. */
export function KurirLogo({ nama }: { nama: string }) {
  const k = cariKurir(nama)
  return <Ubin k={k} label={k?.nama ?? nama.toUpperCase()} />
}

/** The couriers we ship with, as a row of tiles. */
export function DaftarKurir({ kurir }: { kurir: Kurir[] }) {
  return (
    <ul className="flex flex-wrap gap-2.5" aria-label="Kurir pengiriman">
      {kurir.map((k) => (
        <li key={k.kode}>
          <Ubin k={k} label={k.nama} />
        </li>
      ))}
    </ul>
  )
}
