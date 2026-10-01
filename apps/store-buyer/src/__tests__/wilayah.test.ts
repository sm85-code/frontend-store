import { describe, expect, it } from 'vitest'
import { KOSONG, pilih, resolveWilayah, type Kecamatan, type Provinsi } from '@/lib/wilayah'

const PROV: Provinsi[] = [
  ['32', 'Jawa Barat', [['32.73', 'Kota Bandung'], ['32.04', 'Kabupaten Bandung']]],
  ['51', 'Bali', [['51.71', 'Kota Denpasar']]],
]
const KEC: Kecamatan[] = [['32.73.01', 'Sukasari', [['32.73.01.1001', 'Sukarasa', '40152'], ['32.73.01.1002', 'Gegerkalong', '40153']]]]
const LENGKAP = { provinsi: '32', kota: '32.73', kecamatan: '32.73.01', desa: '32.73.01.1001' }

describe('pilih (cascade)', () => {
  it('clears every level below the one that changed', () => {
    expect(pilih(LENGKAP, 'provinsi', '51')).toEqual({ provinsi: '51', kota: '', kecamatan: '', desa: '' })
    expect(pilih(LENGKAP, 'kota', '32.04')).toEqual({ provinsi: '32', kota: '32.04', kecamatan: '', desa: '' })
    expect(pilih(LENGKAP, 'kecamatan', '32.73.02')).toEqual({ ...LENGKAP, kecamatan: '32.73.02', desa: '' })
    expect(pilih(LENGKAP, 'desa', '32.73.01.1002')).toEqual({ ...LENGKAP, desa: '32.73.01.1002' })
  })
})

describe('resolveWilayah', () => {
  it('turns codes into the names, postal code and village code the API stores', () => {
    expect(resolveWilayah(LENGKAP, PROV, KEC)).toEqual({
      provinsi: 'Jawa Barat', kota: 'Kota Bandung', kecamatan: 'Sukasari', kelurahan: 'Sukarasa', kode_pos: '40152', kode_wilayah: '32.73.01.1001',
    })
  })

  it('leaves unchosen levels empty, and never reports a postal code without a village', () => {
    expect(resolveWilayah(KOSONG, PROV, undefined)).toEqual({ provinsi: '', kota: '', kecamatan: '', kelurahan: '', kode_pos: '', kode_wilayah: '' })
    expect(resolveWilayah({ ...LENGKAP, desa: '' }, PROV, KEC)).toMatchObject({ kecamatan: 'Sukasari', kelurahan: '', kode_pos: '', kode_wilayah: '' })
  })

  it('ignores a district that does not belong to the loaded city', () => {
    expect(resolveWilayah({ ...LENGKAP, kecamatan: '32.04.99' }, PROV, KEC)).toMatchObject({ kecamatan: '', kelurahan: '', kode_pos: '' })
  })
})
