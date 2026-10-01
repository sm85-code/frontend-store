// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Kecamatan, Provinsi } from '@/lib/wilayah'

const DIR = path.join(import.meta.dirname, '..', '..', 'public', 'wilayah')
const read = <T>(file: string) => JSON.parse(readFileSync(path.join(DIR, `${file}.json`), 'utf8')) as T

describe('generated region data (public/wilayah)', () => {
  const index = read<Provinsi[]>('index')

  it('covers exactly the provinces we ship to, under the names people know', () => {
    expect(index.map((p) => p[1])).toEqual(['Bali', 'Banten', 'DI Yogyakarta', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Lampung'])
    expect(index.map((p) => p[0]).sort()).toEqual(['18', '31', '32', '33', '34', '35', '36', '51'])
  })

  it('has a file for every city/regency, each district with villages, and a 5-digit postal code on every village', () => {
    let villages = 0
    for (const [prov, , kotaList] of index) {
      expect(kotaList.length).toBeGreaterThan(0)
      for (const [kota, namaKota] of kotaList) {
        expect(namaKota).not.toBe('')
        expect(kota.startsWith(`${prov}.`)).toBe(true)
        expect(existsSync(path.join(DIR, `${kota}.json`))).toBe(true)
        const kecamatan = read<Kecamatan[]>(kota)
        expect(kecamatan.length, kota).toBeGreaterThan(0)
        for (const [kec, namaKec, desa] of kecamatan) {
          expect(kec.startsWith(`${kota}.`)).toBe(true)
          expect(namaKec).not.toBe('')
          expect(desa.length, kec).toBeGreaterThan(0)
          for (const [kodeDesa, namaDesa, pos] of desa) {
            expect(kodeDesa).toMatch(/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/)
            expect(kodeDesa.startsWith(`${kec}.`)).toBe(true)
            expect(namaDesa).not.toBe('')
            expect(pos, kodeDesa).toMatch(/^\d{5}$/)
            villages++
          }
        }
      }
    }
    expect(villages).toBeGreaterThan(28000)
  })

  it('knows Bandung down to the village and its postal code', () => {
    const bandung = read<Kecamatan[]>('32.73')
    const sukasari = bandung.find((k) => k[1] === 'Sukasari')
    expect(sukasari?.[2].find((d) => d[1] === 'Sukarasa')?.[2]).toBe('40152')
  })
})
