const rupiah = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })

export function fmtRp(value: string | number | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : (value ?? 0)
  if (!Number.isFinite(n)) return 'Rp 0'
  return `Rp ${rupiah.format(Math.round(n))}`
}

export function fmtDate(value: string | null | undefined): string {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fmtDateTime(value: string | null | undefined): string {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** Local YYYY-MM-DD (not UTC) for <input type="date"> and report ranges. */
export function toDateInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export interface AlamatParts {
  alamat?: string | null
  kelurahan?: string | null
  kecamatan?: string | null
  kota?: string | null
  provinsi?: string | null
  kodePos?: string | null
}

/** "Jl. Cipaganti 5, Sukarasa, Sukasari, Kota Bandung, Jawa Barat 40152": the full street address first, then the
 *  administrative levels from small to large, skipping whatever is empty (older addresses have no kecamatan/kelurahan). */
export function formatAlamat(p: AlamatParts): string {
  const wilayah = [p.kelurahan, p.kecamatan, p.kota, p.provinsi].map((x) => (x ?? '').trim()).filter(Boolean)
  const kodePos = (p.kodePos ?? '').trim()
  const tail = [wilayah.join(', '), kodePos].filter(Boolean).join(' ')
  return [(p.alamat ?? '').trim(), tail].filter(Boolean).join(', ')
}
