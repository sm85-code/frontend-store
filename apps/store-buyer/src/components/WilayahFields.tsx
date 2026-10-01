'use client'

import { Field, Input, Select } from '@store/ui'
import { pilih, resolveWilayah, useKecamatan, useProvinsi, type HasilWilayah, type PilihanWilayah } from '@/lib/wilayah'

const PLACEHOLDER = { provinsi: 'Pilih provinsi', kota: 'Pilih kota / kabupaten', kecamatan: 'Pilih kecamatan', desa: 'Pilih desa / kelurahan' }

/** Cascading province > city/regency > district > village selects; the postal code follows the village.
 *  The parent form owns the selection (`value`) and receives the resolved names/codes through `onChange`. */
export function WilayahFields({
  value,
  onChange,
  errors = {},
}: {
  value: PilihanWilayah
  onChange: (pilihan: PilihanWilayah, hasil: HasilWilayah) => void
  errors?: Partial<Record<'provinsi' | 'kota' | 'kecamatan' | 'kelurahan', string | undefined>>
}) {
  const provinsi = useProvinsi()
  const kecamatan = useKecamatan(value.kota)

  const prov = provinsi.data?.find((p) => p[0] === value.provinsi)
  const kec = kecamatan.data?.find((k) => k[0] === value.kecamatan)
  const hasil = resolveWilayah(value, provinsi.data, kecamatan.data)

  const ubah = (level: keyof PilihanWilayah) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = pilih(value, level, e.target.value)
    onChange(next, resolveWilayah(next, provinsi.data, level === 'kota' || level === 'provinsi' ? undefined : kecamatan.data))
  }
  const memuat = (q: { isPending: boolean; isFetching?: boolean; error: unknown }) => q.isPending && !q.error

  return (
    <>
      <Field label="Provinsi" htmlFor="a-prov" error={errors.provinsi}>
        <Select id="a-prov" value={value.provinsi} onChange={ubah('provinsi')} aria-invalid={!!errors.provinsi} disabled={!provinsi.data}>
          <option value="">{provinsi.error ? 'Daftar provinsi gagal dimuat' : memuat(provinsi) ? 'Memuat…' : PLACEHOLDER.provinsi}</option>
          {provinsi.data?.map(([kode, nama]) => (
            <option key={kode} value={kode}>
              {nama}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Kota / Kabupaten" htmlFor="a-kota" error={errors.kota}>
        <Select id="a-kota" value={value.kota} onChange={ubah('kota')} aria-invalid={!!errors.kota} disabled={!prov}>
          <option value="">{PLACEHOLDER.kota}</option>
          {prov?.[2].map(([kode, nama]) => (
            <option key={kode} value={kode}>
              {nama}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Kecamatan" htmlFor="a-kec" error={errors.kecamatan}>
        <Select id="a-kec" value={value.kecamatan} onChange={ubah('kecamatan')} aria-invalid={!!errors.kecamatan} disabled={!kecamatan.data}>
          <option value="">{kecamatan.error ? 'Daftar kecamatan gagal dimuat' : value.kota && kecamatan.isPending ? 'Memuat…' : PLACEHOLDER.kecamatan}</option>
          {kecamatan.data?.map(([kode, nama]) => (
            <option key={kode} value={kode}>
              {nama}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Desa / Kelurahan" htmlFor="a-desa" error={errors.kelurahan}>
        <Select id="a-desa" value={value.desa} onChange={ubah('desa')} aria-invalid={!!errors.kelurahan} disabled={!kec}>
          <option value="">{PLACEHOLDER.desa}</option>
          {kec?.[2].map(([kode, nama]) => (
            <option key={kode} value={kode}>
              {nama}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Kode pos" htmlFor="a-pos">
        <Input id="a-pos" value={hasil.kode_pos} readOnly placeholder="Terisi otomatis setelah memilih kelurahan" inputMode="numeric" autoComplete="postal-code" />
      </Field>
    </>
  )
}
