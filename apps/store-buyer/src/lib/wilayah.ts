import { useQuery } from '@tanstack/react-query'

/** Region lists served as static files (see scripts/build-wilayah.mjs): Java, Bali and Lampung down to the village. */
export type KotaRef = readonly [kode: string, nama: string]
export type Provinsi = readonly [kode: string, nama: string, kota: readonly KotaRef[]]
export type Desa = readonly [kode: string, nama: string, kodePos: string]
export type Kecamatan = readonly [kode: string, nama: string, desa: readonly Desa[]]

async function getJson<T>(file: string): Promise<T> {
  const res = await fetch(`/wilayah/${file}.json`)
  if (!res.ok) throw new Error(`Daftar wilayah belum bisa dimuat (HTTP ${res.status}). Coba lagi.`)
  return (await res.json()) as T
}

const FOREVER = { staleTime: Infinity, gcTime: Infinity, retry: 1 } as const

export function useProvinsi() {
  return useQuery({ queryKey: ['wilayah', 'index'], queryFn: () => getJson<Provinsi[]>('index'), ...FOREVER })
}

/** Districts (with their villages) of one city/regency; fetched when the city is picked. */
export function useKecamatan(kodeKota: string) {
  return useQuery({
    queryKey: ['wilayah', kodeKota],
    queryFn: () => getJson<Kecamatan[]>(kodeKota),
    enabled: kodeKota !== '',
    ...FOREVER,
  })
}

export interface PilihanWilayah {
  provinsi: string
  kota: string
  kecamatan: string
  desa: string
}

export const KOSONG: PilihanWilayah = { provinsi: '', kota: '', kecamatan: '', desa: '' }

/** What the form stores for a selection; empty strings while a level is not chosen yet. */
export interface HasilWilayah {
  provinsi: string
  kota: string
  kecamatan: string
  kelurahan: string
  kode_pos: string
  kode_wilayah: string
}

export function resolveWilayah(
  pilihan: PilihanWilayah,
  provinsi: readonly Provinsi[] | undefined,
  kecamatan: readonly Kecamatan[] | undefined,
): HasilWilayah {
  const prov = provinsi?.find((p) => p[0] === pilihan.provinsi)
  const kota = prov?.[2].find((k) => k[0] === pilihan.kota)
  const kec = kecamatan?.find((k) => k[0] === pilihan.kecamatan)
  const desa = kec?.[2].find((d) => d[0] === pilihan.desa)
  return {
    provinsi: prov?.[1] ?? '',
    kota: kota?.[1] ?? '',
    kecamatan: kec?.[1] ?? '',
    kelurahan: desa?.[1] ?? '',
    kode_pos: desa?.[2] ?? '',
    kode_wilayah: desa?.[0] ?? '',
  }
}

/** Changing a level clears everything below it (a district from another city must never survive). */
export function pilih(sekarang: PilihanWilayah, level: keyof PilihanWilayah, kode: string): PilihanWilayah {
  switch (level) {
    case 'provinsi':
      return { provinsi: kode, kota: '', kecamatan: '', desa: '' }
    case 'kota':
      return { ...sekarang, kota: kode, kecamatan: '', desa: '' }
    case 'kecamatan':
      return { ...sekarang, kecamatan: kode, desa: '' }
    case 'desa':
      return { ...sekarang, desa: kode }
  }
}
