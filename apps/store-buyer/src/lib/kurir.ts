/** Couriers Biteship supports (courier_code), with the logo we ship for them when there is one. */
export interface Kurir {
  kode: string
  nama: string
  /** File under public/kurir; absent when no logo is available (a text badge is shown instead). */
  logo?: string
  /** The artwork is white: show it on a dark tile. */
  gelap?: boolean
  /** Rendered height in px. */
  tinggi?: number
}

export const KURIR: Kurir[] = [
  { kode: 'jne', nama: 'JNE', logo: 'jne.svg', tinggi: 30 },
  { kode: 'jnt', nama: 'J&T Express', logo: 'jnt.png', gelap: true, tinggi: 22 },
  { kode: 'sicepat', nama: 'SiCepat', logo: 'sicepat.svg', tinggi: 28 },
  { kode: 'anteraja', nama: 'AnterAja', logo: 'anteraja.png', tinggi: 30 },
  { kode: 'idexpress', nama: 'ID Express', logo: 'idexpress.svg', tinggi: 32 },
  { kode: 'ninja', nama: 'Ninja Xpress', logo: 'ninja.png', gelap: true, tinggi: 30 },
  { kode: 'lion', nama: 'Lion Parcel', logo: 'lion.svg', tinggi: 26 },
  { kode: 'tiki', nama: 'TIKI', logo: 'tiki.png', tinggi: 20 },
  { kode: 'pos', nama: 'POS Indonesia', logo: 'pos.png', tinggi: 36 },
  { kode: 'wahana', nama: 'Wahana', logo: 'wahana.png', tinggi: 28 },
  { kode: 'rpx', nama: 'RPX', logo: 'rpx.png', tinggi: 30 },
  { kode: 'gojek', nama: 'GoSend (Gojek)', logo: 'gojek.svg', gelap: true, tinggi: 22 },
  { kode: 'lalamove', nama: 'Lalamove', logo: 'lalamove.svg', tinggi: 24 },
  { kode: 'deliveree', nama: 'Deliveree', logo: 'deliveree.png', gelap: true, tinggi: 22 },
  { kode: 'grab', nama: 'GrabExpress' },
  { kode: 'paxel', nama: 'Paxel' },
  { kode: 'borzo', nama: 'Borzo' },
  { kode: 'jdl', nama: 'JD Logistics' },
  { kode: 'sentralcargo', nama: 'Sentral Cargo' },
  { kode: 'dash_express', nama: 'Dash Express' },
  { kode: 'jntcargo', nama: 'J&T Cargo' },
]

const ALIAS: [RegExp, string][] = [
  [/jntcargo|jtcargo|j&?t.?cargo/, 'jntcargo'],
  [/^jnt|^j&?t|jandt|jtexpress/, 'jnt'],
  [/^jne/, 'jne'],
  [/sicepat/, 'sicepat'],
  [/anteraja/, 'anteraja'],
  [/id.?express|idexpress/, 'idexpress'],
  [/ninja/, 'ninja'],
  [/lion/, 'lion'],
  [/tiki/, 'tiki'],
  [/^pos/, 'pos'],
  [/wahana/, 'wahana'],
  [/^rpx/, 'rpx'],
  [/gojek|gosend/, 'gojek'],
  [/lalamove/, 'lalamove'],
  [/deliveree/, 'deliveree'],
  [/grab/, 'grab'],
  [/paxel/, 'paxel'],
  [/borzo/, 'borzo'],
  [/jdl|jd.?logistic/, 'jdl'],
  [/sentral/, 'sentralcargo'],
  [/dash/, 'dash_express'],
]

/** Finds a courier from the free text we store ("JNE", "jne", "J&T Express", "sicepat"...); null when unknown. */
export function cariKurir(teks: string | null | undefined): Kurir | null {
  const t = (teks ?? '').trim().toLowerCase().replace(/\s+/g, '')
  if (!t) return null
  const kode = ALIAS.find(([re]) => re.test(t))?.[1] ?? KURIR.find((k) => k.kode === t)?.kode
  return KURIR.find((k) => k.kode === kode) ?? null
}
