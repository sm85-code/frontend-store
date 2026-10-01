import { describe, expect, it } from 'vitest'
import { fmtRp, formatAlamat, toDateInput } from './format'
import { LABEL_PESANAN, TRANSISI_PENGIRIMAN, TRANSISI_PESANAN } from './status'

describe('fmtRp', () => {
  it('formats decimal strings and numbers as rupiah', () => {
    expect(fmtRp('65000.00')).toBe('Rp 65.000')
    expect(fmtRp(1250000)).toBe('Rp 1.250.000')
    expect(fmtRp(null)).toBe('Rp 0')
    expect(fmtRp('abc')).toBe('Rp 0')
  })
})

describe('toDateInput', () => {
  it('uses the local calendar date', () => {
    expect(toDateInput(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('status transitions', () => {
  it('only allows the backend order flow', () => {
    expect(TRANSISI_PESANAN.menunggu_pembayaran).toEqual(['dibayar', 'dibatalkan'])
    expect(TRANSISI_PESANAN.selesai).toEqual([])
    expect(TRANSISI_PESANAN.dibatalkan).toEqual([])
  })

  it('has a label for every order status and a terminal shipment state', () => {
    for (const status of Object.keys(TRANSISI_PESANAN)) expect(LABEL_PESANAN).toHaveProperty(status)
    expect(TRANSISI_PENGIRIMAN.diterima).toEqual([])
  })
})

describe('formatAlamat', () => {
  it('lists the street first, then village, district, city, province and zip', () => {
    expect(
      formatAlamat({ alamat: 'Jl. Cipaganti 5', kelurahan: 'Sukarasa', kecamatan: 'Sukasari', kota: 'Kota Bandung', provinsi: 'Jawa Barat', kodePos: '40152' }),
    ).toBe('Jl. Cipaganti 5, Sukarasa, Sukasari, Kota Bandung, Jawa Barat 40152')
  })

  it('skips empty levels (addresses saved before kecamatan/kelurahan existed)', () => {
    expect(formatAlamat({ alamat: 'Jl. Lama 1', kota: 'Bandung', provinsi: 'Jawa Barat', kodePos: '' })).toBe('Jl. Lama 1, Bandung, Jawa Barat')
    expect(formatAlamat({ alamat: ' Jl. X ', kelurahan: null, kecamatan: undefined, kota: '', provinsi: '', kodePos: '40152' })).toBe('Jl. X, 40152')
    expect(formatAlamat({})).toBe('')
  })
})
